/**
 * utils/seeder.js – Seeds sample data into MongoDB
 * Run: node src/utils/seeder.js
 */
 
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const connectDB  = require('../config/db');
const User       = require('../models/User');
const Complaint  = require('../models/Complaint');
const WasteCenter = require('../models/WasteCenter');
const AwarenessArticle = require('../models/AwarenessArticle');
 
const seed = async () => {
  await connectDB();
  console.log('🌱 Starting seed...');
 
  // Wipe existing data
  await Promise.all([
    User.deleteMany(),
    Complaint.deleteMany(),
    WasteCenter.deleteMany(),
    AwarenessArticle.deleteMany(),
  ]);
 
  // ── Users ──────────────────────────────────────────────────────────────
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@smartwaste.com',
    password: 'Admin@123',
    role: 'admin',
    isEmailVerified: true,
  });
 
  const regularUser = await User.create({
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'User@123',
    role: 'user',
    isEmailVerified: true,
    phone: '+919876543210',
    address: '12 Green Lane, Mumbai',
  });
 
  console.log('✅ Users seeded');
 
  // ── Waste Centers ──────────────────────────────────────────────────────
  await WasteCenter.insertMany([
    {
      name: 'Green Earth Recycling Hub',
      address: 'Sector 21, Dwarka, New Delhi',
      lat: 28.5921, lng: 77.0460,
      location: { type: 'Point', coordinates: [77.0460, 28.5921] },
      phone: '+91-11-23456789',
      operatingHours: 'Mon–Sat: 8:00 AM – 7:00 PM',
      acceptedWasteTypes: ['general', 'recyclable', 'ewaste'],
      city: 'New Delhi', state: 'Delhi', rating: 4.5,
    },
    {
      name: 'EcoWaste Processing Centre',
      address: 'Industrial Area, Andheri East, Mumbai',
      lat: 19.1136, lng: 72.8697,
      location: { type: 'Point', coordinates: [72.8697, 19.1136] },
      phone: '+91-22-98765432',
      operatingHours: 'Mon–Sun: 7:00 AM – 8:00 PM',
      acceptedWasteTypes: ['hazardous', 'ewaste', 'batteries'],
      city: 'Mumbai', state: 'Maharashtra', rating: 4.2,
    },
    {
      name: 'Swachh Bharat Collection Point',
      address: 'Koramangala, Bengaluru',
      lat: 12.9352, lng: 77.6245,
      location: { type: 'Point', coordinates: [77.6245, 12.9352] },
      phone: '+91-80-11223344',
      operatingHours: 'Mon–Sat: 9:00 AM – 6:00 PM',
      acceptedWasteTypes: ['general', 'organic', 'recyclable'],
      city: 'Bengaluru', state: 'Karnataka', rating: 4.0,
    },
    {
      name: 'Clean City E-Waste Depot',
      address: 'Salt Lake, Kolkata',
      lat: 22.5726, lng: 88.4372,
      location: { type: 'Point', coordinates: [88.4372, 22.5726] },
      operatingHours: 'Tue–Sun: 10:00 AM – 5:00 PM',
      acceptedWasteTypes: ['ewaste', 'recyclable'],
      city: 'Kolkata', state: 'West Bengal', rating: 3.8,
    },
  ]);
 
  console.log('✅ Waste centers seeded');
 
  // ── Complaints ─────────────────────────────────────────────────────────
  await Complaint.create([
    {
      title: 'Overflowing garbage bins near park',
      description: 'The garbage bins near Lodi Garden have been overflowing for 3 days. It is causing a health hazard and bad odour in the area.',
      location: { address: 'Lodi Garden, New Delhi', coordinates: { lat: 28.5931, lng: 77.2194 } },
      status: 'in_progress',
      priority: 'high',
      category: 'garbage_overflow',
      userId: regularUser._id,
      timeline: [
        { status: 'pending', message: 'Complaint filed successfully.' },
        { status: 'in_progress', message: 'Assigned to sanitation team.', updatedBy: adminUser._id },
      ],
    },
    {
      title: 'Illegal dumping on roadside',
      description: 'Construction waste is being illegally dumped on the roadside near the highway, blocking pedestrian movement.',
      location: { address: 'NH-8, Gurgaon', coordinates: { lat: 28.4595, lng: 77.0266 } },
      status: 'pending',
      priority: 'medium',
      category: 'illegal_dumping',
      userId: regularUser._id,
    },
  ]);
 
  console.log('✅ Complaints seeded');
 
  // ── Awareness Articles ─────────────────────────────────────────────────
  await AwarenessArticle.insertMany([
    {
      title: '10 Simple Ways to Reduce Household Waste',
      content: `Reducing household waste is one of the most impactful things you can do for the environment. 
      Start by switching to reusable shopping bags — this alone eliminates hundreds of plastic bags per year. 
      Composting kitchen scraps like vegetable peels and coffee grounds can cut your landfill contribution by up to 30%.
      Buy products with minimal packaging, and choose quality items that last longer over cheap disposables.
      Repurpose glass jars for storage, old t-shirts as cleaning rags, and cardboard boxes for organising.
      Plan your meals weekly to avoid food waste — a major source of methane in landfills.
      Donate unwanted clothes, electronics, and furniture instead of throwing them away.
      Fix appliances before replacing them; many repairs are simpler than you think.
      Switch to paperless billing and digital documents to cut paper waste.
      Carry a reusable water bottle and coffee cup to eliminate single-use plastics daily.
      Finally, educate your family — sustainable habits adopted in childhood last a lifetime.`,
      category: 'waste_reduction',
      tags: ['tips', 'household', 'beginner'],
      createdBy: adminUser._id,
      isPublished: true,
    },
    {
      title: 'The E-Waste Crisis: Why Your Old Phone Matters',
      content: `Electronic waste — or e-waste — is the fastest-growing waste stream in the world, generating 
      over 53 million metric tons annually. Your old smartphone, laptop, or television contains valuable 
      materials like gold, silver, and copper, but also toxic substances like lead, mercury, and cadmium.
      When e-waste ends up in landfills, these toxins leach into soil and groundwater, affecting communities 
      for decades. In developing countries, informal e-waste recycling exposes workers — including children — 
      to serious health risks without adequate protection.
      The solution starts with you. Before discarding electronics, consider refurbishment, donation, or 
      manufacturer take-back programs. Many brands now offer recycling incentives when you upgrade.
      Certified e-waste recyclers dismantle devices safely, recovering precious metals and neutralising 
      hazardous components. Look for R2 or e-Stewards certification when choosing a recycler.
      Extending the life of your device by even one year significantly reduces its environmental footprint. 
      Download our app and use the E-Waste Pickup feature to schedule a free, certified collection today.`,
      category: 'ewaste',
      tags: ['ewaste', 'electronics', 'recycling'],
      createdBy: adminUser._id,
      isPublished: true,
    },
    {
      title: 'Composting 101: Turn Kitchen Scraps into Garden Gold',
      content: `Composting is nature's way of recycling organic material into rich soil amendment. 
      Starting a compost pile is easier than most people think and requires no special equipment.
      You need a balance of "greens" (nitrogen-rich: fruit scraps, vegetable peels, coffee grounds, grass clippings) 
      and "browns" (carbon-rich: dry leaves, cardboard, paper, wood chips) in roughly a 1:3 ratio.
      Layer your materials, keep the pile moist but not soggy, and turn it every week or two for aeration.
      Within 2–3 months, you will have dark, crumbly compost ready to enrich your garden soil.
      Avoid adding meat, dairy, oily foods, or diseased plants to your compost — these attract pests and create odour.
      If you live in an apartment, vermicomposting (using worms in a bin) is a compact, odourless alternative 
      that works brilliantly on a balcony or even indoors.
      Finished compost improves soil structure, retains moisture, and feeds beneficial microorganisms — 
      reducing your need for chemical fertilisers and helping plants thrive naturally.`,
      category: 'composting',
      tags: ['composting', 'organic', 'garden', 'beginner'],
      createdBy: adminUser._id,
      isPublished: true,
    },
  ]);
 
  console.log('✅ Awareness articles seeded');
  console.log('\n🎉 Seed complete!');
  console.log('   Admin  → admin@smartwaste.com  / Admin@123');
  console.log('   User   → jane@example.com      / User@123');
 
  process.exit(0);
};
 
seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});