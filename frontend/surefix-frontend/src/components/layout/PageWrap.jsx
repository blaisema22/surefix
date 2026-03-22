export default function PageWrap({ children }) {
  return (
    <main style={{ marginLeft:234, paddingTop:62 }}>
      <div style={{ maxWidth:1100, margin:'0 auto', padding:'32px 28px' }}>
        {children}
      </div>
    </main>
  );
}