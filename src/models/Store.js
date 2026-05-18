const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    name: { type: String, default: "TIENDA" },
    description: { type: String, default: "Moda, estilo y tendencias." },
    heroTitle: { type: String, default: "" },
    heroSubtitle: { type: String, default: "" },
    logo: { type: String, default: "" },
    logoPublicId: { type: String, default: "" },
    bannerUrl: { type: String, default: "" },
    bannerPublicId: { type: String, default: "" },
    primaryColor: { type: String, default: "#111111" },
    secondaryColor: { type: String, default: "#fafafa" },
    accentColor: { type: String, default: "#18181b" },
    whatsappPhone: { type: String, default: "" },
    instagramUrl: { type: String, default: "" },
    bankAlias: { type: String, default: "" },
    bankCbu: { type: String, default: "" },
    bankHolder: { type: String, default: "" },
    qrPaymentUrl: { type: String, default: "" },
    qrPaymentPublicId: { type: String, default: "" },
    paymentInstructions: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Store", storeSchema);
