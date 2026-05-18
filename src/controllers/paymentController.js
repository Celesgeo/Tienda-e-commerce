const asyncHandler = require("express-async-handler");
const { MercadoPagoConfig, Payment, Preference } = require("mercadopago");
const Coupon = require("../models/Coupon");
const Order = require("../models/Order");
const {
  buildOrderItemsFromPayload,
  calculateDiscount,
  decrementStockForOrder,
} = require("../services/orderService");

const isPlaceholder = (value) => !value || /^tu_/i.test(value) || /^your_/i.test(value);

const getMercadoPagoClient = (res) => {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (isPlaceholder(accessToken)) {
    res.status(500);
    throw new Error("Configurá MERCADOPAGO_ACCESS_TOKEN en .env para habilitar Mercado Pago");
  }
  return new MercadoPagoConfig({ accessToken });
};

const publicBaseUrl = (value, fallback) => String(value || fallback).replace(/\/+$/, "");

const createMercadoPagoPreference = asyncHandler(async (req, res) => {
  const { items, couponCode, customerName, customerPhone, customerAddress } = req.body;

  if (!customerName?.trim() || !customerPhone?.trim()) {
    res.status(400);
    throw new Error("Nombre y teléfono son obligatorios");
  }

  if (!Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error("La orden debe incluir al menos un producto");
  }

  const client = getMercadoPagoClient(res);
  const { orderItems, preferenceItems, subtotal } = await buildOrderItemsFromPayload(items, res, {
    decrementStock: false,
  });

  let couponDoc = null;
  if (couponCode) {
    couponDoc = await Coupon.findOne({ code: couponCode.toUpperCase(), isActive: true });
    if (!couponDoc || couponDoc.expiresAt < new Date()) {
      res.status(400);
      throw new Error("Cupón inválido o expirado");
    }
    if (subtotal < couponDoc.minOrderAmount) {
      res.status(400);
      throw new Error("La orden no cumple el mínimo del cupón");
    }
  }

  const discount = calculateDiscount(couponDoc, subtotal);
  const total = Math.max(subtotal - discount, 0);
  if (total <= 0) {
    res.status(400);
    throw new Error("Mercado Pago requiere un total mayor a cero");
  }

  const order = await Order.create({
    user: null,
    isGuest: true,
    customerName: customerName.trim(),
    customerPhone: customerPhone.trim(),
    customerAddress: (customerAddress || "").trim(),
    channel: "mercado_pago",
    items: orderItems,
    subtotal,
    discount,
    total,
    coupon: couponDoc?._id,
    paymentProvider: "mercado_pago",
    paymentStatus: "preference_created",
    stockDeducted: false,
  });

  const preference = new Preference(client);
  const frontendUrl = publicBaseUrl(process.env.FRONTEND_URL, "http://localhost:5173");
  const backendUrl = publicBaseUrl(process.env.BACKEND_URL, `http://localhost:${process.env.PORT || 5000}`);

  const preferenceBody = {
    items:
      discount > 0
        ? [
            {
              id: String(order._id),
              title: `Pedido ${String(order._id).slice(-6)}`,
              quantity: 1,
              currency_id: "ARS",
              unit_price: Number(total),
            },
          ]
        : preferenceItems,
    external_reference: String(order._id),
    notification_url: `${backendUrl}/api/payments/mercadopago/webhook`,
    back_urls: {
      success: `${frontendUrl}/checkout?payment=success`,
      pending: `${frontendUrl}/checkout?payment=pending`,
      failure: `${frontendUrl}/checkout?payment=failure`,
    },
    auto_return: "approved",
    metadata: {
      order_id: String(order._id),
    },
    payer: {
      name: customerName.trim(),
      phone: {
        number: customerPhone.trim(),
      },
    },
    payment_methods: {
      installments: 12,
    },
  };

  const mpPreference = await preference.create({ body: preferenceBody });

  order.mercadoPagoPreferenceId = mpPreference.id || "";
  await order.save();

  res.status(201).json({
    success: true,
    data: {
      order,
      preferenceId: mpPreference.id,
      initPoint: mpPreference.init_point,
      sandboxInitPoint: mpPreference.sandbox_init_point,
    },
  });
});

const handleMercadoPagoWebhook = asyncHandler(async (req, res) => {
  const topic = req.query.topic || req.query.type || req.body?.topic || req.body?.type;
  const paymentId = req.query.id || req.body?.data?.id || req.body?.id;

  if (topic && topic !== "payment") {
    return res.status(200).json({ success: true });
  }

  if (!paymentId) {
    return res.status(200).json({ success: true });
  }

  const client = getMercadoPagoClient(res);
  const paymentClient = new Payment(client);
  const payment = await paymentClient.get({ id: paymentId });
  const orderId = payment.external_reference || payment.metadata?.order_id;

  if (!orderId) {
    return res.status(200).json({ success: true });
  }

  const order = await Order.findById(orderId);
  if (!order) {
    return res.status(200).json({ success: true });
  }

  order.mercadoPagoPaymentId = String(payment.id || paymentId);
  order.paymentStatus = payment.status || "";
  order.paymentStatusDetail = payment.status_detail || "";

  if (payment.status === "approved") {
    order.status = "paid";
    if (!order.stockDeducted) {
      await decrementStockForOrder(order);
      order.stockDeducted = true;
    }
  }

  if (["cancelled", "rejected", "refunded", "charged_back"].includes(payment.status)) {
    order.status = "cancelled";
  }

  await order.save();
  return res.status(200).json({ success: true });
});

module.exports = { createMercadoPagoPreference, handleMercadoPagoWebhook };
