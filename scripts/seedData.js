const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tenant = require('../models/Tenant');
const User = require('../models/User');
const Note = require('../models/Note');

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data and drop any conflicting indexes
    await Note.deleteMany({});
    await User.deleteMany({});
    await Tenant.deleteMany({});
    
    // Drop any existing indexes that might conflict
    try {
      await User.collection.dropIndexes();
      console.log('📋 Dropped existing User indexes');
    } catch (error) {
      console.log('📋 No existing User indexes to drop');
    }
    
    console.log('📋 Cleared existing data');

    // Create tenants
    const acmeTenant = await Tenant.create({
      slug: 'acme',
      name: 'Acme Corporation',
      plan: 'free' // Start with free plan
    });

    const globexTenant = await Tenant.create({
      slug: 'globex',
      name: 'Globex Corporation',
      plan: 'free' // Start with free plan
    });

    console.log('🏢 Created tenants: Acme and Globex');

    // Create users with mandatory test accounts
    const users = [
      {
        email: 'admin@acme.test',
        password: 'password',
        role: 'admin',
        tenantId: acmeTenant._id
      },
      {
        email: 'user@acme.test',
        password: 'password',
        role: 'member',
        tenantId: acmeTenant._id
      },
      {
        email: 'admin@globex.test',
        password: 'password',
        role: 'admin',
        tenantId: globexTenant._id
      },
      {
        email: 'user@globex.test',
        password: 'password',
        role: 'member',
        tenantId: globexTenant._id
      }
    ];

    for (const userData of users) {
      await User.create(userData);
    }

    console.log('👥 Created mandatory test accounts:');
    console.log('   • admin@acme.test (Admin, Acme)');
    console.log('   • user@acme.test (Member, Acme)');
    console.log('   • admin@globex.test (Admin, Globex)');
    console.log('   • user@globex.test (Member, Globex)');
    console.log('   • All passwords: password');

    // Create some sample notes for testing
    const acmeUser = await User.findOne({ email: 'user@acme.test' });
    const globexUser = await User.findOne({ email: 'user@globex.test' });

    const sampleNotes = [
      {
        title: 'Welcome to Acme',
        content: 'This is your first note in Acme Corporation. Feel free to edit or delete it.',
        tenantId: acmeTenant._id,
        createdBy: acmeUser._id
      },
      {
        title: 'Meeting Notes',
        content: 'Quarterly review meeting scheduled for next week.',
        tenantId: acmeTenant._id,
        createdBy: acmeUser._id
      },
      {
        title: 'Welcome to Globex',
        content: 'This is your first note in Globex Corporation. Feel free to edit or delete it.',
        tenantId: globexTenant._id,
        createdBy: globexUser._id
      }
    ];

    for (const noteData of sampleNotes) {
      await Note.create(noteData);
    }

    console.log('📝 Created sample notes for testing');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   • 2 Tenants created (Acme: ${acmeTenant.slug}, Globex: ${globexTenant.slug})`);
    console.log('   • 4 Test accounts created (all with password: password)');
    console.log('   • 3 Sample notes created');
    console.log('\n🔗 Test the API:');
    console.log('   POST http://localhost:3000/api/auth/login');
    console.log('   Body: { "email": "admin@acme.test", "password": "password" }');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    process.exit();
  }
};

// Run the seed function
const run = async () => {
  await connectDB();
  await seedData();
};

run();