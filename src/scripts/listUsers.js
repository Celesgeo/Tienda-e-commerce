/**
 * Lista usuarios de la app (colección users) con su rol.
 * Uso: npm run list-users
 */
const loadEnv = require("../config/loadEnv");
loadEnv();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const run = async () => {
  await connectDB();
  const users = await User.find().select("email name role createdAt").sort({ createdAt: -1 }).lean();
  if (!users.length) {
    // eslint-disable-next-line no-console
    console.log("No hay usuarios. Creá uno con: npm run create-admin -- email@x.com \"clave123\"");
  } else {
    // eslint-disable-next-line no-console
    console.log("Usuarios en esta base:\n");
    for (const u of users) {
      // eslint-disable-next-line no-console
      console.log(`  ${u.email}  |  rol: ${u.role}  |  ${u.name || ""}`);
    }
  }
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err.message || err);
  await mongoose.connection.close();
  process.exit(1);
});
