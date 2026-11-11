
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/customer-dashboard"
          element={
            <ProtectedRoute allowedRole="CUSTOMER">
              <Dashboard role="CUSTOMER" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/agent-dashboard"
          element={
            <ProtectedRoute allowedRole="AGENT">
              <Dashboard role="AGENT" />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
