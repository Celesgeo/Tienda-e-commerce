import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";

const initialForm = {
  code: "",
  discountType: "percentage",
  discountValue: 10,
  minOrderAmount: 0,
  expiresAt: "",
  isActive: true,
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  useSEO("Cupones Admin | Tienda", "Gestion de cupones");

  const fetchCoupons = async () => {
    const response = await api.get("/coupons");
    setCoupons(response.data.data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCoupons();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = { ...form, discountValue: Number(form.discountValue), minOrderAmount: Number(form.minOrderAmount) };
      if (editingId) {
        await api.put(`/coupons/${editingId}`, payload);
        toast.success("Cupon actualizado");
      } else {
        await api.post("/coupons", payload);
        toast.success("Cupon creado");
      }
      setForm(initialForm);
      setEditingId("");
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo guardar cupon");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/coupons/${id}`);
    toast.success("Cupon eliminado");
    fetchCoupons();
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold">Gestion de cupones</h1>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 md:grid-cols-3">
        <input className="rounded-lg border border-zinc-200 p-2" placeholder="Codigo" value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value }))} required />
        <select className="rounded-lg border border-zinc-200 p-2" value={form.discountType} onChange={(e) => setForm((p) => ({ ...p, discountType: e.target.value }))}>
          <option value="percentage">Porcentaje</option>
          <option value="fixed">Monto fijo</option>
        </select>
        <input type="number" className="rounded-lg border border-zinc-200 p-2" placeholder="Valor descuento" value={form.discountValue} onChange={(e) => setForm((p) => ({ ...p, discountValue: e.target.value }))} required />
        <input type="number" className="rounded-lg border border-zinc-200 p-2" placeholder="Minimo compra" value={form.minOrderAmount} onChange={(e) => setForm((p) => ({ ...p, minOrderAmount: e.target.value }))} />
        <input type="date" className="rounded-lg border border-zinc-200 p-2" value={form.expiresAt?.slice(0, 10)} onChange={(e) => setForm((p) => ({ ...p, expiresAt: e.target.value }))} required />
        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">{editingId ? "Actualizar" : "Crear"}</button>
      </form>

      <div className="mt-5 space-y-2">
        {coupons.map((coupon) => (
          <article key={coupon._id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
            <div>
              <h2 className="font-medium">{coupon.code}</h2>
              <p className="text-sm text-zinc-500">
                {coupon.discountType} - {coupon.discountValue} | vence {new Date(coupon.expiresAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingId(coupon._id);
                  setForm({
                    code: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue,
                    minOrderAmount: coupon.minOrderAmount || 0,
                    expiresAt: coupon.expiresAt,
                    isActive: coupon.isActive,
                  });
                }}
                className="rounded border border-zinc-300 px-3 py-1 text-sm"
              >
                Editar
              </button>
              <button onClick={() => handleDelete(coupon._id)} className="rounded border border-red-200 px-3 py-1 text-sm text-red-600">
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminCouponsPage;
