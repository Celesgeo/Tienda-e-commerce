import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";

const initialForm = { title: "", subtitle: "", active: true, image: null };

const AdminSlidesPage = () => {
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [preview, setPreview] = useState("");
  const [draggingId, setDraggingId] = useState("");
  useSEO("Slides admin | Tienda", "Gestion de carrusel");

  const fetchSlides = async () => {
    const response = await api.get("/slides");
    setSlides(response.data.data || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSlides();
  }, []);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId("");
    setPreview("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("subtitle", form.subtitle);
      data.append("active", form.active);
      if (form.image) data.append("image", form.image);

      if (editingId) {
        await api.put(`/slides/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Slide actualizado");
      } else {
        await api.post("/slides", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Slide creado");
      }
      resetForm();
      fetchSlides();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo guardar slide");
    }
  };

  const handleDelete = async (id) => {
    await api.delete(`/slides/${id}`);
    toast.success("Slide eliminado");
    fetchSlides();
  };

  const handleReorder = async (id, direction) => {
    try {
      await api.put(`/slides/${id}/reorder`, { direction });
      fetchSlides();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo reordenar");
    }
  };

  const handleDrop = async (targetId) => {
    if (!draggingId || draggingId === targetId) return;
    const fromIndex = slides.findIndex((slide) => slide._id === draggingId);
    const toIndex = slides.findIndex((slide) => slide._id === targetId);
    if (fromIndex < 0 || toIndex < 0) return;

    const reordered = [...slides];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    setSlides(reordered);
    setDraggingId("");

    try {
      await api.put("/slides/reorder", { orderedIds: reordered.map((slide) => slide._id) });
      toast.success("Orden del carrusel actualizado");
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo reordenar");
      fetchSlides();
    }
  };

  return (
    <section>
      <h1 className="text-2xl font-semibold">Gestion de carrusel</h1>
      <form onSubmit={handleSubmit} className="mt-4 grid gap-2 md:grid-cols-2">
        <input
          className="rounded-lg border border-zinc-200 p-2"
          placeholder="Titulo"
          value={form.title}
          onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <input
          className="rounded-lg border border-zinc-200 p-2"
          placeholder="Subtitulo"
          value={form.subtitle}
          onChange={(event) => setForm((prev) => ({ ...prev, subtitle: event.target.value }))}
        />
        <label className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-sm">
          <input
            type="checkbox"
            checked={form.active}
            onChange={(event) => setForm((prev) => ({ ...prev, active: event.target.checked }))}
          />
          Slide activo
        </label>
        <div className="rounded-lg border border-zinc-200 p-2">
          <input
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setForm((prev) => ({ ...prev, image: file || null }));
              setPreview(file ? URL.createObjectURL(file) : "");
            }}
            required={!editingId}
          />
          {preview ? <img src={preview} alt="preview slide" className="mt-2 h-20 w-24 rounded object-cover" /> : null}
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg bg-black px-4 py-2 text-sm text-white">
            {editingId ? "Actualizar" : "Crear"}
          </button>
          {editingId ? (
            <button type="button" onClick={resetForm} className="rounded-lg border border-zinc-300 px-4 py-2 text-sm">
              Cancelar
            </button>
          ) : null}
        </div>
      </form>

      <div className="mt-6 space-y-2">
        {slides.map((slide) => (
          <article
            key={slide._id}
            draggable
            onDragStart={() => setDraggingId(slide._id)}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => handleDrop(slide._id)}
            className="flex cursor-move items-center justify-between rounded-lg border border-zinc-200 p-3"
          >
            <div className="flex items-center gap-3">
              <img src={slide.image} alt={slide.title} className="h-14 w-20 rounded object-cover" />
              <div>
                <p className="font-medium">{slide.title}</p>
                <p className="text-sm text-zinc-500">{slide.subtitle}</p>
                <p className="text-xs text-zinc-400">Arrastra para reordenar</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleReorder(slide._id, "up")}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              >
                Subir
              </button>
              <button
                onClick={() => handleReorder(slide._id, "down")}
                className="rounded border border-zinc-300 px-2 py-1 text-sm"
              >
                Bajar
              </button>
              <button
                onClick={() => {
                  setEditingId(slide._id);
                  setForm({
                    title: slide.title,
                    subtitle: slide.subtitle,
                    active: slide.active,
                    image: null,
                  });
                  setPreview(slide.image);
                }}
                className="rounded border border-zinc-300 px-3 py-1 text-sm"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(slide._id)}
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

export default AdminSlidesPage;
