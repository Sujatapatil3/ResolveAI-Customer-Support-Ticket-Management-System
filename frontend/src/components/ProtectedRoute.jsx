
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRole }) {
  const token = sessionStorage.getItem("resolveai_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  try {
    // Decode the JWT payload
    const encodedPayload = token.split(".")[1];
    const base64 = encodedPayload
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const payload = JSON.parse(
      atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="))
    );

    const userRole = payload.role;

    // Check whether the user's role is allowed
    if (userRole !== allowedRole) {
      if (userRole === "CUSTOMER") {
        return <Navigate to="/customer-dashboard" replace />;
      }

      if (userRole === "AGENT") {
        return <Navigate to="/agent-dashboard" replace />;
      }

      return <Navigate to="/login" replace />;
    }

    return children;
  } catch (error) {
    sessionStorage.removeItem("resolveai_token");
    return <Navigate to="/login" replace />;
  }
}

export default ProtectedRoute;
