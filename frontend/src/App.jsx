import { useState } from 'react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './styles/global.css';

// Layout
import Sidebar  from './components/layout/Sidebar';
import Topbar   from './components/layout/Topbar';

// Shared
import PlaceholderPage   from './components/shared/PlaceholderPage';
import AppointmentHistory from './pages/shared/AppointmentHistory';

// Auth
import LoginPage  from './pages/auth/LoginPage';

// Landing
import LandingPage from './pages/LandingPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import FindRepairCenter  from './pages/customer/FindRepairCenter';
import BookRepairFlow    from './pages/customer/BookRepairFlow';
import MyDevices         from './pages/customer/MyDevices';
import CustomerProfile   from './pages/customer/CustomerProfile';

// Shop pages
import ShopDashboard from './pages/shop/ShopDashboard';
import CustomersPage from './pages/shop/CustomersPage';
import ShopProfile   from './pages/shop/ShopProfile';
import ShopLocations from './pages/ShopLocations';

export default function App() {
  // Screens: "landing" | "login" | "shopLocations" | "app"
  const [screen, setScreen]                 = useState("landing");
  const [currentUser, setCurrentUser]       = useState(null);
  const [page, setPage]                     = useState("dashboard");
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);

  // Go to login normally (Sign In button)
  const goToLogin = () => {
    setRedirectAfterLogin(null);
    setScreen("login");
  };

  // Go to login with intent to book after auth
  const goToLoginForBooking = () => {
    setRedirectAfterLogin("bookRepair");
    setScreen("login");
  };

  // Go to shop locations
  const goToShopLocations = () => {
    setScreen("shopLocations");
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
    if (user.role === "customer" && redirectAfterLogin) {
      setPage(redirectAfterLogin);
    } else {
      setPage("dashboard");
    }
    setRedirectAfterLogin(null);
    setScreen("app");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setScreen("landing");
    setPage("dashboard");
    setRedirectAfterLogin(null);
  };

  const renderAppPage = () => {
    const role = currentUser?.role;

    if (role === "customer") {
      switch (page) {
        case "dashboard":     return <CustomerDashboard onNavigate={setPage} currentUser={currentUser} />;
        case "findRepair":    return <FindRepairCenter />;
        case "bookRepair":    return <BookRepairFlow onDone={() => setPage("appointments")} />;
        case "myDevices":     return <MyDevices onBook={() => setPage("bookRepair")} currentUser={currentUser} />;
        case "appointments":
        case "repairHistory": return <AppointmentHistory role="customer" />;
        case "profile":       return <CustomerProfile currentUser={currentUser} />;
        default:              return <CustomerDashboard onNavigate={setPage} currentUser={currentUser} />;
      }
    } else {
      switch (page) {
        case "dashboard":    return <ShopDashboard onNavigate={setPage} currentUser={currentUser} />;
        case "appointments": return <AppointmentHistory role="shop" />;
        case "customers":    return <CustomersPage />;
        case "services":     return <PlaceholderPage title="Services Management"  icon="wrench" />;
        case "status":       return <PlaceholderPage title="Availability Status"  icon="satellite-dish" />;
        case "reports":      return <PlaceholderPage title="Reports & Analytics"  icon="chart-bar" />;
        case "profile":      return <ShopProfile currentUser={currentUser} />;
        default:             return <ShopDashboard onNavigate={setPage} currentUser={currentUser} />;
      }
    }
  };

  return (
    <>
      {/* ── LANDING ── */}
      {screen === "landing" && (
        <LandingPage onLogin={goToLogin} onBookClick={goToLoginForBooking} onShopClick={goToShopLocations} />
      )}

      {/* ── SHOP LOCATIONS ── */}
      {screen === "shopLocations" && (
        <ShopLocations onClose={() => setScreen("landing")} />
      )}

      {/* ── LOGIN ── */}
      {screen === "login" && (
        <div>
          <LoginPage onLogin={handleLogin} />

          {/* Back button */}
          <button
            onClick={() => setScreen("landing")}
            style={{
              position: "fixed", top: 20, left: 20,
              background: "rgba(255,255,255,.15)", border: "1.5px solid rgba(255,255,255,.3)",
              color: "#fff", borderRadius: 10, padding: "8px 16px",
              fontWeight: 600, fontFamily: "Outfit,sans-serif", fontSize: ".82rem",
              cursor: "pointer", backdropFilter: "blur(4px)", zIndex: 9999,
            }}
            onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,.25)")}
            onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,.15)")}
          >
            ← Back to Home
          </button>

          {/* Booking redirect banner */}
          {redirectAfterLogin && (
            <div
              style={{
                position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)",
                background: "linear-gradient(135deg,#1d4ed8,#1e40af)", color: "#fff",
                borderRadius: 12, padding: "10px 20px", fontSize: ".82rem", fontWeight: 600,
                fontFamily: "Outfit,sans-serif", zIndex: 9999,
                boxShadow: "0 4px 16px rgba(29,78,216,.4)",
                display: "flex", alignItems: "center", gap: 8,
              }}
            >
              <i className="fas fa-lock" style={{ marginRight: 8 }}></i>Sign in to continue to your booking
            </div>
          )}
        </div>
      )}

      {/* ── APP (authenticated) ── */}
      {screen === "app" && currentUser && (
        <>
          <Sidebar active={page} onChange={setPage} role={currentUser.role} onLogout={handleLogout} />
          <Topbar  user={currentUser} onLogout={handleLogout} />
          {renderAppPage()}
        </>
      )}
    </>
  );
}
