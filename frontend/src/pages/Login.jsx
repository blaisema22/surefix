import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import authService from "../services/authService";

const LOGIN_LAPTOP = "https://images.unsplash.com/photo-1588508065123-287b28e013da?w=600&q=80";

const MailIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
  </svg>
);

const LockIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
  </svg>
);

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateForm = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email");
      return false;
    }
    if (!password.trim()) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.login(email, password);
      login(response.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "linear-gradient(135deg, #dce3f5 0%, #eef0fa 100%)" }}
    >
      <div className="flex rounded-2xl overflow-hidden shadow-2xl w-[700px] max-w-[95vw]">

        {/* ── Left: image panel ── */}
        <div className="hidden sm:block w-[45%] relative">
          <img
            src={LOGIN_LAPTOP}
            alt="Repair workshop"
            className="w-full h-full object-cover"
          />
          {/* subtle dark overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"/>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex-1 bg-[#2c3e6b] flex flex-col items-center justify-center px-10 py-12">
          {/* Brand */}
          <p className="text-white text-2xl font-extrabold tracking-wide mb-1">SureFix</p>

          {/* Logo */}
          <div className="w-16 h-16 rounded-full bg-white/15 border border-white/25 flex items-center justify-center mb-8 text-3xl">
            🔧
          </div>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="w-full">
            {/* Email */}
            <div className="w-full relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <MailIcon/>
              </span>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full bg-gray-100 rounded-full pl-11 pr-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Password */}
            <div className="w-full relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2">
                <LockIcon/>
              </span>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full bg-gray-100 rounded-full pl-11 pr-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a2f6b] hover:bg-[#162660] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all shadow-md"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>

          {/* Footer links */}
          <p className="mt-5 text-sm text-gray-300">
            Forgot Password?{" "}
            <span className="font-bold text-white">or</span>{" "}
            <Link to="/register" className="text-white underline underline-offset-2 font-semibold hover:text-blue-300 transition-colors">
              Signup
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}