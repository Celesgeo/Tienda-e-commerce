const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("name, email y password son obligatorios");
  }

  const emailNorm = normalizeEmail(email);
  const exists = await User.findOne({ email: emailNorm });
  if (exists) {
    res.status(409);
    throw new Error("El email ya está registrado");
  }

  const user = await User.create({ name, email: emailNorm, password, role: "customer" });
  const token = generateToken({ id: user._id, role: user.role });

  res.status(201).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("email y password son obligatorios");
  }

  const emailNorm = normalizeEmail(email);
  const user = await User.findOne({ email: emailNorm });
  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error("Credenciales inválidas");
  }

  const token = generateToken({ id: user._id, role: user.role });
  res.status(200).json({
    success: true,
    data: {
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      token,
    },
  });
});

module.exports = { register, login };
