import { useEffect, useState } from "react";

const readStored = (key, initialValue) => {
  try {
    const stored = localStorage.getItem(key);
    if (stored == null || stored === "") return initialValue;
    return JSON.parse(stored);
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      /* ignore */
    }
    return initialValue;
  }
};

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => readStored(key, initialValue));

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
};
