const path = require("path");
const dotenv = require("dotenv");

/** Carga `.env` desde la raíz del repo (independiente del cwd). */
function loadEnv() {
  const envPath = path.join(__dirname, "..", "..", ".env");
  dotenv.config({ path: envPath });
}

module.exports = loadEnv;
