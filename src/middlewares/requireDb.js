const mongoose = require("mongoose");

/** Evita timeouts de Mongoose si MongoDB aún no conectó en Railway. */
const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  return res.status(503).json({
    success: false,
    message:
      "Base de datos no conectada. En Railway agregá MONGO_URI y en Atlas permití IP 0.0.0.0/0.",
    dbState: mongoose.connection.readyState,
  });
};

module.exports = requireDb;
