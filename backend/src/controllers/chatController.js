const { getChatResponse } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/helpers');

const chat = async (req, res, next) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return sendError(res, 'messages array is required.', 400);
    }

    // Limit history to last 10 exchanges to control token usage
    const trimmed = messages.slice(-10);

    const reply = await getChatResponse(trimmed);
    return sendSuccess(res, { reply });
  } catch (error) {
    next(error);
  }
};

module.exports = { chat };