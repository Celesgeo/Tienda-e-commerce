/**
 * Marca un usuario existente como administrador (MongoDB).
 *
 * Uso (desde la raíz del repo):
 *   npm run promote-admin -- admin@ejemplo.com
 */
const loadEnv = require("../config/loadEnv");
loadEnv();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const emailArg = process.argv[2];

const run = async () => {
  if (!emailArg) {
    // eslint-disable-next-line no-console
    console.error("Uso: npm run promote-admin -- <email>");
    process.exit(1);
  }

  const email = String(emailArg).trim().toLowerCase();
  await connectDB();

  const user = await User.findOne({ email });
  if (!user) {
    // eslint-disable-next-line no-console
    console.error(`No existe usuario con email: ${email}`);
    // eslint-disable-next-line no-console
    console.error("Registrate primero en la tienda o creá un admin con:");
    // eslint-disable-next-line no-console
    console.error(`  npm run create-admin -- ${email} "tu_contraseña"`);
    await mongoose.connection.close();
    process.exit(1);
  }

  user.role = "admin";
  await user.save();
  // eslint-disable-next-line no-console
  console.log(`Listo: ${email} ahora tiene rol "admin". Volvé a iniciar sesión en el panel.`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  await mongoose.connection.close();
  process.exit(1);
});
