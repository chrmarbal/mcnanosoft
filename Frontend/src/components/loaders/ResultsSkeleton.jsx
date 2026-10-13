import "../../css/loaders/RouteSkeleton.css"

function ResultsSkeleton({ type }) {
  const isUsers = type === "users"

  return Array.from({ length: 6 }, (_, index) => (
    <div className="col-12 col-sm-6 col-md-4" key={index} aria-hidden="true">
      <div className={`results-skeleton-card ${isUsers ? "results-skeleton-user" : ""}`}>
        <span className="skeleton-shape results-skeleton-image" />
        <span className="skeleton-shape results-skeleton-line" />
        <span className="skeleton-shape results-skeleton-line results-skeleton-line-short" />
      </div>
    </div>
  ))
}

export default ResultsSkeleton