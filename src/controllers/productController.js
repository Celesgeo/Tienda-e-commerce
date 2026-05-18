const asyncHandler = require("express-async-handler");
const Product = require("../models/Product");
const Category = require("../models/Category");
const { cloudinary } = require("../config/cloudinary");

const parseJsonArray = (val) => {
  if (Array.isArray(val)) return val.map(String).filter(Boolean);
  if (typeof val === "string" && val.trim()) {
    try {
      const p = JSON.parse(val);
      return Array.isArray(p) ? p.map(String).filter(Boolean) : [];
    } catch {
      return [];
    }
  }
  return [];
};

const parseBool = (v, defaultVal = false) => {
  if (v === true || v === "true") return true;
  if (v === false || v === "false") return false;
  return defaultVal;
};

const destroyIfPresent = async (publicId) => {
  if (publicId) {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch {
      /* ignore */
    }
  }
};

const getProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find({ active: true })
    .populate("category")
    .sort({ featured: -1, createdAt: -1 });
  res.status(200).json({ success: true, data: products });
});

const getAdminProducts = asyncHandler(async (_req, res) => {
  const products = await Product.find().populate("category").sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: products });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  if (!product.active) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  res.status(200).json({ success: true, data: product });
});

const getRelatedProducts = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }
  const related = await Product.find({
    _id: { $ne: product._id },
    category: product.category,
    active: true,
  })
    .populate("category")
    .limit(8)
    .sort({ featured: -1, createdAt: -1 });
  res.status(200).json({ success: true, data: related });
});

const createProduct = asyncHandler(async (req, res) => {
  const { category } = req.body;
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    res.status(400);
    throw new Error("Categoría inválida");
  }

  const colors = parseJsonArray(req.body.colors);
  const sizes = parseJsonArray(req.body.sizes);
  const featured = parseBool(req.body.featured, false);
  const active = parseBool(req.body.active, true);
  const isNewArrival = parseBool(req.body.isNewArrival, false);
  const isOnSale = parseBool(req.body.isOnSale, false);
  const compareAtPrice =
    req.body.compareAtPrice != null && req.body.compareAtPrice !== ""
      ? Number(req.body.compareAtPrice)
      : null;

  const gallery =
    req.files?.images?.map((f) => ({ url: f.path, publicId: f.filename })) || [];

  let imageUrl = "";
  let imagePublicId = "";
  if (req.files?.image?.[0]) {
    imageUrl = req.files.image[0].path;
    imagePublicId = req.files.image[0].filename;
  } else if (gallery.length) {
    imageUrl = gallery[0].url;
    imagePublicId = gallery[0].publicId;
  }

  if (!imageUrl) {
    res.status(400);
    throw new Error("Imagen principal requerida (image o galería)");
  }

  const images = gallery.filter((img) => img.publicId !== imagePublicId);

  const product = await Product.create({
    name: req.body.name,
    description: req.body.description || "",
    price: Number(req.body.price),
    compareAtPrice: Number.isFinite(compareAtPrice) ? compareAtPrice : null,
    stock: Number(req.body.stock),
    category,
    colors,
    sizes,
    featured,
    active,
    isNewArrival,
    isOnSale,
    imageUrl,
    imagePublicId,
    images,
  });

  res.status(201).json({ success: true, data: product });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  if (req.body.category) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      res.status(400);
      throw new Error("Categoría inválida");
    }
  }

  if (req.body.name != null) product.name = req.body.name;
  if (req.body.description != null) product.description = req.body.description;
  if (req.body.price != null) product.price = Number(req.body.price);
  if (req.body.stock != null) product.stock = Number(req.body.stock);
  if (req.body.category != null) product.category = req.body.category;
  if (req.body.colors != null) product.colors = parseJsonArray(req.body.colors);
  if (req.body.sizes != null) product.sizes = parseJsonArray(req.body.sizes);
  if (req.body.featured != null) product.featured = parseBool(req.body.featured, product.featured);
  if (req.body.active != null) product.active = parseBool(req.body.active, product.active);
  if (req.body.isNewArrival != null) product.isNewArrival = parseBool(req.body.isNewArrival, product.isNewArrival);
  if (req.body.isOnSale != null) product.isOnSale = parseBool(req.body.isOnSale, product.isOnSale);
  if (req.body.compareAtPrice !== undefined) {
    product.compareAtPrice =
      req.body.compareAtPrice === "" || req.body.compareAtPrice == null
        ? null
        : Number(req.body.compareAtPrice);
  }

  if (req.files?.image?.[0]) {
    if (product.imagePublicId) await destroyIfPresent(product.imagePublicId);
    product.imageUrl = req.files.image[0].path;
    product.imagePublicId = req.files.image[0].filename;
  }

  if (req.files?.images?.length) {
    for (const img of req.files.images) {
      product.images.push({ url: img.path, publicId: img.filename });
    }
  }

  if (parseBool(req.body.clearGallery, false)) {
    for (const img of product.images) {
      await destroyIfPresent(img.publicId);
    }
    product.images = [];
  }

  const removeIds = parseJsonArray(req.body.removeImagePublicIds);
  if (removeIds.length) {
    const next = [];
    for (const img of product.images) {
      if (removeIds.includes(img.publicId)) {
        await destroyIfPresent(img.publicId);
      } else {
        next.push(img);
      }
    }
    product.images = next;
  }

  const updated = await product.save();
  const populated = await Product.findById(updated._id).populate("category");
  res.status(200).json({ success: true, data: populated });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error("Producto no encontrado");
  }

  if (product.imagePublicId) await destroyIfPresent(product.imagePublicId);
  for (const img of product.images) {
    await destroyIfPresent(img.publicId);
  }

  await product.deleteOne();
  res.status(200).json({ success: true, message: "Producto eliminado" });
});

module.exports = {
  createProduct,
  getProducts,
  getAdminProducts,
  getProductById,
  getRelatedProducts,
  updateProduct,
  deleteProduct,
};
