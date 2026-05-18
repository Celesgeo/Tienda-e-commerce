const asyncHandler = require("express-async-handler");
const Slide = require("../models/Slide");
const { cloudinary } = require("../config/cloudinary");

const createSlide = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("La imagen del slide es obligatoria");
  }

  const lastSlide = await Slide.findOne().sort({ order: -1 });
  const slide = await Slide.create({
    ...req.body,
    image: req.file.path,
    imagePublicId: req.file.filename,
    order: (lastSlide?.order || 0) + 1,
  });
  res.status(201).json({ success: true, data: slide });
});

const getSlides = asyncHandler(async (req, res) => {
  const query = {};
  if (req.query.active === "true") query.active = true;
  const slides = await Slide.find(query).sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: slides });
});

const updateSlide = asyncHandler(async (req, res) => {
  const slide = await Slide.findById(req.params.id);
  if (!slide) {
    res.status(404);
    throw new Error("Slide no encontrado");
  }

  if (req.file) {
    if (slide.imagePublicId) {
      await cloudinary.uploader.destroy(slide.imagePublicId);
    }
    req.body.image = req.file.path;
    req.body.imagePublicId = req.file.filename;
  }

  Object.assign(slide, req.body);
  const updated = await slide.save();
  res.status(200).json({ success: true, data: updated });
});

const reorderSlide = asyncHandler(async (req, res) => {
  const { direction } = req.body;
  const slide = await Slide.findById(req.params.id);
  if (!slide) {
    res.status(404);
    throw new Error("Slide no encontrado");
  }
  if (!["up", "down"].includes(direction)) {
    res.status(400);
    throw new Error("direction debe ser 'up' o 'down'");
  }

  const operator = direction === "up" ? "$lt" : "$gt";
  const sort = direction === "up" ? { order: -1 } : { order: 1 };
  const neighbor = await Slide.findOne({ order: { [operator]: slide.order } }).sort(sort);

  if (!neighbor) {
    return res.status(200).json({ success: true, data: slide, message: "No hay mas movimientos" });
  }

  const currentOrder = slide.order;
  slide.order = neighbor.order;
  neighbor.order = currentOrder;
  await slide.save();
  await neighbor.save();

  return res.status(200).json({ success: true, data: slide });
});

const bulkReorderSlides = asyncHandler(async (req, res) => {
  const { orderedIds } = req.body;
  if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
    res.status(400);
    throw new Error("orderedIds es obligatorio");
  }

  const updates = orderedIds.map((id, index) =>
    Slide.findByIdAndUpdate(id, { order: index + 1 }, { new: false })
  );
  await Promise.all(updates);

  const slides = await Slide.find().sort({ order: 1, createdAt: -1 });
  res.status(200).json({ success: true, data: slides });
});

const deleteSlide = asyncHandler(async (req, res) => {
  const slide = await Slide.findById(req.params.id);
  if (!slide) {
    res.status(404);
    throw new Error("Slide no encontrado");
  }
  if (slide.imagePublicId) {
    await cloudinary.uploader.destroy(slide.imagePublicId);
  }
  await slide.deleteOne();
  res.status(200).json({ success: true, message: "Slide eliminado" });
});

module.exports = { createSlide, getSlides, updateSlide, reorderSlide, bulkReorderSlides, deleteSlide };
