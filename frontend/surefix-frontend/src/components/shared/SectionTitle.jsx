export default function SectionTitle({ children, sub, action }) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:22 }}>
      <div>
        <h2 className="heading" style={{ fontSize:'1.6rem', lineHeight:1.2 }}>{children}</h2>
        {sub && <p style={{ color:'#5a6a8a', fontSize:'.875rem', marginTop:4 }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}