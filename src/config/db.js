const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error("Falta MONGO_URI en variables de entorno");
  }

  await mongoose.connect(mongoUri);
  // eslint-disable-next-line no-console
  console.log("MongoDB conectado");
};

module.exports = connectDB;
