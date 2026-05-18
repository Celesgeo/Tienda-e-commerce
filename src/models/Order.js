const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    color: { type: String, default: "" },
    size: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    isGuest: { type: Boolean, default: false },
    customerName: { type: String, trim: true, default: "" },
    customerPhone: { type: String, trim: true, default: "" },
    customerAddress: { type: String, trim: true, default: "" },
    channel: {
      type: String,
      enum: ["whatsapp", "transfer", "mercado_pago", "other"],
      default: "whatsapp",
    },
    items: {
      type: [orderItemSchema],
      validate: [(value) => value.length > 0, "La orden debe tener productos"],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    paymentProvider: {
      type: String,
      enum: ["mercado_pago", "manual", "none"],
      default: "none",
    },
    paymentStatus: { type: String, default: "" },
    paymentStatusDetail: { type: String, default: "" },
    mercadoPagoPreferenceId: { type: String, default: "" },
    mercadoPagoPaymentId: { type: String, default: "" },
    stockDeducted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
