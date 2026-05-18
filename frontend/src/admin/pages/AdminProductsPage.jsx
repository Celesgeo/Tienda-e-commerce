import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import api from "../../services/api";
import useSEO from "../../hooks/useSEO";
import { formatPrice } from "../../utils/formatPrice";
import { ImagePlus, Pencil, Trash2, X } from "lucide-react";

const commaToJson = (text) =>
  JSON.stringify(
    text
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

const arrToComma = (arr) => (Array.isArray(arr) && arr.length ? arr.join(", ") : "");

const initialForm = () => ({
  name: "",
  description: "",
  price: "",
  compareAtPrice: "",
  stock: "",
  category: "",
  colorsText: "",
  sizesText: "",
  featured: false,
  active: true,
  isNewArrival: false,
  isOnSale: false,
  primaryFile: null,
});

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [primaryPreview, setPrimaryPreview] = useState("");
  const [existingGallery, setExistingGallery] = useState([]);
  const [removePublicIds, setRemovePublicIds] = useState([]);
  const [newGalleryFiles, setNewGalleryFiles] = useState([]);
  const [newGalleryPreviews, setNewGalleryPreviews] = useState([]);

  const isEditing = useMemo(() => Boolean(editingId), [editingId]);
  useSEO("Productos | Admin", "Alta, edición y stock de productos");

  const revokeBlobUrls = (urls) => {
    urls.forEach((u) => {
      if (u && String(u).startsWith("blob:")) URL.revokeObjectURL(u);
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products/admin/all"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data.data || []);
      setCategories(categoriesRes.data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudieron cargar los datos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    revokeBlobUrls(newGalleryPreviews);
    if (primaryPreview && String(primaryPreview).startsWith("blob:")) URL.revokeObjectURL(primaryPreview);
    setForm(initialForm());
    setEditingId("");
    setPrimaryPreview("");
    setExistingGallery([]);
    setRemovePublicIds([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
  };

  const buildFormData = () => {
    const data = new FormData();
    data.append("name", form.name.trim());
    data.append("description", form.description.trim());
    data.append("price", String(Number(form.price)));
    data.append("stock", String(Number(form.stock)));
    data.append("category", form.category);
    data.append("colors", commaToJson(form.colorsText));
    data.append("sizes", commaToJson(form.sizesText));
    data.append("featured", form.featured ? "true" : "false");
    data.append("active", form.active ? "true" : "false");
    data.append("isNewArrival", form.isNewArrival ? "true" : "false");
    data.append("isOnSale", form.isOnSale ? "true" : "false");
    if (form.compareAtPrice !== "" && form.compareAtPrice != null) {
      data.append("compareAtPrice", String(Number(form.compareAtPrice)));
    }
    if (form.primaryFile) data.append("image", form.primaryFile);
    newGalleryFiles.forEach((file) => data.append("images", file));
    if (isEditing && removePublicIds.length) {
      data.append("removeImagePublicIds", JSON.stringify(removePublicIds));
    }
    return data;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.category) {
      toast.error("Elegí una categoría");
      return;
    }
    if (!isEditing && !form.primaryFile && newGalleryFiles.length === 0) {
      toast.error("Subí una imagen principal o al menos una imagen en la galería");
      return;
    }
    try {
      const data = buildFormData();
      if (isEditing) {
        await api.put(`/products/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto actualizado");
      } else {
        await api.post("/products", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Producto creado");
      }
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo guardar el producto");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este producto? Se borrarán las imágenes en la nube.")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Producto eliminado");
      if (editingId === id) resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "No se pudo eliminar");
    }
  };

  const startEdit = (product) => {
    revokeBlobUrls(newGalleryPreviews);
    if (primaryPreview && String(primaryPreview).startsWith("blob:")) URL.revokeObjectURL(primaryPreview);
    setEditingId(product._id);
    setForm({
      ...initialForm(),
      name: product.name || "",
      description: product.description || "",
      price: product.price ?? "",
      compareAtPrice: product.compareAtPrice ?? "",
      stock: product.stock ?? "",
      category: product.category?._id || "",
      colorsText: arrToComma(product.colors),
      sizesText: arrToComma(product.sizes),
      featured: Boolean(product.featured),
      active: product.active !== false,
      isNewArrival: Boolean(product.isNewArrival),
      isOnSale: Boolean(product.isOnSale),
      primaryFile: null,
    });
    setPrimaryPreview(product.imageUrl || "");
    setExistingGallery(Array.isArray(product.images) ? [...product.images] : []);
    setRemovePublicIds([]);
    setNewGalleryFiles([]);
    setNewGalleryPreviews([]);
  };

  const removeExistingGalleryItem = (publicId) => {
    setRemovePublicIds((p) => [...p, publicId]);
    setExistingGallery((g) => g.filter((img) => img.publicId !== publicId));
  };

  const onNewGalleryPick = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const urls = files.map((f) => URL.createObjectURL(f));
    setNewGalleryFiles((prev) => [...prev, ...files]);
    setNewGalleryPreviews((prev) => [...prev, ...urls]);
    e.target.value = "";
  };

  const removeNewGalleryAt = (index) => {
    URL.revokeObjectURL(newGalleryPreviews[index]);
    setNewGalleryFiles((f) => f.filter((_, i) => i !== index));
    setNewGalleryPreviews((p) => p.filter((_, i) => i !== index));
  };

  if (loading && !products.length) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 w-56 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-64 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
        <div className="h-40 rounded-2xl bg-zinc-200 dark:bg-zinc-800" />
      </div>
    );
  }

  return (
    <section className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-3xl">Productos</h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          CRUD con imágenes en Cloudinary, variantes y visibilidad en la tienda pública.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 md:p-8"
      >
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
            {isEditing ? "Editar producto" : "Nuevo producto"}
          </h2>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="text-sm font-medium text-zinc-500 underline-offset-4 hover:text-zinc-800 hover:underline dark:hover:text-zinc-300"
            >
              Cancelar edición
            </button>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Nombre</span>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Categoría</span>
            <select
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.category}
              onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
              required
            >
              <option value="">Seleccionar</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Descripción</span>
            <textarea
              className="min-h-24 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Precio</span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.price}
              onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Precio anterior (tachado)
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.compareAtPrice}
              onChange={(e) => setForm((p) => ({ ...p, compareAtPrice: e.target.value }))}
              placeholder="Opcional"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Stock</span>
            <input
              type="number"
              min="0"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.stock}
              onChange={(e) => setForm((p) => ({ ...p, stock: e.target.value }))}
              required
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Colores</span>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.colorsText}
              onChange={(e) => setForm((p) => ({ ...p, colorsText: e.target.value }))}
              placeholder="Negro, Blanco, Arena"
            />
          </label>
          <label className="block text-sm md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-zinc-500">Talles</span>
            <input
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-800 dark:text-white"
              value={form.sizesText}
              onChange={(e) => setForm((p) => ({ ...p, sizesText: e.target.value }))}
              placeholder="S, M, L, XL"
            />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap gap-6">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
              className="rounded border-zinc-300"
            />
            Destacado
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))}
              className="rounded border-zinc-300"
            />
            Activo en tienda
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.isNewArrival}
              onChange={(e) => setForm((p) => ({ ...p, isNewArrival: e.target.checked }))}
              className="rounded border-zinc-300"
            />
            Nuevo ingreso
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={form.isOnSale}
              onChange={(e) => setForm((p) => ({ ...p, isOnSale: e.target.checked }))}
              className="rounded border-zinc-300"
            />
            Oferta
          </label>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Imagen principal</p>
            <div className="flex flex-wrap items-start gap-4">
              <div className="relative h-36 w-36 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800">
                {primaryPreview ? (
                  <img src={primaryPreview} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-zinc-400">Sin imagen</div>
                )}
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:bg-zinc-800">
                <ImagePlus size={18} />
                {isEditing ? "Reemplazar principal" : "Subir principal"}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setForm((p) => ({ ...p, primaryFile: file || null }));
                    if (file) {
                      setPrimaryPreview((prev) => {
                        if (prev && String(prev).startsWith("blob:")) URL.revokeObjectURL(prev);
                        return URL.createObjectURL(file);
                      });
                    }
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Si solo subís galería, la primera imagen será la portada.
            </p>
          </div>
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">Galería adicional</p>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-600 transition hover:border-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:border-zinc-400 dark:hover:bg-zinc-800">
              <ImagePlus size={18} />
              Agregar fotos
              <input type="file" accept="image/*" multiple className="hidden" onChange={onNewGalleryPick} />
            </label>
            <div className="mt-4 flex flex-wrap gap-3">
              {existingGallery.map((img) => (
                <div key={img.publicId} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingGalleryItem(img.publicId)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Quitar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              {newGalleryPreviews.map((url, i) => (
                <div key={url} className="group relative h-24 w-24 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewGalleryAt(i)}
                    className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Quitar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            className="rounded-xl bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {isEditing ? "Guardar cambios" : "Crear producto"}
          </button>
        </div>
      </form>

      <div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">Catálogo ({products.length})</h2>
        <div className="mt-4 space-y-3">
          {!products.length && (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/80 py-16 text-center dark:border-zinc-800 dark:bg-zinc-900/50">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No hay productos. Creá el primero con el formulario de arriba.</p>
            </div>
          )}
          {products.map((product) => (
            <article
              key={product._id}
              className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm transition hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt=""
                    className="h-20 w-20 shrink-0 rounded-xl object-cover ring-1 ring-black/5 dark:ring-white/10"
                  />
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-zinc-200 text-[10px] text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    Sin foto
                  </div>
                )}
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-zinc-900 dark:text-white">{product.name}</h3>
                    {!product.active && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                        Inactivo
                      </span>
                    )}
                    {product.featured && (
                      <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-800 dark:bg-violet-950 dark:text-violet-200">
                        Destacado
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {formatPrice(product.price)}
                    {product.compareAtPrice ? (
                      <span className="ml-2 line-through opacity-70">{formatPrice(product.compareAtPrice)}</span>
                    ) : null}{" "}
                    · Stock {product.stock} · {product.category?.name || "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:shrink-0">
                <button
                  type="button"
                  onClick={() => startEdit(product)}
                  className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium transition hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
                >
                  <Pencil size={16} /> Editar
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-200 px-4 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                >
                  <Trash2 size={16} /> Eliminar
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminProductsPage;
