const Product = require("../models/Product");

const calculateDiscount = (coupon, subtotal) => {
  if (!coupon) return 0;
  if (coupon.discountType === "fixed") return Math.min(coupon.discountValue, subtotal);
  return (subtotal * coupon.discountValue) / 100;
};

const buildOrderItemsFromPayload = async (items, res, options = {}) => {
  const { decrementStock = true } = options;
  const orderItems = [];
  const preferenceItems = [];
  let subtotal = 0;

  for (const item of items) {
    const quantity = Number(item.quantity);
    const product = await Product.findById(item.product);
    if (!product) {
      res.status(404);
      throw new Error("Producto no encontrado en la orden");
    }
    if (!product.active) {
      res.status(400);
      throw new Error(`Producto no disponible: ${product.name}`);
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      res.status(400);
      throw new Error(`Cantidad inválida para ${product.name}`);
    }
    if (product.stock < quantity) {
      res.status(400);
      throw new Error(`Stock insuficiente para ${product.name}`);
    }

    if (decrementStock) {
      product.stock -= quantity;
      await product.save();
    }

    orderItems.push({
      product: product._id,
      quantity,
      unitPrice: product.price,
      color: item.color || "",
      size: item.size || "",
    });

    preferenceItems.push({
      id: String(product._id),
      title: product.name,
      description: product.description || product.name,
      picture_url: /^https?:\/\//i.test(product.imageUrl || "") ? product.imageUrl : undefined,
      quantity,
      currency_id: "ARS",
      unit_price: Number(product.price),
    });

    subtotal += product.price * quantity;
  }

  return { orderItems, preferenceItems, subtotal };
};

const decrementStockForOrder = async (order) => {
  for (const item of order.items || []) {
    const product = await Product.findById(item.product);
    if (!product) continue;
    product.stock = Math.max(0, Number(product.stock) - Number(item.quantity));
    await product.save();
  }
};

module.exports = { calculateDiscount, buildOrderItemsFromPayload, decrementStockForOrder };
