import { useEffect, useState } from "react";
import api from "../services/api";

/**
 * Slides desde API; si no hay, usa `fallback` (banner / textos de tienda).
 */
const Carousel = ({ fallback }) => {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await api.get("/slides?active=true");
        setSlides(response.data.data || []);
      } catch {
        setSlides([]);
      }
    };
    fetchSlides();
  }, []);

  useEffect(() => {
    if (!slides.length) return undefined;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length) {
    const current = slides[index];
    return (
      <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-200/60 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="relative h-[320px] md:h-[440px]">
          <img
            src={current.image}
            alt={current.title}
            className="h-full w-full object-cover transition duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 text-white md:p-10">
            <p className="text-xs uppercase tracking-[0.25em] text-white/80">Destacado</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight md:text-5xl">{current.title}</h2>
            {current.subtitle ? (
              <p className="mt-2 max-w-xl text-sm text-white/90 md:text-base">{current.subtitle}</p>
            ) : null}
          </div>
        </div>
        <div className="flex justify-center gap-2 p-4">
          {slides.map((slide, dotIndex) => (
            <button
              key={slide._id}
              type="button"
              onClick={() => setIndex(dotIndex)}
              className={`h-2 w-8 rounded-full transition ${
                index === dotIndex ? "bg-zinc-900 dark:bg-white" : "bg-zinc-300 dark:bg-zinc-600"
              }`}
              aria-label={`Ir al slide ${dotIndex + 1}`}
            />
          ))}
        </div>
      </section>
    );
  }

  const img = fallback?.bannerUrl || fallback?.image;
  const title = fallback?.heroTitle || fallback?.title || fallback?.name || "Tu tienda";
  const subtitle = fallback?.heroSubtitle || fallback?.subtitle || fallback?.description || "";

  return (
    <section className="mb-8 overflow-hidden rounded-3xl border border-zinc-200/60 bg-zinc-900 text-white shadow-sm dark:border-zinc-800">
      <div className="relative flex min-h-[280px] flex-col justify-end md:min-h-[360px]">
        {img ? (
          <>
            <img src={img} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black" />
        )}
        <div className="relative p-8 md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-white/70">Bienvenida</p>
          <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">{title}</h2>
          {subtitle ? <p className="mt-3 max-w-xl text-sm text-white/85 md:text-base">{subtitle}</p> : null}
        </div>
      </div>
    </section>
  );
};

export default Carousel;
