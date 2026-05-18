const asyncHandler = require("express-async-handler");
const Coupon = require("../models/Coupon");

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const getCoupons = asyncHandler(async (_req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: coupons });
});

const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Cupón no encontrado");
  }
  res.status(200).json({ success: true, data: coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!coupon) {
    res.status(404);
    throw new Error("Cupón no encontrado");
  }
  res.status(200).json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error("Cupón no encontrado");
  }
  await coupon.deleteOne();
  res.status(200).json({ success: true, message: "Cupón eliminado" });
});

module.exports = {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
