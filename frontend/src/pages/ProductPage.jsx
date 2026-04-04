import {
  ArrowLeftIcon,
  EditIcon,
  Trash2Icon,
  CalendarIcon,
  UserIcon,
  MessageCircleIcon,
  CheckCircleIcon,
  MapPinIcon,
  RotateCcwIcon,
  WifiIcon,
} from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import CommentsSection from "../components/CommentsSection";
import { useAuth } from "@clerk/clerk-react";
import { useProduct, useDeleteProduct } from "../hooks/useProducts";
import { useParams, Link, useNavigate } from "react-router";
import {
  useStartConversation,
  useMarkAsSold,
  useMarkAsUnsold,
} from "../hooks/useMessages";
import { confirmDialog } from "../components/ConfirmDialog";
import { ProductPageSkeleton } from "../components/Skeleton";

function ProductPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const startConversation = useStartConversation();
  const markAsSold = useMarkAsSold();
  const markAsUnsold = useMarkAsUnsold();

  const handleMessage = async () => {
    if (!userId) return;
    try {
      const conv = await startConversation.mutateAsync({
        productId: id,
        sellerId: product.userId,
      });
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirmDialog({
      title: "Delete Product",
      message:
        "Delete this product permanently? This will also delete all message conversations.",
      confirmText: "Delete",
      type: "danger",
    });
    if (confirmed) deleteProduct.mutate(id, { onSuccess: () => navigate("/") });
  };

  const handleMarkAsSold = async () => {
    const confirmed = await confirmDialog({
      title: "Mark as Sold",
      message:
        "Mark this product as sold? This will end all message conversations.",
      confirmText: "Mark as Sold",
      type: "primary",
    });
    if (confirmed) {
      try {
        const result = await markAsSold.mutateAsync({ productId: id });
        console.log("Mark as sold success:", result);
      } catch (error) {
        console.error("Full error:", error);
        alert(
          error.response?.data?.error ||
            error.message ||
            "Failed to mark as sold"
        );
      }
    }
  };

  const handleMarkAsUnsold = async () => {
    const confirmed = await confirmDialog({
      title: "Mark as Unsold",
      message: "Mark this product as available again?",
      confirmText: "Mark Unsold",
      type: "primary",
    });
    if (confirmed) {
      try {
        const result = await markAsUnsold.mutateAsync(id);
        console.log("Mark as unsold success:", result);
      } catch (error) {
        console.error("Full error:", error);
        alert(
          error.response?.data?.error ||
            error.message ||
            "Failed to mark as unsold"
        );
      }
    }
  };

  const isSold = product?.isSold === "true" || product?.is_sold === "true";

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-6xl sm:px-2 px-1 mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
            <ArrowLeftIcon className="size-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        <div role="alert" className="alert alert-error">
          <WifiIcon className="size-5" />
          <div>
            <span className="font-semibold">Could not load product</span>
            <p className="text-xs">Retrying automatically...</p>
          </div>
        </div>
      </div>
    );
  }

  const isOwner = userId === product.userId;

  return (
    <div className="max-w-11/12 sm:px-2 px-1 mx-auto space-y-2 md:space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-base-300 rounded-lg">
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2 hover:bg-base-200"
        >
          <ArrowLeftIcon className="size-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        {isOwner && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={isSold ? handleMarkAsUnsold : handleMarkAsSold}
              className={`btn btn-sm flex items-center gap-1 ${
                isSold ? "btn-warning" : "btn-success"
              }`}
              disabled={markAsSold.isPending || markAsUnsold.isPending}
            >
              {markAsSold.isPending || markAsUnsold.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isSold ? (
                <>
                  <RotateCcwIcon className="size-5" />
                  <span className="hidden sm:inline">Mark Unsold</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="size-5" />
                  <span className="hidden sm:inline">Mark Sold</span>
                </>
              )}
            </button>
            <Link
              to={`/edit/${product.id}`}
              className="btn btn-ghost btn-sm hover:bg-base-200"
            >
              <EditIcon className="size-5" />
              <span className="hidden sm:inline">Edit</span>
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-sm flex items-center gap-1"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  <Trash2Icon className="size-5" />
                  <span className="hidden sm:inline">Delete</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-3 md:gap-6">
        {/* Image */}
        <div
          className={`card bg-base-300 transition-shadow duration-300 hover:shadow-xl ${isSold ? "opacity-80" : ""}`}
        >
          <figure className="sm:p-4 p-5 relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`rounded-xl w-full h-full object-cover ${isSold ? "grayscale-[30%]" : ""}`}
            />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100/30">
                <span className="badge badge-success badge-lg">SOLD</span>
              </div>
            )}
          </figure>
        </div>

        <div className="card bg-base-300 transition-shadow duration-300 hover:shadow-xl">
          <div className="card-body">
            <h1 className="card-title text-2xl">{product.title}</h1>
            {product.city && (
              <div className="flex items-center gap-1 text-sm text-base-content/60 capitalize mb-2">
                <MapPinIcon className="size-4" />
                {product.city}
              </div>
            )}

            <div className="flex flex-wrap gap-4 text-sm text-base-content/60 my-2">
              {product.price != null && product.price !== "" && (
                <div className="text-2xl font-bold text-primary">
                  ₹{product.price}
                  {product.isNegotiable === "true" && (
                    <span className="text-sm font-normal text-base-content/60 ml-2">
                      (Negotiable)
                    </span>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1">
                <CalendarIcon className="size-4" />
                {new Date(product.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <UserIcon className="size-4" />
                {product.user?.name}
              </div>
            </div>

            <div className="divider my-2"></div>

            <p className="text-base-content/80 leading-relaxed">
              {product.description}
            </p>

            {product.user && (
              <>
                <div className="divider my-2"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img
                          src={product.user.imageUrl}
                          alt={product.user.name}
                        />
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold">{product.user.name}</p>
                      <p className="text-xs text-base-content/50">Creator</p>
                    </div>
                  </div>
                  {!isOwner && userId && !isSold && (
                    <button
                      onClick={handleMessage}
                      className="btn btn-primary btn-sm gap-2"
                      disabled={startConversation.isPending}
                    >
                      <MessageCircleIcon className="size-4" />
                      Message
                    </button>
                  )}
                  {isSold && (
                    <span className="badge badge-success">Item Sold</span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comments - hide for sold products */}
      {!isSold && (
        <div className="card bg-base-300 transition-shadow duration-300 hover:shadow-xl">
          <div className="card-body">
            <CommentsSection
              productId={id}
              comments={product.comments}
              currentUserId={userId}
              productOwnerId={product.userId}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
