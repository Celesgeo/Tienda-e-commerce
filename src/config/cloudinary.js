const fs = require("fs");
const path = require("path");
const realCloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

const isPlaceholder = (value) => !value || /^tu_/i.test(value) || /^your_/i.test(value);
const hasCloudinaryConfig = [
  process.env.CLOUDINARY_CLOUD_NAME,
  process.env.CLOUDINARY_API_KEY,
  process.env.CLOUDINARY_API_SECRET,
].every((value) => !isPlaceholder(value));

let cloudinary = { uploader: { destroy: async () => null } };

const allowedExtensions = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const uploadsRoot = path.join(__dirname, "..", "..", "uploads");

const fileFilter = (_req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  if (allowedExtensions.has(ext)) return cb(null, true);
  return cb(new Error("Formato de imagen no permitido. Usá jpg, jpeg, png o webp."));
};

const makeLocalStorage = (folder) =>
  multer.diskStorage({
    destination(_req, _file, cb) {
      const destination = path.join(uploadsRoot, folder);
      fs.mkdirSync(destination, { recursive: true });
      cb(null, destination);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname || "").toLowerCase();
      const base =
        path
          .basename(file.originalname || "imagen", ext)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "")
          .slice(0, 40) || "imagen";
      cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}-${base}${ext}`);
    },
  });

const withLocalUrls = (middleware, folder) => (req, res, next) => {
  middleware(req, res, (err) => {
    if (err) return next(err);

    const assignLocalUrl = (file) => {
      if (!file) return;
      file.path = `/uploads/${folder}/${file.filename}`;
      file.filename = `local/${folder}/${file.filename}`;
    };

    if (req.file) assignLocalUrl(req.file);
    Object.values(req.files || {})
      .flat()
      .forEach(assignLocalUrl);

    return next();
  });
};

const makeCloudinaryStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder,
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    },
  });

let upload;
let uploadProductImages;
let uploadStoreFiles;

if (hasCloudinaryConfig) {
  realCloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  const destroy = realCloudinary.uploader.destroy.bind(realCloudinary.uploader);
  realCloudinary.uploader.destroy = (publicId, ...args) => {
    if (String(publicId || "").startsWith("local/")) return Promise.resolve(null);
    return destroy(publicId, ...args);
  };

  cloudinary = realCloudinary;

  const productStorage = makeCloudinaryStorage("ecommerce-products");
  const storeStorage = makeCloudinaryStorage("ecommerce-store");

  upload = multer({ storage: productStorage, fileFilter });
  uploadProductImages = multer({ storage: productStorage, fileFilter }).fields([
    { name: "image", maxCount: 1 },
    { name: "images", maxCount: 10 },
  ]);
  uploadStoreFiles = multer({ storage: storeStorage, fileFilter }).fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "qrPayment", maxCount: 1 },
  ]);
} else {
  const productLocalUpload = multer({
    storage: makeLocalStorage("ecommerce-products"),
    fileFilter,
  });
  const storeLocalUpload = multer({
    storage: makeLocalStorage("ecommerce-store"),
    fileFilter,
  });

  upload = {
    single: (field) => withLocalUrls(productLocalUpload.single(field), "ecommerce-products"),
  };
  uploadProductImages = withLocalUrls(
    productLocalUpload.fields([
      { name: "image", maxCount: 1 },
      { name: "images", maxCount: 10 },
    ]),
    "ecommerce-products"
  );
  uploadStoreFiles = withLocalUrls(
    storeLocalUpload.fields([
      { name: "logo", maxCount: 1 },
      { name: "banner", maxCount: 1 },
      { name: "qrPayment", maxCount: 1 },
    ]),
    "ecommerce-store"
  );
}

module.exports = { cloudinary, upload, uploadProductImages, uploadStoreFiles };
