import "../../css/loaders/RouteSkeleton.css"

function CartSkeleton() {
  return (
    <div className="cart-skeleton" role="status" aria-label="Cargando carrito">
      {[0, 1, 2].map(item => (
        <div className="cart-skeleton-row" key={item} aria-hidden="true">
          <span className="skeleton-shape cart-skeleton-image" />
          <span className="cart-skeleton-copy">
            <span className="skeleton-shape cart-skeleton-line" />
            <span className="skeleton-shape cart-skeleton-line cart-skeleton-line-short" />
          </span>
        </div>
      ))}
      <span className="skeleton-shape cart-skeleton-total" aria-hidden="true" />
      <span className="skeleton-shape cart-skeleton-action" aria-hidden="true" />
    </div>
  )
}

export default CartSkeleton