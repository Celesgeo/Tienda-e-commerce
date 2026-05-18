import { Navigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

const AdminRoute = ({ children }) => {
  const { isAdminLogged } = useAdminAuth();
  if (!isAdminLogged) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

export default AdminRoute;
