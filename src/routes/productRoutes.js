const express = require("express");
const {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { uploadProductImages } = require("../config/cloudinary");

const router = express.Router();

router.get("/admin/all", protect, adminOnly, getAdminProducts);
router.get("/:id/related", getRelatedProducts);

router
  .route("/")
  .post(protect, adminOnly, uploadProductImages, createProduct)
  .get(getProducts);

router
  .route("/:id")
  .get(getProductById)
  .put(protect, adminOnly, uploadProductImages, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

module.exports = router;
