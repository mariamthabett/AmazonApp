// نجوم التقييم (للعرض فقط). rating من 0 لـ 5.
export default function StarRating({ rating = 0, count }) {
  const rounded = Math.round(rating * 2) / 2; // لأقرب نص نجمة
  const stars = [1, 2, 3, 4, 5].map((n) => {
    if (rounded >= n) return "full";
    if (rounded >= n - 0.5) return "half";
    return "empty";
  });

  return (
    <span className="star-rating" title={`${rating.toFixed(1)} / 5`}>
      <span className="stars" aria-hidden="true">
        {stars.map((type, i) => (
          <span key={i} className={`star star-${type}`}>
            ★
          </span>
        ))}
      </span>
      {count !== undefined && <span className="rating-count">({count})</span>}
    </span>
  );
}
