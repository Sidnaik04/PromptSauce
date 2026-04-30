import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { login, signup, googleAuth, verifyEmail } from "../services/api";
import useStore from "../store/useStore";

export default function Auth() {
  const [tab, setTab] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifyToken, setVerifyToken] = useState(null);
  const [pendingUser, setPendingUser] = useState(null);

  const { setToken, setUser } = useStore();
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError("");
    if (tab === "signup" && !username.trim()) {
      setError("Username is required");
      return;
    }
    setLoading(true);
    try {
      const res =
        tab === "login"
          ? await login(email, password)
          : await signup(email, password, username);

      if (tab === "signup" && res.verify_token) {
        // Show verification screen
        setVerifyToken(res.verify_token);
        setPendingUser(res.user);
      } else if (res.access_token) {
        setToken(res.access_token);
        setUser(res.user || { email, username });
        navigate("/dashboard");
      } else {
        setError(res.detail || "Something went wrong");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await verifyEmail(verifyToken);
      if (res.access_token) {
        setToken(res.access_token);
        setUser(res.user);
        setVerifyToken(null);
        setPendingUser(null);
        navigate("/dashboard");
      } else {
        setError(res.detail || "Verification failed");
      }
    } catch (err) {
      setError("Verification error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);
    try {
      const res = await googleAuth(credentialResponse.credential);
      if (res.access_token) {
        setToken(res.access_token);
        const userData = res.user || {
          email: "Google User",
          username: "GoogleUser",
        };
        setUser(userData);
        navigate("/dashboard");
      } else {
        setError(res.detail || "Google authentication failed");
      }
    } catch {
      setError("Google authentication error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed");
  };

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center px-4 py-8 relative overflow-hidden">
      {/* Blurry background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#FF6A3D]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-1/4 w-96 h-96 bg-[#FF6A3D]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Glassmorphic card */}
      <div className="w-full max-w-sm bg-[#2A2A2A]/40 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl relative z-10">
        {/* Verification Screen */}
        {verifyToken && pendingUser ? (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#FF6A3D]/10 flex items-center justify-center mx-auto mb-4 border border-[#FF6A3D]/20">
                {pendingUser.profile_picture ? (
                  <img
                    src={pendingUser.profile_picture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <span className="text-3xl font-bold text-[#FF6A3D]">✓</span>
                )}
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Verify your email
              </h1>
              <p className="text-sm text-gray-400">
                We sent a verification link to{" "}
                <span className="text-white font-semibold">
                  {pendingUser.email}
                </span>
              </p>
            </div>

            {/* Info */}
            <div className="bg-[#1E1E1E]/50 border border-[#FF6A3D]/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-300 text-center">
                Click the button below to verify your email address and activate
                your account.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm font-medium mb-4 text-center">
                {error}
              </p>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyEmail}
              disabled={loading}
              className="w-full py-3 bg-[#FF6A3D] hover:bg-orange-500 disabled:opacity-50 rounded-lg text-white font-bold text-sm transition duration-150 shadow-lg shadow-[#FF6A3D]/20 mb-4"
            >
              {loading ? "Verifying..." : "Verify Email"}
            </button>

            {/* Back Button */}
            <button
              onClick={() => {
                setVerifyToken(null);
                setPendingUser(null);
                setEmail("");
                setPassword("");
                setUsername("");
              }}
              className="w-full py-2.5 text-sm text-gray-400 hover:text-gray-300 bg-white/5 hover:bg-white/8 rounded-lg transition"
            >
              Back to {tab === "login" ? "Login" : "Signup"}
            </button>
          </>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                ✦ PromptSauce
              </h1>
              <p className="text-sm text-gray-400">
                {tab === "login" ? "Welcome back" : "Join PromptSauce"}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex bg-[#1E1E1E]/30 rounded-lg p-1 mb-8 backdrop-blur-sm">
              {["login", "signup"].map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setTab(t);
                    setError("");
                  }}
                  className={`flex-1 py-2.5 text-sm rounded-md transition duration-150 font-semibold capitalize
                    ${tab === t ? "bg-[#FF6A3D] text-white shadow-lg shadow-[#FF6A3D]/30" : "text-gray-400 hover:text-gray-300"}`}
                >
                  {t}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3.5">
              {tab === "signup" && (
                <div>
                  <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                    Username
                  </label>
                  <input
                    type="text"
                    placeholder="your_username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-[#1E1E1E]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D]/20 transition backdrop-blur-sm"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#1E1E1E]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D]/20 transition backdrop-blur-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400 mb-1.5 block font-medium">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="w-full bg-[#1E1E1E]/50 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#FF6A3D] focus:ring-1 focus:ring-[#FF6A3D]/20 transition backdrop-blur-sm"
                />
              </div>
              {error && (
                <p className="text-red-400 text-sm font-medium">{error}</p>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-1 w-full py-3 bg-[#FF6A3D] hover:bg-orange-500 disabled:opacity-50 rounded-lg text-white font-bold text-sm transition duration-150 shadow-lg shadow-[#FF6A3D]/20"
              >
                {loading
                  ? "Please wait..."
                  : tab === "login"
                    ? "Login"
                    : "Create Account"}
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-7">
              <div className="flex-1 h-px bg-white/10"></div>
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>

            {/* Google Auth */}
            <div className="flex flex-col gap-3 items-center">
              <div className="w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="dark"
                  size="large"
                  text={tab === "login" ? "signin_with" : "signup_with"}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
