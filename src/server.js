const loadEnv = require("./config/loadEnv");
loadEnv();

const app = require("./app");
const connectDB = require("./config/db");

const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

const startServer = async () => {
  if (!process.env.MONGO_URI?.trim()) {
    // eslint-disable-next-line no-console
    console.error("Falta MONGO_URI en Railway → Variables (no uses solo el .env local).");
  }

  app.listen(PORT, HOST, () => {
    // eslint-disable-next-line no-console
    console.log(`Servidor corriendo en http://${HOST}:${PORT}`);
  });

  try {
    await connectDB();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("MongoDB no conectó (el servidor HTTP sigue activo):", error.message);
    // eslint-disable-next-line no-console
    console.error("Revisá MONGO_URI en Railway y Network Access 0.0.0.0/0 en Atlas.");
  }
};

startServer();
