import PageWrap from '../layout/PageWrap';
import { T } from '../../styles/tokens';

export default function PlaceholderPage({ title, icon }) {
  return (
    <PageWrap>
      <div className="card empty-state">
        <div style={{ fontSize: "3rem", marginBottom: 12, color: T.blue }}><i className={`fas fa-${icon}`}></i></div>
        <h2 className="heading" style={{ fontSize: "1.4rem", marginBottom: 8 }}>{title}</h2>
        <p style={{ color: T.muted, fontSize: ".875rem" }}>This section is coming soon.</p>
      </div>
    </PageWrap>
  );
}
