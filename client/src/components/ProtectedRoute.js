import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const ProtectedRoute = () => {
  const { currentUser, loading } = useContext(AuthContext);

  if (loading) return <p>Loading...</p>;  // ✅ jab tak auth check ho raha hai
  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
