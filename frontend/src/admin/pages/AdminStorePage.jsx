import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";

const emptyForm = {
  name: "",
  description: "",
  heroTitle: "",
  heroSubtitle: "",
  whatsappPhone: "",
  instagramUrl: "",
  primaryColor: "#111111",
  secondaryColor: "#fafafa",
  accentColor: "#18181b",
  bankAlias: "",
  bankCbu: "",
  bankHolder: "",
  paymentInstructions: "",
  logoFile: null,
  bannerFile: null,
  qrFile: null,
};

const AdminStorePage = () => {
  const { pathname } = useLocation();
  const isBrandingRoute = pathname.includes("/admin/branding");
  const [form, setForm] = useState(emptyForm);
  const [logoPreview, setLogoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [qrPreview, setQrPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState("desktop");

  useSEO(
    isBrandingRoute ? "Branding | Admin" : "Configuración | Admin",
    "Nombre, colores, hero, redes y datos de pago"
  );

  useEffect(() => {
    const fetchStore = async () => {
      try {
        setLoading(true);
        const response = await api.get("/store");
        const store = response.data.data || {};
        setForm({
          ...emptyForm,
          name: store.name || "",
          description: store.description || "",
          heroTitle: store.heroTitle || "",
          heroSubtitle: store.heroSubtitle || "",
          whatsappPhone: store.whatsappPhone || "",
          instagramUrl: store.instagramUrl || "",
          primaryColor: store.primaryColor || "#111111",
          secondaryColor: store.secondaryColor || "#fafafa",
          accentColor: store.accentColor || "#18181b",
          bankAlias: store.bankAlias || "",
          bankCbu: store.bankCbu || "",
          bankHolder: store.bankHolder || "",
          paymentInstructions: store.paymentInstructions || "",
        });
        setLogoPreview(store.logo || "");
        setBannerPreview(store.bannerUrl || "");
        setQrPreview(store.qrPaymentUrl || "");
      } catch {
        toast.error("No se pudo cargar la tienda");
      } finally {
        setLoading(false);
      }
    };
    fetchStore();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      const data = new FormData();
      data.append("name", form.name);
      data.append("description", form.description);
      data.append("heroTitle", form.heroTitle);
      data.append("heroSubtitle", form.heroSubtitle);
      data.append("whatsappPhone", form.whatsappPhone);
      data.append("instagramUrl", form.instagramUrl);
      data.append("primaryColor", form.primaryColor);
      data.append("secondaryColor", form.secondaryColor);
      data.append("accentColor", form.accentColor);
      data.append("bankAlias", form.bankAlias);
      data.append("bankCbu", form.bankCbu);
      data.append("bankHolder", form.bankHolder);
      data.append("paymentInstructions", form.paymentInstructions);
      if (form.logoFile) data.append("logo", form.logoFile);
      if (form.bannerFile) data.append("banner", form.bannerFile);
      if (form.qrFile) data.append("qrPayment", form.qrFile);

      await api.put("/store", data, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Cambios guardados");
      window.dispatchEvent(new Event("tienda-store-updated"));
      setForm((prev) => ({ ...prev, logoFile: null, bannerFile: null, qrFile: null }));
      const refreshed = await api.get("/store");
      const store = refreshed.data.data || {};
      setLogoPreview(store.logo || "");
      setBannerPreview(store.bannerUrl || "");
      setQrPreview(store.qrPaymentUrl || "");
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-48 max-w-2xl rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <section className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl">
          {isBrandingRoute ? "Branding y apariencia" : "Configuración de tienda"}
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Estos datos alimentan la tienda pública, el checkout y los mensajes de WhatsApp.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-10">
        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Identidad</h2>
          <div className="mt-4 grid gap-4">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Nombre de la tienda</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Descripción corta</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Hero (home)</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Título principal</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.heroTitle}
                onChange={(e) => setForm((p) => ({ ...p, heroTitle: e.target.value }))}
                placeholder="Nueva colección"
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Subtítulo</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.heroSubtitle}
                onChange={(e) => setForm((p) => ({ ...p, heroSubtitle: e.target.value }))}
                placeholder="Envío gratis en compras mayores a…"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Logo y banner</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-zinc-500">Logo</p>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-900"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setForm((p) => ({ ...p, logoFile: file || null }));
                  if (file) setLogoPreview(URL.createObjectURL(file));
                }}
              />
              {logoPreview ? (
                <img src={logoPreview} alt="" className="mt-3 h-24 w-24 rounded-2xl object-cover ring-1 ring-black/5 dark:ring-white/10" />
              ) : null}
            </div>
            <div>
              <p className="mb-2 text-xs text-zinc-500">Banner</p>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-900"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setForm((p) => ({ ...p, bannerFile: file || null }));
                  if (file) setBannerPreview(URL.createObjectURL(file));
                }}
              />
              {bannerPreview ? (
                <img src={bannerPreview} alt="" className="mt-3 h-24 w-full max-w-xs rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10" />
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Colores del tema</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ["primaryColor", "Texto / UI"],
              ["secondaryColor", "Fondo"],
              ["accentColor", "Acento"],
            ].map(([key, label]) => (
              <label key={key} className="block text-sm">
                <span className="mb-1 block text-xs font-medium text-zinc-500">{label}</span>
                <input
                  type="color"
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="mt-1 h-12 w-full cursor-pointer rounded-lg border border-zinc-200 dark:border-zinc-700"
                />
              </label>
            ))}
          </div>
          <div className="mt-6 flex gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode("desktop")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                previewMode === "desktop" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              Vista desktop
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode("mobile")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                previewMode === "mobile" ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" : "border border-zinc-200 dark:border-zinc-700"
              }`}
            >
              Vista mobile
            </button>
          </div>
          <div
            className={`mt-4 rounded-2xl border border-zinc-100 p-6 shadow-inner dark:border-zinc-800 ${
              previewMode === "mobile" ? "max-w-xs" : ""
            }`}
            style={{ backgroundColor: form.secondaryColor, color: form.primaryColor }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Preview</p>
            <h3 className="mt-2 text-xl font-bold">{form.name || "Tu marca"}</h3>
            <p className="mt-1 text-sm opacity-80">{form.description || "Descripción"}</p>
            <button
              type="button"
              className="mt-4 rounded-full px-5 py-2 text-xs font-bold text-white shadow-lg"
              style={{ backgroundColor: form.accentColor }}
            >
              Comprar ahora
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Redes y WhatsApp</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">WhatsApp (con código país, sin +)</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.whatsappPhone}
                onChange={(e) => setForm((p) => ({ ...p, whatsappPhone: e.target.value }))}
                placeholder="5491122334455"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Instagram (URL)</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.instagramUrl}
                onChange={(e) => setForm((p) => ({ ...p, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/tu_tienda"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Transferencia bancaria</h2>
          <p className="mt-1 text-xs text-zinc-500">Se muestran en el checkout al elegir transferencia.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Alias</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.bankAlias}
                onChange={(e) => setForm((p) => ({ ...p, bankAlias: e.target.value }))}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-xs font-medium text-zinc-500">CBU / CVU</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.bankCbu}
                onChange={(e) => setForm((p) => ({ ...p, bankCbu: e.target.value }))}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Titular de la cuenta</span>
              <input
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.bankHolder}
                onChange={(e) => setForm((p) => ({ ...p, bankHolder: e.target.value }))}
              />
            </label>
            <label className="block text-sm md:col-span-2">
              <span className="mb-1 block text-xs font-medium text-zinc-500">Instrucciones para el cliente</span>
              <textarea
                className="min-h-24 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                value={form.paymentInstructions}
                onChange={(e) => setForm((p) => ({ ...p, paymentInstructions: e.target.value }))}
                placeholder="Enviá el comprobante por WhatsApp con el número de pedido."
              />
            </label>
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-medium text-zinc-500">QR de pago (imagen)</p>
              <input
                type="file"
                accept="image/*"
                className="text-sm text-zinc-600 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white dark:text-zinc-300 dark:file:bg-white dark:file:text-zinc-900"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  setForm((p) => ({ ...p, qrFile: file || null }));
                  if (file) setQrPreview(URL.createObjectURL(file));
                }}
              />
              {qrPreview ? (
                <img src={qrPreview} alt="" className="mt-3 h-40 w-40 rounded-xl object-contain ring-1 ring-black/5 dark:ring-white/10" />
              ) : null}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {saving ? "Guardando…" : "Guardar cambios"}
        </button>
      </form>
    </section>
  );
};

export default AdminStorePage;
