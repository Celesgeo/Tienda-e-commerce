const asyncHandler = require("express-async-handler");
const Store = require("../models/Store");
const { cloudinary } = require("../config/cloudinary");

const getStore = asyncHandler(async (_req, res) => {
  let store = await Store.findOne();
  if (!store) {
    store = await Store.create({});
  }
  res.status(200).json({ success: true, data: store });
});

const upsertStore = asyncHandler(async (req, res) => {
  let store = await Store.findOne();
  if (!store) {
    store = await Store.create({});
  }

  const assignFile = async (field, urlKey, publicIdKey) => {
    const file = req.files?.[field]?.[0];
    if (!file) return;
    const prevId = store[publicIdKey];
    if (prevId) {
      try {
        await cloudinary.uploader.destroy(prevId);
      } catch {
        /* ignore */
      }
    }
    store[urlKey] = file.path;
    store[publicIdKey] = file.filename;
  };

  await assignFile("logo", "logo", "logoPublicId");
  await assignFile("banner", "bannerUrl", "bannerPublicId");
  await assignFile("qrPayment", "qrPaymentUrl", "qrPaymentPublicId");

  const textFields = [
    "name",
    "description",
    "heroTitle",
    "heroSubtitle",
    "primaryColor",
    "secondaryColor",
    "accentColor",
    "whatsappPhone",
    "instagramUrl",
    "bankAlias",
    "bankCbu",
    "bankHolder",
    "paymentInstructions",
  ];
  for (const key of textFields) {
    if (req.body[key] !== undefined) {
      store[key] = req.body[key];
    }
  }

  const updated = await store.save();
  res.status(200).json({ success: true, data: updated });
});

module.exports = { getStore, upsertStore };
