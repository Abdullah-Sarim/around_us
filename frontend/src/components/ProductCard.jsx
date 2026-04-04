import { Link } from "react-router";
import { MessageCircleIcon, MapPinIcon, HeartIcon, ClockIcon } from "lucide-react";
import { useState, useEffect } from "react";

const oneWeekAgo = new Date(Date.now() - 4 * 24 * 60 * 60 * 1000);

const ProductCard = ({ product }) => {
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const isNew = new Date(product.createdAt) > oneWeekAgo;
  const isSold = product.isSold === "true" || product.is_sold === "true";

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setIsInWishlist(wishlist.some((item) => item.id === product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    
    if (isInWishlist) {
      const updated = wishlist.filter((item) => item.id !== product.id);
      localStorage.setItem("wishlist", JSON.stringify(updated));
      setIsInWishlist(false);
      window.dispatchEvent(new Event("wishlistUpdated"));
    } else {
      wishlist.push(product);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      setIsInWishlist(true);
      window.dispatchEvent(new Event("wishlistUpdated"));
    }
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    const intervals = [
      { label: 'y', seconds: 31536000 },
      { label: 'mo', seconds: 2592000 },
      { label: 'd', seconds: 86400 },
      { label: 'h', seconds: 3600 },
      { label: 'm', seconds: 60 }
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count}${interval.label} ago`;
    }
    return 'Just now';
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className={`card bg-base-200 border border-base-content/5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 group ${isSold ? 'opacity-80' : ''}`}
    >
      <figure className="px-3 pt-3 relative overflow-hidden rounded-t-xl">
        <div className={`w-full h-55 bg-base-300 animate-pulse rounded-xl overflow-hidden ${imageLoaded ? 'hidden' : ''}`} />
        <img
          src={product.imageUrl}
          alt={product.title}
          className={`rounded-xl h-55 w-full object-cover transition-transform duration-500 group-hover:scale-105 ${isSold ? 'grayscale-[50%]' : ''} ${imageLoaded ? 'block' : 'hidden'}`}
          onLoad={() => setImageLoaded(true)}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center bg-base-100/60">
            <span className="badge badge-success badge-lg font-bold px-4">SOLD</span>
          </div>
        )}
        <button
          onClick={toggleWishlist}
          className={`absolute top-3 right-3 btn btn-circle btn-sm transition-all duration-300 hover:scale-110 ${
            isInWishlist 
              ? 'btn-secondary shadow-lg shadow-secondary/30' 
              : 'btn-ghost bg-base-100/80 hover:bg-base-100 hover:scale-110'
          }`}
        >
          <HeartIcon className={`size-4.5 transition-colors ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
        {!isSold && isNew && (
          <div className="absolute top-2.5 left-3">
            <span className="badge badge-secondary shadow-lg shadow-secondary/20 font-medium">NEW</span>
          </div>
        )}
      </figure>
      <div className="card-body p-3 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title text-base font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {product.title}
          </h2>
        </div>
        
        <div className="flex items-center gap-3 text-xs text-base-content/60">
          {product.city && (
            <div className="flex items-center gap-1">
              <MapPinIcon className="size-3 text-primary" />
              <span className="capitalize">{product.city}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <ClockIcon className="size-3" />
            <span>{timeAgo(product.createdAt)}</span>
          </div>
        </div>
        
        {product.price != null && product.price !== "" && (
          <div className="text-xl font-bold text-primary">
            ₹{product.price}
            {product.isNegotiable === "true" && (
              <span className="text-xs font-medium text-base-content/50 ml-2 bg-primary/10 px-2 py-0.5 rounded">Negotiable</span>
            )}
          </div>
        )}
        
        <p className="text-sm text-base-content/70 line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="divider my-1"></div>

        <div className="flex items-center justify-between">
          {product.user && (
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-8 rounded-full ring-2 ring-primary/30">
                  <img src={product.user.imageUrl} alt={product.user.name} />
                </div>
              </div>
              <span className="text-s text-base-content/70 truncate max-w-50">{product.user.name}</span>
            </div>
          )}
          {product.comments && product.comments.length > 0 && (
            <div className="flex items-center gap-1.5 text-base-content/50 bg-base-300/50 px-2 py-1 rounded-full">
              <MessageCircleIcon className="size-3" />
              <span className="text-xs font-medium">{product.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
