const mongoose = require("mongoose");

const productImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },
    stock: { type: Number, required: true, min: 0, default: 0 },
    imageUrl: { type: String, default: "" },
    imagePublicId: { type: String, default: "" },
    images: { type: [productImageSchema], default: [] },
    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    featured: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    isNewArrival: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
  },
  { timestamps: true }
);

productSchema.index({ featured: 1, active: 1 });
productSchema.index({ active: 1 });

module.exports = mongoose.model("Product", productSchema);
