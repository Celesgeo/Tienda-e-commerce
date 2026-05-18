const express = require("express");
const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
} = require("../controllers/couponController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router
  .route("/")
  .post(protect, adminOnly, createCoupon)
  .get(protect, adminOnly, getCoupons);

router
  .route("/:id")
  .get(protect, adminOnly, getCouponById)
  .put(protect, adminOnly, updateCoupon)
  .delete(protect, adminOnly, deleteCoupon);

module.exports = router;
