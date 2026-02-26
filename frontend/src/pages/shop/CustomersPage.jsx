import { useState, useEffect } from 'react';
import { T } from '../../styles/tokens';
import { api } from '../../data/db';
import { Skeleton } from '../../utils/statusConfig';
import PageWrap from '../../components/layout/PageWrap';
import SectionTitle from '../../components/shared/SectionTitle';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  useEffect(() => { api("customers").then((d) => { setCustomers(d); setLoading(false); }); }, []);

  const filtered = customers.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageWrap>
      <SectionTitle sub="All customers who have booked repairs at your centre.">Customers</SectionTitle>
      <input className="form-input" placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 320, marginBottom: 20 }} />

      <div className="table-wrap">
        <div className="table-head" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr" }}>
          <span>Customer</span><span>Email</span><span>Devices</span><span>Repairs</span><span>Last Visit</span><span>Actions</span>
        </div>
        {loading
          ? [1, 2, 3].map((i) => <div key={i} style={{ padding: "12px 20px" }}><Skeleton h={32} /></div>)
          : filtered.map((c) => (
              <div key={c.id} className="table-row" style={{ gridTemplateColumns: "2fr 2fr 1fr 1fr 1fr 1fr" }}>
                <div style={{ fontWeight: 700 }}>{c.name}</div>
                <div style={{ color: T.muted, fontSize: ".85rem" }}>{c.email}</div>
                <div>{c.devices}</div>
                <div>{c.totalRepairs}</div>
                <div style={{ color: T.muted, fontSize: ".8rem" }}>{c.lastVisit}</div>
                <div><button className="btn btn-ghost btn-sm">View</button></div>
              </div>
            ))}
      </div>
    </PageWrap>
  );
}
