const express = require("express");
const {
  createOrder,
  createGuestOrder,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
} = require("../controllers/orderController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/guest", createGuestOrder);
router.post("/", protect, createOrder);
router.get("/mine", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.put("/:id/status", protect, adminOnly, updateOrderStatus);

module.exports = router;
