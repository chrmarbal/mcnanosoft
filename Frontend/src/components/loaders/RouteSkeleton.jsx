import "../../css/loaders/RouteSkeleton.css"

function Placeholder({ className = "" }) {
  return <span className={`skeleton-shape ${className}`} aria-hidden="true" />
}

function RouteSkeleton({ pathname }) {
  const isAuth = ["/login", "/register", "/recovery", "/reset-password"].includes(pathname)
  const isPayment = pathname.startsWith("/payment/")
  const isHome = pathname === "/"
  const isLibrary = pathname === "/library"
  const isUsers = pathname === "/users"
  const isCatalog = pathname === "/projects" || isUsers
  const isUserProfile = pathname === "/profile" || (pathname.startsWith("/users/") && pathname !== "/users/new")
  const isProjectDetail = pathname.startsWith("/projects/") && pathname !== "/projects/new" && !pathname.startsWith("/projects/edit/")
  const variant = isAuth ? "auth" : isPayment ? "payment" : isHome ? "home" : isLibrary ? "library" : isCatalog ? "catalog" : isUserProfile ? "profile" : isProjectDetail ? "detail" : "form"

  return (
    <section className={`page-skeleton skeleton-${variant}`} role="status" aria-label="Cargando página">
      {variant === "catalog" && (
        <div className="skeleton-catalog-layout">
          <aside className="skeleton-filters">
            <Placeholder className="skeleton-heading" />
            {[0, 1, 2, 3].map(item => <Placeholder className="skeleton-filter" key={item} />)}
          </aside>
          <div className="skeleton-catalog-content">
            <Placeholder className="skeleton-title" />
            <Placeholder className="skeleton-search" />
            <div className={`skeleton-grid ${isUsers ? "skeleton-user-grid" : ""}`}>
              {[0, 1, 2, 3, 4, 5].map(item => (
                <div className="skeleton-card" key={item}>
                  <Placeholder className="skeleton-card-image" />
                  <Placeholder className="skeleton-line" />
                  <Placeholder className="skeleton-line skeleton-line-short" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {variant === "home" && (
        <>
          <div className="skeleton-hero">
            <Placeholder className="skeleton-hero-mark" />
            <Placeholder className="skeleton-hero-title" />
            <Placeholder className="skeleton-hero-copy" />
          </div>
          <Placeholder className="skeleton-title" />
          <div className="skeleton-grid skeleton-home-grid">
            {[0, 1, 2].map(item => (
              <div className="skeleton-card" key={item}>
                <Placeholder className="skeleton-card-image" />
                <Placeholder className="skeleton-line" />
                <Placeholder className="skeleton-line skeleton-line-short" />
              </div>
            ))}
          </div>
        </>
      )}

      {variant === "library" && (
        <div className="skeleton-library-layout">
          <aside className="skeleton-library-sidebar">
            <Placeholder className="skeleton-title" />
            {[0, 1, 2, 3].map(item => (
              <div className="skeleton-library-item" key={item}>
                <Placeholder className="skeleton-library-icon" />
                <Placeholder className="skeleton-line" />
              </div>
            ))}
          </aside>
          <div className="skeleton-library-detail">
            <Placeholder className="skeleton-title" />
            <Placeholder className="skeleton-library-cover" />
            <Placeholder className="skeleton-line" />
            <Placeholder className="skeleton-line skeleton-line-short" />
            <Placeholder className="skeleton-action" />
          </div>
        </div>
      )}

      {variant === "detail" && (
        <>
          <Placeholder className="skeleton-back-link" />
          <div className="skeleton-detail-layout">
            <div className="skeleton-detail-copy">
              <Placeholder className="skeleton-project-icon" />
              <Placeholder className="skeleton-title" />
              <Placeholder className="skeleton-line" />
              <Placeholder className="skeleton-line" />
              <Placeholder className="skeleton-line skeleton-line-short" />
              <Placeholder className="skeleton-action" />
            </div>
            <Placeholder className="skeleton-detail-image" />
          </div>
          <Placeholder className="skeleton-title skeleton-review-title" />
          <Placeholder className="skeleton-review" />
        </>
      )}

      {variant === "profile" && (
        <div className="skeleton-profile-layout">
          <div className="skeleton-profile-aside">
            <Placeholder className="skeleton-profile-avatar" />
            <Placeholder className="skeleton-line" />
            <Placeholder className="skeleton-action" />
          </div>
          <div className="skeleton-profile-content">
            <Placeholder className="skeleton-title" />
            {[0, 1, 2, 3].map(item => <Placeholder className="skeleton-line" key={item} />)}
          </div>
        </div>
      )}

      {variant === "form" && (
        <div className="skeleton-form">
          <Placeholder className="skeleton-title" />
          {[0, 1, 2, 3, 4].map(item => (
            <div className="skeleton-field" key={item}>
              <Placeholder className="skeleton-label" />
              <Placeholder className="skeleton-input" />
            </div>
          ))}
          <Placeholder className="skeleton-action" />
        </div>
      )}

      {variant === "auth" && (
        <div className="skeleton-auth-layout">
          <Placeholder className="skeleton-auth-art" />
          <div className="skeleton-auth-form">
            <Placeholder className="skeleton-title" />
            {[0, 1, 2].map(item => <Placeholder className="skeleton-input" key={item} />)}
            <Placeholder className="skeleton-action" />
          </div>
        </div>
      )}

      {variant === "payment" && (
        <div className="skeleton-payment-layout">
          <Placeholder className="skeleton-payment-mark" />
          <Placeholder className="skeleton-title" />
          <Placeholder className="skeleton-payment-copy" />
          <Placeholder className="skeleton-action" />
        </div>
      )}
    </section>
  )
}

export default RouteSkeleton