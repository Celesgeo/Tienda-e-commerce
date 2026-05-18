const express = require("express");
const {
  createMercadoPagoPreference,
  handleMercadoPagoWebhook,
} = require("../controllers/paymentController");

const router = express.Router();

router.post("/mercadopago/preference", createMercadoPagoPreference);
router.post("/mercadopago/webhook", handleMercadoPagoWebhook);

module.exports = router;
