import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link, useSearchParams } from "react-router-dom";
import { useStore } from "../context/StoreContext";
import { useStoreData } from "../hooks/useStoreData";
import useSEO from "../hooks/useSEO";
import api from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import { cartLineKey } from "../context/StoreContext";

const onlyDigits = (s) => String(s || "").replace(/\D/g, "");

const CheckoutPage = () => {
  const { cart, cartSubtotal, clearCart } = useStore();
  const { store } = useStoreData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [showTransfer, setShowTransfer] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orderSnapshot, setOrderSnapshot] = useState(null);
  const [searchParams] = useSearchParams();

  useSEO("Checkout | Tienda", "Finalizá tu compra.");

  useEffect(() => {
    const payment = searchParams.get("payment");
    if (payment === "success") toast.success("Pago aprobado. Gracias por tu compra.");
    if (payment === "pending") toast("Tu pago quedó pendiente de confirmación.");
    if (payment === "failure") toast.error("No se pudo completar el pago.");
  }, [searchParams]);

  const waDigits = onlyDigits(store?.whatsappPhone);
  const waLink = useMemo(() => {
    if (!waDigits) return "";
    const lines = cart.map(
      (item) =>
        `• ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""}${item.selectedSize ? ` talle ${item.selectedSize}` : ""} x${item.qty} — ${formatPrice(Number(item.price) * item.qty)}`
    );
    const text = [
      `Hola, quiero confirmar un pedido:`,
      ``,
      `Cliente: ${name}`,
      `Teléfono: ${phone}`,
      address ? `Dirección: ${address}` : null,
      ``,
      ...lines,
      ``,
      `Total: ${formatPrice(cartSubtotal)}`,
    ]
      .filter(Boolean)
      .join("\n");
    return `https://wa.me/${waDigits}?text=${encodeURIComponent(text)}`;
  }, [cart, cartSubtotal, name, phone, address, waDigits]);

  const persistGuestOrder = async (channel) => {
    const items = cart.map((item) => ({
      product: item._id,
      quantity: item.qty,
      color: item.selectedColor || "",
      size: item.selectedSize || "",
    }));
    const { data } = await api.post("/orders/guest", {
      items,
      customerName: name.trim(),
      customerPhone: phone.trim(),
      customerAddress: address.trim(),
      channel,
    });
    return data.data;
  };

  const handleWhatsApp = async () => {
    if (!cart.length) return toast.error("Tu carrito está vacío");
    if (!name.trim() || !phone.trim()) return toast.error("Nombre y teléfono son obligatorios");
    if (!waDigits) return toast.error("Configurá el WhatsApp de la tienda en el panel (Branding).");
    try {
      setSubmitting(true);
      await persistGuestOrder("whatsapp");
      window.open(waLink, "_blank", "noopener,noreferrer");
      clearCart();
      toast.success("Pedido registrado. Se abrió WhatsApp.");
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async () => {
    if (!cart.length) return toast.error("Tu carrito está vacío");
    if (!name.trim() || !phone.trim()) return toast.error("Nombre y teléfono son obligatorios");
    try {
      setSubmitting(true);
      await persistGuestOrder("transfer");
      setOrderSnapshot({
        lines: cart.map((c) => ({ ...c })),
        total: cartSubtotal,
      });
      setShowTransfer(true);
      clearCart();
      toast.success("Pedido registrado. Datos para transferencia abajo.");
    } catch (e) {
      toast.error(e.response?.data?.message || "No se pudo registrar el pedido");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMercadoPago = async () => {
    if (!cart.length) return toast.error("Tu carrito está vacío");
    if (!name.trim() || !phone.trim()) return toast.error("Nombre y teléfono son obligatorios");
    try {
      setSubmitting(true);
      const items = cart.map((item) => ({
        product: item._id,
        quantity: item.qty,
        color: item.selectedColor || "",
        size: item.selectedSize || "",
      }));
      const { data } = await api.post("/payments/mercadopago/preference", {
        items,
        customerName: name.trim(),
        customerPhone: phone.trim(),
        customerAddress: address.trim(),
      });
      const initPoint = data.data?.initPoint || data.data?.sandboxInitPoint;
      if (!initPoint) throw new Error("Mercado Pago no devolvió link de pago");
      clearCart();
      window.location.href = initPoint;
    } catch (e) {
      toast.error(e.response?.data?.message || e.message || "No se pudo iniciar Mercado Pago");
      setSubmitting(false);
    }
  };

  const summaryLines = orderSnapshot?.lines?.length ? orderSnapshot.lines : cart;
  const summaryTotal = orderSnapshot ? orderSnapshot.total : cartSubtotal;

  if (!cart.length && !showTransfer) {
    return (
      <section className="mx-auto max-w-lg rounded-3xl border border-zinc-200 bg-white p-10 text-center dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-zinc-600 dark:text-zinc-300">Tu carrito está vacío.</p>
        <Link to="/" className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white dark:bg-white dark:text-zinc-900">
          Ir a la tienda
        </Link>
      </section>
    );
  }

  return (
    <section className="grid gap-10 lg:grid-cols-2">
      <div className="rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm md:p-8 dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">Checkout</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">No necesitás crear cuenta. Completá tus datos y elegí cómo pagar.</p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Nombre</label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre y apellido"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Teléfono</label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Código área + número"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Dirección (opcional)</label>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none ring-zinc-900/10 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950 dark:text-white"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Entrega / referencia"
            />
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            disabled={submitting}
            onClick={handleWhatsApp}
            className="flex-1 rounded-full bg-emerald-600 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
          >
            Comprar por WhatsApp
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleTransfer}
            className="flex-1 rounded-full border border-zinc-300 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-800"
          >
            Transferencia bancaria
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={handleMercadoPago}
            className="flex-1 rounded-full bg-sky-600 py-3 text-sm font-semibold text-white transition hover:bg-sky-700 disabled:opacity-50"
          >
            Mercado Pago / Tarjetas
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-3xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Resumen</p>
        <div className="mt-4 space-y-3">
          {summaryLines.map((item) => (
            <div key={cartLineKey(item)} className="flex justify-between gap-4 text-sm">
              <span className="text-zinc-700 dark:text-zinc-200">
                {item.name} ×{item.qty}
                {(item.selectedColor || item.selectedSize) && (
                  <span className="block text-xs text-zinc-500">
                    {[item.selectedColor, item.selectedSize].filter(Boolean).join(" · ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 font-medium text-zinc-900 dark:text-white">
                {formatPrice(Number(item.price) * item.qty)}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-zinc-100 pt-4 text-lg font-bold text-zinc-900 dark:border-zinc-800 dark:text-white">
          Total: {formatPrice(summaryTotal)}
        </div>
      </aside>

      {showTransfer ? (
        <div className="col-span-full rounded-3xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-800 dark:bg-zinc-900/80">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Datos para transferencia</h2>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            {store?.paymentInstructions || "Enviá el comprobante por WhatsApp una vez acreditado el pago."}
          </p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-zinc-500">Titular</dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-white">{store?.bankHolder || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-zinc-500">Alias</dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-white">{store?.bankAlias || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs font-semibold uppercase text-zinc-500">CBU / CVU</dt>
              <dd className="mt-1 break-all font-mono text-sm text-zinc-900 dark:text-white">{store?.bankCbu || "—"}</dd>
            </div>
          </dl>
          {store?.qrPaymentUrl ? (
            <div className="mt-6">
              <p className="text-xs font-semibold uppercase text-zinc-500">QR</p>
              <img src={store.qrPaymentUrl} alt="QR pago" className="mt-2 h-48 w-48 rounded-xl border border-zinc-200 object-contain dark:border-zinc-700" />
            </div>
          ) : null}
          <Link to="/" className="mt-8 inline-block text-sm font-semibold text-zinc-900 underline dark:text-white">
            Volver a la tienda
          </Link>
        </div>
      ) : null}
    </section>
  );
};

export default CheckoutPage;
