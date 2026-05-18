const express = require("express");
const { getStore, upsertStore } = require("../controllers/storeController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { uploadStoreFiles } = require("../config/cloudinary");

const router = express.Router();

router.get("/", getStore);
router.put("/", protect, adminOnly, uploadStoreFiles, upsertStore);

module.exports = router;
