import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import { connectDB } from './config/db.js';

const seedUsers = async () => {
  try {
    await connectDB();
    
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create sample users
    const users = [
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: 'admin',
        status: 'active'
      },
      {
        username: 'manager',
        email: 'manager@example.com',
        password: 'manager123',
        role: 'manager',
        status: 'active'
      },
      {
        username: 'johnuser',
        email: 'john@example.com',
        password: 'user123',
        role: 'user',
        status: 'active'
      },
      {
        username: 'janeuser',
        email: 'jane@example.com',
        password: 'user123',
        role: 'user',
        status: 'active'
      },
      {
        username: 'bobmanager',
        email: 'bob@example.com',
        password: 'manager123',
        role: 'manager',
        status: 'active'
      },
      {
        username: 'inactiveuser',
        email: 'inactive@example.com',
        password: 'user123',
        role: 'user',
        status: 'inactive'
      }
    ];

    // Hash passwords and create users
    const createdUsers = [];
    for (const userData of users) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      const savedUser = await user.save();
      createdUsers.push(savedUser);
      console.log(`Created user: ${savedUser.username} (${savedUser.email})`);
    }

    // Set audit fields for some users
    const adminUser = createdUsers.find(u => u.role === 'admin');
    if (adminUser) {
      await User.updateMany(
        { _id: { $ne: adminUser._id } },
        { 
          createdBy: adminUser._id,
          updatedBy: adminUser._id
        }
      );
    }

    console.log('Database seeded successfully!');
    console.log('\nSample login credentials:');
    console.log('Admin: admin@example.com / admin123');
    console.log('Manager: manager@example.com / manager123');
    console.log('User: john@example.com / user123');
    console.log('User: jane@example.com / user123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
  }
};

// Run the seed function
seedUsers();
