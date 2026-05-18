import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";

const initialForm = { name: "", description: "", imageUrl: "" };

const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  useSEO("Categorias Admin | Tienda", "Gestion de categorias");

  const fetchCategories = async () => {
    const response = await api.get("/categories");
    setCategories(response.data.data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchCategories();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/categories/${editingId}`, form);
        toast.success("Categoria actualizada");
      } else {
        await api.post("/categories", form);
        toast.success("Categoria creada");
      }
      setForm(initialForm);
      setEditingId("");
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo guardar categoria");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/categories/${id}`);
    toast.success("Categoria eliminada");
    fetchCategories();
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold">Gestion de categorias</h1>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
        <input
          className="rounded-lg border border-zinc-200 p-2"
          placeholder="Nombre"
          value={form.name}
          onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-zinc-200 p-2"
          placeholder="Descripcion"
          value={form.description}
          onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
        />
        <input
          className="rounded-lg border border-zinc-200 p-2 md:col-span-2"
          placeholder="URL imagen de categoria"
          value={form.imageUrl}
          onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
        />
        <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
          {editingId ? "Actualizar" : "Crear"}
        </button>
      </form>

      <div className="mt-5 space-y-2">
        {categories.map((item) => (
          <article key={item._id} className="flex items-center justify-between rounded-lg border border-zinc-200 p-3">
            <div>
              <h2 className="font-medium">{item.name}</h2>
              <p className="text-sm text-zinc-500">{item.description}</p>
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="mt-2 h-10 w-14 rounded object-cover" />
              ) : null}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setForm({
                    name: item.name,
                    description: item.description || "",
                    imageUrl: item.imageUrl || "",
                  });
                  setEditingId(item._id);
                }}
                className="rounded border border-zinc-300 px-3 py-1 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(item._id)}
                className="rounded border border-red-200 px-3 py-1 text-sm text-red-600"
              >
                Eliminar
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default AdminCategoriesPage;
