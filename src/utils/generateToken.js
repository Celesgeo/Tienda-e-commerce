const jwt = require("jsonwebtoken");

const generateToken = (payload) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Falta JWT_SECRET en variables de entorno");
  }
  return jwt.sign(payload, secret, { expiresIn: "7d" });
};

module.exports = generateToken;
