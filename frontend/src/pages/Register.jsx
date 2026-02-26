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

const UserIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
  </svg>
);

const ROLES = ["Customer", "Repair Shop", "Admin"];

export default function SignupPage() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole]         = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);

  const validateForm = () => {
    if (!name.trim()) {
      setError("Full name is required");
      return false;
    }
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
    if (!role) {
      setError("Please select a role");
      return false;
    }
    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await authService.register(name, email, password, role);
      register(response.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      console.error("Registration error:", err);
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

        {/* ── Left: image + role toggle ── */}
        <div className="hidden sm:block w-[45%] relative">
          <img
            src={LOGIN_LAPTOP}
            alt="Repair workshop"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"/>

          {/* Role pills on image */}
          <div className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2">
            {["Customer", "Repair"].map(t => (
              <button
                key={t}
                onClick={() => setRole(t)}
                className={`px-5 py-1.5 rounded-full text-xs font-bold shadow transition-all ${
                  role === t
                    ? "bg-blue-700 text-white scale-105"
                    : "bg-white/75 text-gray-700 hover:bg-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* ── Right: form panel ── */}
        <div className="flex-1 bg-[#2c3e6b] flex flex-col items-center justify-center px-10 py-10">
          {/* Brand */}
          <p className="text-white text-2xl font-extrabold tracking-wide mb-0.5">SureFix</p>
          <p className="text-white/60 text-xs font-semibold mb-7 tracking-widest uppercase">Customer Form</p>

          {/* Error Message */}
          {error && (
            <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignup} className="w-full">
            {/* Full Name */}
            <div className="w-full relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2"><UserIcon/></span>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setError("");
                }}
                disabled={loading}
                className="w-full bg-gray-100 rounded-full pl-11 pr-5 py-3 text-sm text-gray-700 placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div className="w-full relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2"><MailIcon/></span>
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
            <div className="w-full relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2"><LockIcon/></span>
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

            {/* Role dropdown */}
            <div className="w-full relative mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10"><ShieldIcon/></span>
              <button
                type="button"
                onClick={() => setRoleOpen(o => !o)}
                disabled={loading}
                className="w-full bg-gray-100 rounded-full pl-11 pr-5 py-3 text-sm text-left outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-between disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className={role ? "text-gray-700" : "text-gray-400"}>{role || "Select Role"}</span>
                <svg className={`w-4 h-4 text-gray-400 transition-transform ${roleOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {roleOpen && (
                <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-2xl shadow-xl overflow-hidden z-20 border border-gray-100">
                  {ROLES.map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => { setRole(r); setRoleOpen(false); setError(""); }}
                      className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${
                        role === r
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sign Up button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#1a2f6b] hover:bg-[#162660] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 rounded-full transition-all shadow-md"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          {/* Footer links */}
          <p className="mt-5 text-sm text-gray-300">
            Already have an account?{" "}
            <span className="font-bold text-white">or</span>{" "}
            <Link to="/login" className="text-white underline underline-offset-2 font-semibold hover:text-blue-300 transition-colors">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}