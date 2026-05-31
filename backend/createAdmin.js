require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');

    const adminEmail = 'admin@smartwaste.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        await existingAdmin.save();
        console.log('Existing user upgraded to admin.');
      } else {
        console.log('Admin user already exists.');
      }
    } else {
      const admin = new User({
        name: 'System Administrator',
        email: adminEmail,
        password: 'adminpassword123', // Model will hash this before saving
        role: 'admin',
        isEmailVerified: true
      });
      await admin.save();
      console.log('Admin user created successfully.');
      console.log('Email: admin@smartwaste.com');
      console.log('Password: adminpassword123');
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
