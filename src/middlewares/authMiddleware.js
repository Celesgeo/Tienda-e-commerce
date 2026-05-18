const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/User");

const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401);
    throw new Error("No autorizado, token faltante");
  }

  const token = authHeader.split(" ")[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select("-password");

  if (!user) {
    res.status(401);
    throw new Error("Usuario no encontrado");
  }

  req.user = user;
  next();
});

const adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    throw new Error("Acceso denegado, se requiere rol admin");
  }
  next();
};

module.exports = { protect, adminOnly };
