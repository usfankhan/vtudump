import './AdBanner.css';

export default function AdBanner({ ad }) {
  if (!ad || !ad.active) return null;

  return (
    <div className="ad-banner glass-panel animate-fade-in">
      <div className="ad-content">
        <span className="ad-label">Sponsored</span>
        <h4 className="ad-title">{ad.title}</h4>
        <p className="ad-desc">{ad.description}</p>
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} className="ad-image" />
        )}
        <a href={ad.link} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm ad-btn">
          Learn More
        </a>
      </div>
    </div>
  );
}
