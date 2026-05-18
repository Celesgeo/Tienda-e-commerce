const express = require("express");
const {
  createSlide,
  getSlides,
  updateSlide,
  reorderSlide,
  bulkReorderSlides,
  deleteSlide,
} = require("../controllers/slideController");
const { protect, adminOnly } = require("../middlewares/authMiddleware");
const { upload } = require("../config/cloudinary");

const router = express.Router();

router.route("/").get(getSlides).post(protect, adminOnly, upload.single("image"), createSlide);
router.put("/reorder", protect, adminOnly, bulkReorderSlides);
router
  .route("/:id")
  .put(protect, adminOnly, upload.single("image"), updateSlide)
  .delete(protect, adminOnly, deleteSlide);
router.put("/:id/reorder", protect, adminOnly, reorderSlide);

module.exports = router;
