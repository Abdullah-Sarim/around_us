import { Link } from "react-router";
import { MessageCircleIcon } from "lucide-react";

const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const ProductCard = ({ product }) => {
  const isNew = new Date(product.createdAt) > oneWeekAgo;
  const isSold = product.isSold === "true" || product.is_sold === "true";

  return (
    <Link
      to={`/product/${product.id}`}
      className={`card bg-base-300 hover:bg-base-200 transition-colors ${isSold ? 'opacity-75' : ''}`}
    >
      <figure className="px-4 pt-4 relative">
        <img
          src={product.imageUrl}
          alt={product.title}
          className={`rounded-xl h-70 w-full object-fill ${isSold ? 'grayscale-[50%]' : ''}`}
        />
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="badge badge-success badge-lg">SOLD</span>
          </div>
        )}
      </figure>
      <div className="card-body p-4">
        <h2 className="card-title text-base">
          {product.title}
          {isSold && <span className="badge badge-success badge-sm">SOLD</span>}
          {isNew && !isSold && <span className="badge badge-secondary badge-sm">NEW</span>}
        </h2>
        {product.price != null && product.price !== "" && (
          <div className="text-lg font-bold text-primary">
            ₹{product.price}
            {product.isNegotiable === "true" && (
              <span className="text-xs font-normal text-base-content/60 ml-1">Negotiable</span>
            )}
          </div>
        )}
        <p className="text-sm text-base-content/70 line-clamp-2">{product.description}</p>

        <div className="divider my-1"></div>

        <div className="flex items-center justify-between">
          {product.user && (
            <div className="flex items-center gap-2">
              <div className="avatar">
                <div className="w-6 rounded-full ring-1 ring-primary">
                  <img src={product.user.imageUrl} alt={product.user.name} />
                </div>
              </div>
              <span className="text-xs text-base-content/60">{product.user.name}</span>
            </div>
          )}
          {product.comments && (
            <div className="flex items-center gap-1 text-base-content/50">
              <MessageCircleIcon className="size-3" />
              <span className="text-xs">{product.comments.length}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
