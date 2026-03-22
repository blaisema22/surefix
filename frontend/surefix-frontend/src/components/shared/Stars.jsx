export default function Stars({ rating }) {
  return (
    <span>{Array.from({ length: 5 }, (_, i) => (
      <span key={i} className="rating-star">{i < Math.round(rating) ? '★' : '☆'}</span>
    ))}</span>
  );
}