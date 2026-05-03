import { useEffect, useRef, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import ApiKey from "./pages/ApiKey";
import useStore from "./store/useStore";
import { warmUpBackend } from "./services/api";

const ProtectedRoute = ({ children }) => {
  const token = useStore((s) => s.token);
  return token ? children : <Navigate to="/auth" replace />;
};

export default function App() {
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const [isWarming, setIsWarming] = useState(true);
  const hasWarmedRef = useRef(false);

  useEffect(() => {
    if (hasWarmedRef.current) return;
    hasWarmedRef.current = true;

    const init = async () => {
      await warmUpBackend();
      setIsWarming(false);
    };

    init();
  }, []);

  if (isWarming) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <div className="inline-block w-10 h-10 border-3 border-white/20 border-t-[#FF6A3D] rounded-full animate-spin mb-4" />
          <p className="text-lg font-semibold">Starting AI engine...</p>
          <p className="text-sm text-gray-400 mt-1">
            First load may take up to 30 seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/api-key"
            element={
              <ProtectedRoute>
                <ApiKey />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
