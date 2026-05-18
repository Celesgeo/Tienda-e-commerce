const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const couponRoutes = require("./routes/couponRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const storeRoutes = require("./routes/storeRoutes");
const slideRoutes = require("./routes/slideRoutes");
const { notFound, errorHandler } = require("./middlewares/errorMiddleware");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const isLocalDevOrigin = (origin) =>
  process.env.NODE_ENV !== "production" &&
  origin &&
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (isLocalDevOrigin(origin)) return callback(null, true);
      if (!allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origen no permitido por CORS"));
    },
    credentials: true,
  })
);
app.use(helmet());
app.use(
  "/api",
  rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
    max: Number(process.env.RATE_LIMIT_MAX || 200),
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: "Demasiadas peticiones, intenta más tarde." },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  const dbReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    ok: true,
    message: "API funcionando",
    db: dbReady ? "connected" : "disconnected",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/slides", slideRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
