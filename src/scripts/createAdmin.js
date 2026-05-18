/**
 * Crea un usuario administrador o promueve a admin si el email ya existe.
 *
 * Uso (desde la raíz del repo):
 *   npm run create-admin -- mi@email.com "MiClaveSegura1"
 *   npm run create-admin -- mi@email.com "MiClaveSegura1" "Nombre visible"
 */
const loadEnv = require("../config/loadEnv");
loadEnv();

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");

const emailArg = process.argv[2];
const passwordArg = process.argv[3];
const nameArg = process.argv[4];

const run = async () => {
  if (!emailArg || !passwordArg) {
    // eslint-disable-next-line no-console
    console.error('Uso: npm run create-admin -- <email> "<contraseña>" [nombre]');
    // eslint-disable-next-line no-console
    console.error("Ejemplo: npm run create-admin -- celeste@mail.com \"MiPass123\"");
    process.exit(1);
  }

  const email = String(emailArg).trim().toLowerCase();
  const password = String(passwordArg);
  const name = (nameArg && String(nameArg).trim()) || "Administrador";

  if (password.length < 6) {
    // eslint-disable-next-line no-console
    console.error("La contraseña debe tener al menos 6 caracteres.");
    process.exit(1);
  }

  await connectDB();

  let user = await User.findOne({ email });
  if (user) {
    user.role = "admin";
    await user.save();
    // eslint-disable-next-line no-console
    console.log(`El usuario ${email} ya existía. Se asignó rol "admin".`);
    // eslint-disable-next-line no-console
    console.log("Iniciá sesión en el panel con tu contraseña actual (no se modificó).");
  } else {
    await User.create({ name, email, password, role: "admin" });
    // eslint-disable-next-line no-console
    console.log(`Usuario admin creado: ${email}`);
    // eslint-disable-next-line no-console
    console.log("Iniciá sesión en /login o /admin/login con ese email y contraseña.");
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
