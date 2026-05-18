import { useEffect } from "react";

const upsertMetaTag = (selector, attributes) => {
  let tag = document.querySelector(selector);
  if (!tag) {
    tag = document.createElement("meta");
    document.head.appendChild(tag);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    tag.setAttribute(key, value);
  });
};

const useSEO = (title, description, image = "") => {
  useEffect(() => {
    document.title = title;
    if (description) {
      upsertMetaTag('meta[name="description"]', { name: "description", content: description });
      upsertMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
      upsertMetaTag('meta[property="og:description"]', {
        property: "og:description",
        content: description,
      });
      upsertMetaTag('meta[property="og:type"]', { property: "og:type", content: "website" });
      if (image) {
        upsertMetaTag('meta[property="og:image"]', { property: "og:image", content: image });
      }
    }
  }, [title, description, image]);
};

export default useSEO;
