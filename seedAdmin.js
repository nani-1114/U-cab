const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for seeding');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ucab.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      name: 'System Admin',
      email: adminEmail,
      phone: '0000000000',
      password: adminPassword,
      role: 'admin',
    });

    console.log('Admin seeded successfully');
    process.exit();
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
