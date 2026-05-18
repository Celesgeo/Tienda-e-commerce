const asyncHandler = require("express-async-handler");
const Category = require("../models/Category");

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: categories });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Categoría no encontrada");
  }
  res.status(200).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    res.status(404);
    throw new Error("Categoría no encontrada");
  }
  res.status(200).json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Categoría no encontrada");
  }
  await category.deleteOne();
  res.status(200).json({ success: true, message: "Categoría eliminada" });
});

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};
