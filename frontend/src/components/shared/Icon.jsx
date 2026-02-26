// Icon component to render Font Awesome icons
export default function Icon({ name, size = "1rem", color = "inherit", className = "" }) {
  return <i className={`fas fa-${name} ${className}`} style={{ fontSize: size, color, display: "inline-block" }} />;
}
