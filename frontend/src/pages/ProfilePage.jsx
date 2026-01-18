import { Link, useNavigate } from "react-router";
import { useMyProducts, useDeleteProduct } from "../hooks/useProducts";
import { useConversations } from "../hooks/useMessages";
import LoadingSpinner from "../components/LoadingSpinner";
import { PlusIcon, PackageIcon, EyeIcon, EditIcon, Trash2Icon, TagIcon, ShoppingCartIcon } from "lucide-react";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useMyProducts();
  const { data: conversations = [] } = useConversations();
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id) => {
    if (confirm("Delete this product?")) deleteProduct.mutate(id);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-base-content/60 text-sm">Manage your listings and interests</p>
        </div>
        <Link to="/create" className="btn btn-primary btn-sm gap-1">
          <PlusIcon className="size-4" /> New Product
        </Link>
      </div>

      {/* Stats */}
      <div className="stats bg-base-300 w-full">
        <div className="stat">
          <div className="stat-title flex items-center gap-2">
            <TagIcon className="size-4" /> Selling
          </div>
          <div className="stat-value text-primary">{products?.length || 0}</div>
        </div>
        <div className="stat">
          <div className="stat-title flex items-center gap-2">
            <ShoppingCartIcon className="size-4" /> Interested In
          </div>
          <div className="stat-value text-secondary">{conversations.length}</div>
        </div>
      </div>

      {/* Selling Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <TagIcon className="size-5 text-primary" />
          Selling
        </h2>

        {products?.length === 0 ? (
          <div className="card bg-base-300">
            <div className="card-body items-center text-center py-12">
              <PackageIcon className="size-12 text-base-content/20" />
              <h3 className="card-title text-base-content/50">No products yet</h3>
              <p className="text-base-content/40 text-sm">Start selling by creating your first product</p>
              <Link to="/create" className="btn btn-primary btn-sm mt-4">
                Create Product
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {products?.map((product) => (
              <div key={product.id} className="card card-side bg-base-300">
                <figure className="w-32 shrink-0">
                  <img src={product.imageUrl} alt={product.title} className="h-full object-cover" />
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title text-base">
                    {product.title}
                    {(product.isSold === "true" || product.is_sold === "true") && (
                      <span className="badge badge-success badge-sm">SOLD</span>
                    )}
                    {product.isNegotiable === "true" && product.isSold !== "true" && product.is_sold !== "true" && (
                      <span className="badge badge-primary badge-sm">Negotiable</span>
                    )}
                  </h2>
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
                      onClick={() => navigate(`/edit/${product.id}`)}
                      className="btn btn-ghost btn-xs gap-1"
                    >
                      <EditIcon className="size-3" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-ghost btn-xs text-error gap-1"
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2Icon className="size-3" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interested In Section */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
          <ShoppingCartIcon className="size-5 text-secondary" />
          Interested In
        </h2>

        {conversations.length === 0 ? (
          <div className="card bg-base-300">
            <div className="card-body items-center text-center py-12">
              <ShoppingCartIcon className="size-12 text-base-content/20" />
              <h3 className="card-title text-base-content/50">No interests yet</h3>
              <p className="text-base-content/40 text-sm">Products you're interested in will appear here</p>
            </div>
          </div>
        ) : (
          <div className="grid gap-4">
            {conversations.map((conv) => (
              <div key={conv.id} className="card card-side bg-base-300 border-2 border-secondary/30">
                <figure className="w-24 shrink-0">
                  <img src={conv.product?.imageUrl} alt={conv.product?.title} className="h-full object-cover" />
                </figure>
                <div className="card-body p-4">
                  <h2 className="card-title text-base">{conv.product?.title}</h2>
                  {conv.product?.price && (
                    <p className="text-lg font-bold text-primary">₹{conv.product?.price}</p>
                  )}
                  <p className="text-sm text-base-content/60">
                    Seller: {conv.seller?.name || "Unknown"}
                  </p>
                  <div className="card-actions justify-end mt-2">
                    <button
                      onClick={() => navigate(`/chat/${conv.id}`)}
                      className="btn btn-secondary btn-sm gap-1"
                    >
                      <EyeIcon className="size-3" /> View Chat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
