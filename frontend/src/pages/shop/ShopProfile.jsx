import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { Stars, Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';

export default function ShopProfile() {
  const [data, setData] = useState(null);
  useEffect(() => { api("users").then((u) => setData(u["shop-001"])); }, []);

  if (!data) return <PageWrap><Skeleton h={300} /></PageWrap>;

  return (
    <PageWrap>
      {/* Banner */}
      <div style={{ background: T.profileGrad, borderRadius: 18, padding: "28px 32px", color: "#fff", marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ width: 80, height: 80, background: "rgba(255,255,255,.2)", borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Fraunces,serif", fontWeight: 900, fontSize: "1.6rem", border: "3px solid rgba(255,255,255,.35)", flexShrink: 0 }}>
            {data.avatar}
          </div>
          <div>
            <h2 style={{ fontFamily: "Fraunces,serif", fontWeight: 700, fontSize: "1.6rem", marginBottom: 4 }}>{data.companyName}</h2>
            <div style={{ display: "flex", gap: 20, fontSize: ".85rem", opacity: .9, marginBottom: 10 }}>
              <span><i className="fas fa-envelope" style={{ marginRight: 8 }}></i>{data.email}</span><span><i className="fas fa-phone" style={{ marginRight: 8 }}></i>{data.phone}</span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Stars rating={data.rating} />
              <span style={{ fontSize: ".85rem", opacity: .85 }}>{data.rating} · {data.verified ? "<i className='fas fa-check-circle'></i> Verified Centre" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Business info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Fraunces,serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20, textAlign: "center" }}>Business Information</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["Company Name","companyName"],["Owner Name","ownerName"],["Phone","phone"],["Email","email"],["TIN Number","tinNumber"]].map(([l, k]) => (
              <div key={k} className="form-group" style={k === "companyName" ? { gridColumn: "1 / -1" } : {}}>
                <label className="form-label">{l}</label>
                <input className="form-input" defaultValue={data[k]} />
              </div>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button className="btn btn-primary btn-sm">💾 Save</button>
          </div>
        </div>

        {/* Centre details */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "Fraunces,serif", fontStyle: "italic", fontWeight: 700, fontSize: "1.1rem", marginBottom: 20, textAlign: "center" }}>Centre Details</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {[["Address","address"],["Open Hours","openHours"],["Specialization","specialization"],["Rating","rating"]].map(([l, k]) => (
              <div key={k} className="form-group">
                <label className="form-label">{l}</label>
                <input className="form-input" defaultValue={data[k]} />
              </div>
            ))}
          </div>
          <div className="divider" />
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: ".875rem" }}>Specializations</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {["Smartphone","Tablet","Laptop","Desktop","Printer"].map((s) => (
              <span key={s} className={`badge ${["Smartphone","Tablet","Laptop"].includes(s) ? "badge-blue" : "badge-gray"}`} style={{ cursor: "pointer" }}>{s}</span>
            ))}
          </div>
          <div style={{ textAlign: "right", marginTop: 16 }}>
            <button className="btn btn-primary btn-sm">💾 Save Details</button>
          </div>
        </div>
      </div>
    </PageWrap>
  );
}
