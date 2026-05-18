const mongoose = require("mongoose");

const slideSchema = new mongoose.Schema(
  {
    image: { type: String, required: true },
    imagePublicId: { type: String, default: "" },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true, default: "" },
    active: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Slide", slideSchema);
