import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Connect to test database
beforeAll(async () => {
  const mongoUri = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/ai-project-manager-test';
  await mongoose.connect(mongoUri);
});

// Clear database and close connection after all tests
afterAll(async () => {
  const collections = await mongoose.connection.db.collections();
  for (const collection of collections) {
    await collection.deleteMany({});
  }
  await mongoose.connection.close();
}); 