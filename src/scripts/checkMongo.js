/**
 * Comprueba MONGO_URI y conexión a MongoDB (sin levantar el servidor HTTP).
 *
 * Uso: npm run check-mongo
 */
const loadEnv = require("../config/loadEnv");
loadEnv();

const mongoose = require("mongoose");

const states = {
  0: "desconectado",
  1: "conectado",
  2: "conectando",
  3: "desconectando",
};

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    // eslint-disable-next-line no-console
    console.error("❌ No hay MONGO_URI. Creá .env en la raíz con MONGO_URI (Atlas o local).");
    process.exit(1);
  }

  const safe = uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");
  // eslint-disable-next-line no-console
  console.log("URI (oculta contraseña):", safe);

  try {
    await mongoose.connect(uri);
    const st = mongoose.connection.readyState;
    // eslint-disable-next-line no-console
    console.log("✅ MongoDB:", states[st] || st);
    // eslint-disable-next-line no-console
    console.log("   Base:", mongoose.connection.name);
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("❌ No se pudo conectar:", err.message);
    process.exit(1);
  }
};

run();
