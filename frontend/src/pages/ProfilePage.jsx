import { Link, useNavigate } from "react-router";
import { useMyProducts, useDeleteProduct } from "../hooks/useProducts";
import { useConversations } from "../hooks/useMessages";
import LoadingSpinner from "../components/LoadingSpinner";
import { PlusIcon, PackageIcon, EyeIcon, EditIcon, Trash2Icon, TagIcon, ShoppingCartIcon, MapPinIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { getCurrentUser, updateUserCity } from "../lib/api";
import { confirmDialog } from "../components/ConfirmDialog";

const CITIES = ["delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "jaipur", "ahmedabad", "lucknow", "chandigarh", "surat", "nagpur"];

const ProfilePage = () => {
  const navigate = useNavigate();
  const { data: products, isLoading } = useMyProducts();
  const { data: conversations = [] } = useConversations();
  const deleteProduct = useDeleteProduct();

  const [userCity, setUserCity] = useState(null);
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [savingCity, setSavingCity] = useState(false);

  useEffect(() => {
    async function fetchUserCity() {
      const { user } = await getCurrentUser();
      if (user?.city) setUserCity(user.city);
    }
    fetchUserCity();
  }, []);

  const handleCityChange = async (city) => {
    setSavingCity(true);
    await updateUserCity(city);
    localStorage.setItem("city", city);
    setUserCity(city);
    setSavingCity(false);
    setShowCitySelector(false);
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: "Delete Product",
      message: "Are you sure you want to delete this product?",
      confirmText: "Delete",
      type: "danger"
    });
    if (confirmed) deleteProduct.mutate(id);
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="sm:text-2xl text-xl font-bold">My Profile</h1>
          <p className="text-base-content/60 text-sm">Manage your listings and interests</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCitySelector(!showCitySelector)}
            className="btn btn-outline btn-sm gap-1"
          >
            <MapPinIcon className="size-4" />
            {userCity ? userCity.charAt(0).toUpperCase() + userCity.slice(1) : "Set City"}
          </button>
          <Link to="/create" className="btn btn-primary btn-sm gap-1">
            <PlusIcon className="size-4" /> Product
          </Link>
        </div>
      </div>

      {/* City Selector */}
      {showCitySelector && (
        <div className="card bg-base-300">
          <div className="card-body p-4">
            <h3 className="font-medium mb-2">Select your city</h3>
            <div className="flex flex-wrap gap-2">
              {CITIES.map((city) => (
                <button
                  key={city}
                  className={`btn btn-sm capitalize ${userCity === city ? "btn-primary" : "btn-outline"}`}
                  onClick={() => handleCityChange(city)}
                  disabled={savingCity}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <figure className="w-30  sm:w-50 shrink-0">
                  <img src={product.imageUrl} alt={product.title} className="h-full object-cover" />
                </figure>
                <div className="card-body p-2 sm:p-4">
                  <h2 className="card-title text-base">
                    {product.title}
                    {(product.isSold === "true" || product.is_sold === "true") && (
                      <span className="badge badge-success badge-sm">SOLD</span>
                    )}
                    {product.isNegotiable === "true" && product.isSold !== "true" && product.is_sold !== "true" && (
                      <span className="text-sm font-normal text-base-content/70 ml-1">(Negotiable)</span>
                    )}
                  </h2>
                  {product.price && (
                    <p className="text-lg font-bold text-primary">₹{product.price}</p>
                  )}
                  <p className="text-sm text-base-content/60 line-clamp-1 truncate max-w-50">{product.description}</p>
                  <div className="card-actions justify-end mt-2">
                    <button
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="btn btn-ghost btn-sm sm:btn-xs gap-1"
                    >
                      <EyeIcon className="size-3 sm:size-5" /> View
                    </button>
                    <button
                      onClick={() => navigate(`/edit/${product.id}`)}
                      className="btn btn-ghost btn-sm sm:btn-xs gap-1"
                    >
                      <EditIcon className="size-3 sm:size-5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-ghost btn-sm sm:btn-xs text-error gap-1"
                      disabled={deleteProduct.isPending}
                    >
                      <Trash2Icon className="size-3 sm:size-5" /> Delete
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
