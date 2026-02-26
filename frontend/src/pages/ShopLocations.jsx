import { DB } from '../data/db';
import { T } from '../styles/tokens';

export default function ShopLocations({ onClose }) {
  const repairCenters = DB.repairCenters;

  // Create map URL with multiple markers
  const createMapUrl = () => {
    // Center on Kigali, Rwanda
    const markers = repairCenters
      .map(center => {
        // Extract coordinates from address (simplified - in production use geocoding API)
        // Kigali approximate center: -1.9536, 29.8739
        return `${center.name}|${center.address}`;
      })
      .join('|');
    
    // Using Google Maps embed - simple approach
    // For production, use Google Maps API with proper geocoding
    const baseUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5034740526506!2d29.8739!3d-1.9536!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d91c7e5c5c5c5d%3A0x5c5c5c5c5c5c5c5c!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1234567890';
    return baseUrl;
  };

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "Outfit,sans-serif" }}>
      {/* Top Bar */}
      <div style={{
        background: T.navy, color: "#fff", padding: "16px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center"
      }}>
        <h1 style={{ fontFamily: "Fraunces,serif", fontWeight: 900, fontStyle: "italic", fontSize: "1.4rem", margin: 0 }}>
          SureFix - Find Repair Centers
        </h1>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,.2)", border: "1.5px solid rgba(255,255,255,.4)",
            color: "#fff", borderRadius: 8, padding: "8px 16px", fontWeight: 600,
            fontFamily: "Outfit,sans-serif", fontSize: ".85rem", cursor: "pointer"
          }}
          onMouseEnter={(e) => (e.target.style.background = "rgba(255,255,255,.3)")}
          onMouseLeave={(e) => (e.target.style.background = "rgba(255,255,255,.2)")}
        >
          ← Back
        </button>
      </div>

      {/* Main Content */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "calc(100vh - 60px)", gap: 0 }}>
        
        {/* Left: List of Repair Centers */}
        <div style={{ padding: "40px", overflowY: "auto", maxHeight: "calc(100vh - 60px)", background: "#f8f9fc" }}>
          <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontStyle: "italic", fontSize: "1.6rem", color: T.blue, marginBottom: 8 }}>
            Repair Centers Near You
          </h2>
          <p style={{ color: T.muted, marginBottom: 32, fontSize: ".9rem" }}>
            {repairCenters.length} certified repair centers available in Kigali
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {repairCenters.map((center) => (
              <div key={center.id} style={{
                background: "#fff", borderRadius: 12, padding: "20px",
                border: `1.5px solid ${T.border}`, transition: "all .2s",
                cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,.04)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,.12)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.04)";
                e.currentTarget.style.transform = "translateY(0)";
              }}>
                
                {/* Header with status */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: "1rem", fontWeight: 700, color: T.navy, marginBottom: 4 }}>
                      {center.name}
                    </h3>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: ".8rem", fontWeight: 600, color: T.blue }}><i className="fas fa-star" style={{ marginRight: 4 }}></i>{center.rating}</span>
                      <span style={{ fontSize: ".75rem", color: T.muted }}>({center.reviews} reviews)</span>
                    </div>
                  </div>
                  <span style={{
                    background: center.status === "Open" ? "#d1fae5" : "#fde2e4",
                    color: center.status === "Open" ? "#065f46" : "#991b1b",
                    padding: "4px 12px", borderRadius: 20, fontSize: ".75rem", fontWeight: 600
                  }}>
                    {center.status}
                  </span>
                </div>

                {/* Details */}
                <div style={{ fontSize: ".85rem", color: T.text, lineHeight: 1.8, marginBottom: 12 }}>
                  <div><i className="fas fa-map-marker-alt" style={{ marginRight: 8, color: T.blue }}></i>{center.address}</div>
                  <div><i className="fas fa-phone" style={{ marginRight: 8, color: T.blue }}></i>{center.phone}</div>
                  <div><i className="fas fa-clock" style={{ marginRight: 8, color: T.blue }}></i>{center.hours}</div>
                  <div style={{ marginTop: 8, color: T.muted }}>
                    <i className="fas fa-hourglass-end" style={{ marginRight: 8 }}></i>Wait time: <strong>{center.waitTime}</strong> • {center.capacity}
                  </div>
                </div>

                {/* Specializations */}
                <div style={{ marginBottom: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {center.specializations.map((spec) => (
                    <span key={spec} style={{
                      background: "#eff6ff", color: T.blue, padding: "4px 10px",
                      borderRadius: 6, fontSize: ".75rem", fontWeight: 500
                    }}>
                      {spec}
                    </span>
                  ))}
                </div>

                {/* Distance Badge */}
                <div style={{
                  background: `linear-gradient(135deg,${T.blue},#1e40af)`,
                  color: "#fff", padding: "10px 16px", borderRadius: 8,
                  fontSize: ".85rem", fontWeight: 600, textAlign: "center",
                  cursor: "pointer", transition: "all .2s"
                }}
                onMouseEnter={(e) => (e.target.style.opacity = "0.9")}
                onMouseLeave={(e) => (e.target.style.opacity = "1")}
                onClick={() => alert(`Opening map for ${center.name}...`)}>
                  <i className="fas fa-map-marker-alt" style={{ marginRight: 8 }}></i>{center.distance} away • View on Map
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Google Map */}
        <div style={{ position: "relative", background: "#e5e7eb" }}>
          <div style={{ position: "sticky", top: 0, height: "100%", width: "100%" }}>
            {/* Map Embed */}
            <div style={{ width: "100%", height: "100%" }}>
              <iframe
                style={{ width: "100%", height: "100%", border: "none" }}
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.6141401159635!2d29.87393631159146!3d-1.9540592990000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19d91c7d8c7d8c7d%3A0x5c5c5c5c5c5c5c5c!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2srw!4v1708957200000"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Repair Centers Map"
              />
            </div>

            {/* Info overlay */}
            <div style={{
              position: "absolute", bottom: 20, left: 20, right: 20,
              background: "#fff", borderRadius: 12, padding: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,.15)"
            }}>
              <div style={{ fontSize: ".85rem", fontWeight: 600, color: T.navy, marginBottom: 4 }}>
                💡 Tip
              </div>
              <p style={{ fontSize: ".8rem", color: T.muted, margin: 0 }}>
                Click on any center in the list to see it highlighted on the map. All centers are verified and certified.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
