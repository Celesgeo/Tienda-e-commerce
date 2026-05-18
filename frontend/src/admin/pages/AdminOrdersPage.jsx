import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";
import { formatPrice } from "../../utils/formatPrice";

const ORDER_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [updatingId, setUpdatingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  useSEO("Pedidos | Admin", "Órdenes registradas y checkout invitado");

  const fetchOrders = async () => {
    try {
      const response = await api.get("/orders");
      setOrders(response.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudieron cargar los pedidos");
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/orders/${orderId}/status`, { status });
      toast.success("Estado actualizado");
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo actualizar");
    } finally {
      setUpdatingId("");
    }
  };

  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter((order) => {
      const orderId = order._id?.toLowerCase() || "";
      const userName = order.user?.name?.toLowerCase() || "";
      const userEmail = order.user?.email?.toLowerCase() || "";
      const guestName = order.customerName?.toLowerCase() || "";
      const guestPhone = order.customerPhone?.toLowerCase() || "";
      const guestAddr = order.customerAddress?.toLowerCase() || "";
      const channel = order.channel?.toLowerCase() || "";

      const matchesSearch =
        !q ||
        orderId.includes(q) ||
        userName.includes(q) ||
        userEmail.includes(q) ||
        guestName.includes(q) ||
        guestPhone.includes(q) ||
        guestAddr.includes(q) ||
        channel.includes(q);

      const matchesStatus = statusFilter === "all" || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const customerLabel = (order) => {
    if (order.isGuest || !order.user) {
      const name = order.customerName?.trim() || "Invitado";
      const phone = order.customerPhone ? ` · ${order.customerPhone}` : "";
      return `${name}${phone}`;
    }
    return `${order.user?.name || "Cliente"} (${order.user?.email || "sin email"})`;
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl">Pedidos</h1>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Incluye compras por WhatsApp y transferencia sin registro.</p>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar por ID, cliente, teléfono, canal…"
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
        >
          <option value="all">Todos los estados</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 space-y-4">
        {filteredOrders.map((order) => (
          <article
            key={order._id}
            className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400">Pedido</p>
                <p className="font-mono text-sm text-zinc-800 dark:text-zinc-200">{order._id}</p>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  <span className="font-medium text-zinc-900 dark:text-white">Cliente:</span> {customerLabel(order)}
                </p>
                {order.customerAddress ? (
                  <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Dirección: {order.customerAddress}</p>
                ) : null}
                <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-semibold text-zinc-900 dark:text-white">{formatPrice(order.total)}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {order.channel || "other"}
                  </span>
                  {order.paymentStatus ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      Pago: {order.paymentStatus}
                    </span>
                  ) : null}
                  {order.isGuest ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-bold uppercase text-sky-800 dark:bg-sky-950 dark:text-sky-200">
                      Invitado
                    </span>
                  ) : null}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  defaultValue={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  disabled={updatingId === order._id}
                  className="rounded-xl border border-zinc-200 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 border-t border-zinc-100 pt-4 dark:border-zinc-800">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">Ítems</p>
              <div className="space-y-1">
                {order.items?.map((item, index) => {
                  const variant = [item.color, item.size].filter(Boolean).join(" · ");
                  return (
                    <p key={`${order._id}-${index}`} className="text-sm text-zinc-700 dark:text-zinc-300">
                      {item.product?.name || "Producto"} ×{item.quantity}
                      {variant ? ` (${variant})` : ""} — {formatPrice(item.unitPrice)} c/u
                    </p>
                  );
                })}
              </div>
            </div>
          </article>
        ))}
      </div>

      {!orders.length && (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-200 py-16 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          Aún no hay pedidos. Cuando un cliente complete el checkout, aparecerán aquí.
        </div>
      )}
      {!!orders.length && !filteredOrders.length && (
        <p className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No hay resultados para el filtro actual.</p>
      )}
    </section>
  );
};

export default AdminOrdersPage;
