/* eslint-disable  */
const mongoose = require('mongoose');

const globalTearDown = async () => {
  // await global.__MONGOOSE_CONN__.close();
  //await global.__MONGOOSE_DB__.close();
  await global.__MONGOD__.stop();
};

module.exports = globalTearDown;