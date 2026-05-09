/**
 * services/aiService.js
 * OpenAI-powered complaint category suggestion + solution tips.
 * Falls back gracefully if API key is not set.
 */

const logger = require('../utils/logger');

const CATEGORIES = [
  'garbage_overflow',
  'illegal_dumping',
  'littering',
  'hazardous_waste',
  'drainage_blockage',
  'other',
];

// ─── Shared OpenAI client (lazy-initialised once) ─────────────────────────────
let openai = null;
const getOpenAIClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    const { OpenAI } = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

// ─── System prompt for EcoBot chat ───────────────────────────────────────────
const CHAT_SYSTEM_PROMPT = `You are EcoBot, a friendly waste management assistant for a Smart Waste Management platform in India.

You help citizens with:
- Which bin or category a type of waste belongs to (garbage_overflow, illegal_dumping, littering, hazardous_waste, drainage_blockage, other)
- How to file a complaint on this platform (go to "File Complaint" in the navigation)
- E-waste disposal guidance (mobiles, laptops, tablets, TVs, fridges, washing machines, printers, batteries, cables)
- Finding e-waste drop-off centres near them (go to the "Map" page)
- Recycling tips and sustainability advice
- Tracking their filed complaints (go to "Track Complaint" in the navigation)
- Eco points — users earn points for filing resolved complaints

Accepted e-waste types on this platform: mobile phones, laptops, tablets, televisions, refrigerators, washing machines, printers, batteries, cables & accessories.
Pickup time slots available: morning, afternoon, evening.

Keep answers concise (2-4 sentences max). Be warm, practical, and action-oriented.
If asked something unrelated to waste management or this platform, politely redirect.
Never make up specific addresses or phone numbers.`;

/**
 * Use OpenAI to suggest a complaint category and actionable tips.
 * @param {string} title
 * @param {string} description
 * @returns {{ category: string, tips: string[] }}
 */
const getComplaintSuggestion = async (title, description) => {
  // Return mock result if no API key
  if (!process.env.OPENAI_API_KEY) {
    return getFallbackSuggestion(title, description);
  }

  try {
    const client = getOpenAIClient();

    const prompt = `
You are an expert waste management advisor. Analyze this waste complaint and respond ONLY with valid JSON.

Complaint Title: "${title}"
Description: "${description}"

Respond with exactly this JSON structure:
{
  "category": "<one of: ${CATEGORIES.join(', ')}>",
  "tips": ["<tip 1>", "<tip 2>", "<tip 3>"]
}

Tips should be practical steps citizens or authorities can take to resolve this issue.
`.trim();

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.4,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    const parsed = JSON.parse(raw);

    // Validate category is one we know
    if (!CATEGORIES.includes(parsed.category)) {
      parsed.category = 'other';
    }

    // Ensure tips is an array of strings
    parsed.tips = Array.isArray(parsed.tips) ? parsed.tips.slice(0, 3) : [];

    logger.info(`AI suggestion generated for: "${title}" → ${parsed.category}`);
    return parsed;
  } catch (error) {
    logger.warn('AI suggestion failed, using fallback:', error.message);
    return getFallbackSuggestion(title, description);
  }
};

/**
 * Multi-turn chat with the EcoBot waste assistant.
 * @param {Array<{role: 'user'|'assistant', content: string}>} messages
 * @returns {Promise<string>} assistant reply text
 */
const getChatResponse = async (messages) => {
  if (!process.env.OPENAI_API_KEY) {
    return getChatFallback(messages);
  }

  try {
    const client = getOpenAIClient();

    const response = await client.chat.completions.create({
      model: 'gpt-3.5-turbo',
      max_tokens: 200,
      temperature: 0.6,
      messages: [
        { role: 'system', content: CHAT_SYSTEM_PROMPT },
        ...messages,
      ],
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    logger.warn('EcoBot chat failed:', error.message);
    return "Sorry, I'm having trouble connecting right now. Please try again in a moment.";
  }
};

/**
 * Keyword-based fallback for chat when OpenAI is unavailable.
 */
const getChatFallback = (messages) => {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';

  if (last.includes('ewaste') || last.includes('e-waste') || last.includes('laptop') || last.includes('mobile') || last.includes('battery'))
    return "For e-waste like mobiles and laptops, use the **E-Waste** section to schedule a pickup, or visit the **Map** page to find a drop-off centre near you.";
  if (last.includes('file') || last.includes('report') || last.includes('complaint') || last.includes('garbage'))
    return "To report a waste issue, go to **File Complaint** in the navigation. You can attach a photo and your location for faster resolution.";
  if (last.includes('track') || last.includes('status') || last.includes('update'))
    return "Visit **Track Complaint** in the navigation to see real-time status updates and the full timeline for your filed complaints.";
  if (last.includes('point') || last.includes('eco point'))
    return "You earn **Eco Points** each time one of your complaints gets resolved. Check your total on your Profile page!";
  if (last.includes('centre') || last.includes('center') || last.includes('drop') || last.includes('map'))
    return "Open the **Map** page to see all e-waste drop-off centres near you, along with their accepted waste types and operating hours.";
  if (last.includes('recycle') || last.includes('bin') || last.includes('plastic') || last.includes('paper'))
    return "Dry waste like plastic and paper goes in the **recycling bin**. Wet waste like food scraps goes in the **compost bin**. Hazardous items like batteries need special e-waste disposal.";

  return "Hi! I'm **EcoBot**. I can help you with waste disposal, filing complaints, e-waste pickups, recycling tips, and more. What do you need help with?";
};

/**
 * Keyword-based fallback when OpenAI is unavailable.
 */
const getFallbackSuggestion = (title, description) => {
  const text = `${title} ${description}`.toLowerCase();

  let category = 'other';
  if (text.includes('overflow') || text.includes('garbage') || text.includes('bin'))
    category = 'garbage_overflow';
  else if (text.includes('dump') || text.includes('illegal'))
    category = 'illegal_dumping';
  else if (text.includes('litter') || text.includes('street'))
    category = 'littering';
  else if (text.includes('hazard') || text.includes('chemical') || text.includes('toxic'))
    category = 'hazardous_waste';
  else if (text.includes('drain') || text.includes('block') || text.includes('flood'))
    category = 'drainage_blockage';

  const tipsMap = {
    garbage_overflow: [
      'Report to the municipal sanitation department immediately.',
      'Avoid adding more waste until bins are cleared.',
      'Photograph the overflow for documentation.',
    ],
    illegal_dumping: [
      'Do not touch or disturb the dumped materials.',
      'Note the time and exact location for authorities.',
      'Check if hazardous materials are present before approaching.',
    ],
    littering: [
      'Contact local clean-up volunteers or NGOs.',
      'Place temporary warning signs if possible.',
      'Report to the local body for prompt clean-up.',
    ],
    hazardous_waste: [
      'Keep a safe distance and cordon off the area.',
      'Alert local fire or hazmat authorities immediately.',
      'Do not attempt to clean up without proper PPE.',
    ],
    drainage_blockage: [
      'Avoid pouring more water into blocked drains.',
      'Report to the municipal drainage department.',
      'Check for visible blockages that are safe to remove.',
    ],
    other: [
      'Document the issue with photos.',
      'Report to the nearest municipal office.',
      'Follow up after 48 hours if no action is taken.',
    ],
  };

  return { category, tips: tipsMap[category] || tipsMap.other };
};

module.exports = { getComplaintSuggestion, getChatResponse };