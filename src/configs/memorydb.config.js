const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

const mongo = MongoMemoryServer.create();

const connectDB = async () => {
  const mongoServer = await mongo;
  const uri = mongoServer.getUri();

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

const disconnectDB = async () => {
  const mongoServer = await mongo;

  await mongoose.connection.close();
  await mongoServer.stop();
};

module.exports = {
  connectDB,
  disconnectDB,
};
