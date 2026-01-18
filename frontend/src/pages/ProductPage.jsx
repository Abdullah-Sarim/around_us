import { ArrowLeftIcon, EditIcon, Trash2Icon, CalendarIcon, UserIcon, MessageCircleIcon, CheckCircleIcon } from "lucide-react";
import LoadingSpinner from "../components/LoadingSpinner";
import CommentsSection from "../components/CommentsSection";
import { useAuth } from "@clerk/clerk-react";
import { useProduct, useDeleteProduct } from "../hooks/useProducts";
import { useParams, Link, useNavigate } from "react-router";
import { useStartConversation, useMarkAsSold } from "../hooks/useMessages";

function ProductPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useProduct(id);
  const deleteProduct = useDeleteProduct();
  const startConversation = useStartConversation();
  const markAsSold = useMarkAsSold();

  const handleMessage = async () => {
    if (!userId) return;
    try {
      const conv = await startConversation.mutateAsync({ 
        productId: id, 
        sellerId: product.userId 
      });
      navigate(`/chat/${conv.id}`);
    } catch (err) {
      console.error("Failed to start conversation:", err);
    }
  };

  const handleDelete = () => {
    if (confirm("Delete this product permanently? This will also delete all message conversations.")) {
      deleteProduct.mutate(id, { onSuccess: () => navigate("/") });
    }
  };

  const handleMarkAsSold = async () => {
    if (confirm("Mark this product as sold? This will end all message conversations.")) {
      try {
        console.log("Marking product as sold, id:", id);
        const result = await markAsSold.mutateAsync({ productId: id });
        console.log("Mark as sold success:", result);
      } catch (error) {
        console.error("Full error:", error);
        console.error("Response data:", error.response?.data);
        alert(error.response?.data?.error || error.message || "Failed to mark as sold");
      }
    }
  };

  const isSold = product?.isSold === "true" || product?.is_sold === "true";

  if (isLoading) return <LoadingSpinner />;

  if (error || !product) {
    return (
      <div className="card bg-base-300 max-w-md mx-auto">
        <div className="card-body items-center text-center">
          <h2 className="card-title text-error">Product not found</h2>
          <Link to="/" className="btn btn-primary btn-sm">
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = userId === product.userId;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="btn btn-ghost btn-sm gap-1">
          <ArrowLeftIcon className="size-4" /> Back
        </Link>
        {isOwner && (
          <div className="flex gap-2">
            {!isSold && (
              <button
                onClick={handleMarkAsSold}
                className="btn btn-success btn-sm gap-1"
                disabled={markAsSold.isPending}
              >
                <CheckCircleIcon className="size-4" />
                {isSold ? "Sold" : "Mark Sold"}
              </button>
            )}
            {isSold && (
              <span className="badge badge-success badge-lg">SOLD</span>
            )}
            <Link to={`/edit/${product.id}`} className="btn btn-ghost btn-sm gap-1">
              <EditIcon className="size-4" /> Edit
            </Link>
            <button
              onClick={handleDelete}
              className="btn btn-error btn-sm gap-1"
              disabled={deleteProduct.isPending}
            >
              {deleteProduct.isPending ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <Trash2Icon className="size-4" />
              )}
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Image */}
        <div className={`card bg-base-300 ${isSold ? 'opacity-80' : ''}`}>
          <figure className="sm:p-4 p-5 relative">
            <img
              src={product.imageUrl}
              alt={product.title}
              className={`rounded-xl w-full h-full object-cover ${isSold ? 'grayscale-[30%]' : ''}`}
            />
            {isSold && (
              <div className="absolute inset-0 flex items-center justify-center bg-base-100/30">
                <span className="badge badge-success badge-lg">SOLD</span>
              </div>
            )}
          </figure>
        </div>

        <div className="card bg-base-300">
          <div className="card-body">
            <h1 className="card-title text-2xl">{product.title}</h1>

            <div className="flex flex-wrap gap-4 text-sm text-base-content/60 my-2">
              {product.price != null && product.price !== "" && (
                <div className="text-2xl font-bold text-primary">
                  ₹{product.price}
                  {product.isNegotiable === "true" && (
                    <span className="text-sm font-normal text-base-content/60 ml-2">(Negotiable)</span>
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

            <p className="text-base-content/80 leading-relaxed">{product.description}</p>

            {product.user && (
              <>
                <div className="divider my-2"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="avatar">
                      <div className="w-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                        <img src={product.user.imageUrl} alt={product.user.name} />
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
        <div className="card bg-base-300">
          <div className="card-body">
            <CommentsSection productId={id} comments={product.comments} currentUserId={userId} productOwnerId={product.userId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductPage;
