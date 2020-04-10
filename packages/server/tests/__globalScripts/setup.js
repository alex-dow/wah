/* eslint-disable */
const { default: MongoMemoryServer } = require('mongodb-memory-server');
const mongod = new MongoMemoryServer({ autoStart: false });
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;


const globalSetup = async () => {
  console.log('--');
  console.log('Staring mongod');
  await mongod.start();
  process.env.MONGO_URL = await mongod.getConnectionString();

  console.log('MongoD URL:', process.env.MONGO_URL);

  global.__MONGOD__ = mongod;

  console.log('Starting Mongoose connection');
  global.__MONGOOSE_CONN__ = await mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    keepAlive: 1
  });

  console.log('Mongoose:', global.__MONGOOSE_CONN__);

  // global.__MONGOOSE_DB__ = await global.__MONGOOSE_CONN__.db('wahtest');
};

module.exports = globalSetup;