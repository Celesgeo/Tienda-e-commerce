import { Navigate, Route, Routes } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import CategoriesPage from "./pages/CategoriesPage";
import ProductPage from "./pages/ProductPage";
import CartPage from "./pages/CartPage";
import WishlistPage from "./pages/WishlistPage";
import CheckoutPage from "./pages/CheckoutPage";
import NotFoundPage from "./pages/NotFoundPage";
import AdminLoginPage from "./admin/pages/AdminLoginPage";
import AdminDashboardPage from "./admin/pages/AdminDashboardPage";
import AdminProductsPage from "./admin/pages/AdminProductsPage";
import AdminCategoriesPage from "./admin/pages/AdminCategoriesPage";
import AdminCouponsPage from "./admin/pages/AdminCouponsPage";
import AdminOrdersPage from "./admin/pages/AdminOrdersPage";
import AdminSlidesPage from "./admin/pages/AdminSlidesPage";
import AdminStorePage from "./admin/pages/AdminStorePage";
import AdminRoute from "./admin/components/AdminRoute";
import AdminLayout from "./admin/layouts/AdminLayout";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardPage />} />
        <Route path="productos" element={<AdminProductsPage />} />
        <Route path="categorias" element={<AdminCategoriesPage />} />
        <Route path="cupones" element={<AdminCouponsPage />} />
        <Route path="ordenes" element={<AdminOrdersPage />} />
        <Route path="slides" element={<AdminSlidesPage />} />
        <Route path="branding" element={<AdminStorePage />} />
        <Route path="configuracion" element={<AdminStorePage />} />
      </Route>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/categorias" element={<CategoriesPage />} />
        <Route path="/producto/:id" element={<ProductPage />} />
        <Route path="/carrito" element={<CartPage />} />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

export default App;
