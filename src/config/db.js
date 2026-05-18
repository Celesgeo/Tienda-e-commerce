const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI?.trim();
  if (!mongoUri) {
    throw new Error("Falta MONGO_URI en variables de entorno");
  }

  const hostHint = mongoUri.replace(/\/\/([^:]+):([^@]+)@/, "//***:***@");
  // eslint-disable-next-line no-console
  console.log("Conectando MongoDB:", hostHint);

  const maxAttempts = 3;
  let lastError;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 20000,
      });
      // eslint-disable-next-line no-console
      console.log("MongoDB conectado → base:", mongoose.connection.name);
      return;
    } catch (error) {
      lastError = error;
      // eslint-disable-next-line no-console
      console.error(`MongoDB intento ${attempt}/${maxAttempts}:`, error.message);
      if (attempt < maxAttempts) {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }
  throw lastError;
};

module.exports = connectDB;
