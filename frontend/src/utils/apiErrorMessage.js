/**
 * Mensaje legible para fallos de Axios (red, CORS mal detectado, 5xx).
 */
export function getApiErrorMessage(error, fallback = "Algo salió mal") {
  const status = error?.response?.status;
  const dataMsg = error?.response?.data?.message;

  if (status === 403) {
    return (
      dataMsg ||
      "Tu cuenta no tiene rol de administrador en el servidor. En la raíz del proyecto ejecutá: npm run promote-admin -- tu@email.com y luego iniciá sesión de nuevo."
    );
  }

  if (!error?.response) {
    const code = error?.code;
    const msg = error?.message || "";
    if (code === "ERR_NETWORK" || msg === "Network Error" || msg.includes("Network Error")) {
      return "Sin conexión al servidor. Levantá el API en la raíz del proyecto (npm run dev) y recargá. Si usás URL manual del API, revisá VITE_API_URL en frontend/.env.";
    }
    if (code === "ECONNABORTED") {
      return "La petición tardó demasiado. Probá de nuevo.";
    }
  }
  return error.response?.data?.message || error.message || fallback;
}
