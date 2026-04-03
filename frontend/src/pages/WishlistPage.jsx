import { Link, useNavigate } from "react-router";
import { HeartIcon, Trash2Icon, EyeIcon, MapPinIcon } from "lucide-react";
import { useState, useEffect } from "react";

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlist(stored);
  }, []);

  const removeFromWishlist = (id) => {
    const updated = wishlist.filter((item) => item.id !== id);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlist(updated);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  if (wishlist.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <HeartIcon className="size-6 text-secondary" />
          My Wishlist
        </h1>
        <div className="card bg-base-300">
          <div className="card-body items-center text-center py-16">
            <HeartIcon className="size-16 text-base-content/20" />
            <h3 className="card-title text-base-content/50">Your wishlist is empty</h3>
            <p className="text-base-content/40 text-sm">Browse products and click the heart icon to add them here</p>
            <Link to="/" className="btn btn-primary mt-4">
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <HeartIcon className="size-6 text-secondary" />
        My Wishlist
        <span className="text-base-content/60 text-sm font-normal">({wishlist.length} items)</span>
      </h1>

      <div className="grid gap-4">
        {wishlist.map((product) => {
          const isNew = new Date(product.createdAt) > oneWeekAgo;
          const isSold = product.isSold === "true" || product.is_sold === "true";

          return (
            <div key={product.id} className={`card card-side bg-base-300 ${isSold ? 'opacity-75' : ''}`}>
              <figure className="w-32 shrink-0">
                <img src={product.imageUrl} alt={product.title} className="h-full object-cover" />
              </figure>
              <div className="card-body p-4">
                <h2 className="card-title text-base">
                  {product.title}
                  {(product.isSold === "true" || product.is_sold === "true") && (
                    <span className="badge badge-success badge-sm">SOLD</span>
                  )}
                  {isNew && !isSold && <span className="badge badge-secondary badge-sm">NEW</span>}
                  {product.isNegotiable === "true" && !isSold && (
                    <span className="badge badge-primary badge-sm">Negotiable</span>
                  )}
                </h2>
                {product.city && (
                  <div className="flex items-center gap-1 text-xs text-base-content/60 capitalize">
                    <MapPinIcon className="size-3" />
                    {product.city}
                  </div>
                )}
                {product.price && (
                  <p className="text-lg font-bold text-primary">₹{product.price}</p>
                )}
                <p className="text-sm text-base-content/60 line-clamp-1">{product.description}</p>
                <div className="card-actions justify-end mt-2">
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="btn btn-ghost btn-xs gap-1"
                  >
                    <EyeIcon className="size-3" /> View
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className="btn btn-ghost btn-xs text-error gap-1"
                  >
                    <Trash2Icon className="size-3" /> Remove
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default WishlistPage;
