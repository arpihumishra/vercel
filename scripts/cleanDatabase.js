const mongoose = require('mongoose');
const dotenv = require('dotenv');

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

const cleanDatabase = async () => {
  try {
    console.log('🧹 Starting database cleanup...');

    // Get database instance
    const db = mongoose.connection.db;
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log(`📋 Found ${collections.length} collections`);

    // Drop all collections
    for (const collection of collections) {
      await db.dropCollection(collection.name);
      console.log(`🗑️ Dropped collection: ${collection.name}`);
    }

    console.log('✅ Database cleanup completed successfully!');
    console.log('💡 You can now run: npm run seed');

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
  } finally {
    process.exit();
  }
};

// Run the cleanup function
const run = async () => {
  await connectDB();
  await cleanDatabase();
};

run();