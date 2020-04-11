/* eslint-disable */
import mongoose from 'mongoose';
const { MongoMemoryServer } = require('mongodb-memory-server');

const mongod = new MongoMemoryServer();

export async function connect(): Promise<void> {
  const uri = await mongod.getConnectionString();

  const mongooseOpts: mongoose.ConnectionOptions = {
    useNewUrlParser: false,
    autoReconnect: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  };

  await mongoose.connect(uri, mongooseOpts);
};

export async function closeDatabase(): Promise<void> {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};

export async function  clearDatabase(): Promise<void> {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany(collection);
  }
};