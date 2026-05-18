const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const { calculateDiscount, buildOrderItemsFromPayload } = require("../services/orderService");

const createOrder = asyncHandler(async (req, res) => {
  const { items, couponCode } = req.body;
  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("La orden debe incluir al menos un producto");
  }

  const { orderItems, subtotal } = await buildOrderItemsFromPayload(items, res);

  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!couponDoc || couponDoc.expiresAt < new Date()) {
      res.status(400);
      throw new Error("Cupón inválido o expirado");
    }
    if (subtotal < couponDoc.minOrderAmount) {
      res.status(400);
      throw new Error("La orden no cumple el mínimo del cupón");
    }
  }

  const discount = calculateDiscount(couponDoc, subtotal);
  const total = Math.max(subtotal - discount, 0);

  const order = await Order.create({
    user: req.user._id,
    isGuest: false,
    items: orderItems,
    subtotal,
    discount,
    total,
    coupon: couponDoc?._id,
    channel: "other",
    stockDeducted: true,
  });

  res.status(201).json({ success: true, data: order });
});

const createGuestOrder = asyncHandler(async (req, res) => {
  const { items, couponCode, customerName, customerPhone, customerAddress, channel } = req.body;

  if (!customerName?.trim() || !customerPhone?.trim()) {
    res.status(400);
    throw new Error("Nombre y teléfono son obligatorios");
  }

  if (!["whatsapp", "transfer"].includes(channel)) {
    res.status(400);
    throw new Error("Canal inválido");
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("La orden debe incluir al menos un producto");
  }

  const { orderItems, subtotal } = await buildOrderItemsFromPayload(items, res);

  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!couponDoc || couponDoc.expiresAt < new Date()) {
      res.status(400);
      throw new Error("Cupón inválido o expirado");
    }
    if (subtotal < couponDoc.minOrderAmount) {
      res.status(400);
      throw new Error("La orden no cumple el mínimo del cupón");
    }
  }

  const discount = calculateDiscount(couponDoc, subtotal);
  const total = Math.max(subtotal - discount, 0);

  const order = await Order.create({
    user: null,
    isGuest: true,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: (customerAddress || "").trim(),
    channel,
    items: orderItems,
    subtotal,
    discount,
    total,
    coupon: couponDoc?._id,
    stockDeducted: true,
  });

  res.status(201).json({ success: true, data: order });
});

const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product")
    .populate("coupon")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: orders });
});

const getAllOrders = asyncHandler(async (_req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product")
    .populate("coupon")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, data: orders });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Orden no encontrada");
  }
  order.status = status || order.status;
  const updated = await order.save();
  res.status(200).json({ success: true, data: updated });
});

module.exports = {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
};
