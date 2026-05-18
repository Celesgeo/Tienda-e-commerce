const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

/** Carga `.env` local si existe (en Railway las vars vienen del panel). */
function loadEnv() {
  const envPath = path.join(__dirname, "..", "..", ".env");
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  }
}

module.exports = loadEnv;
