import { useNavigate, useParams, Link } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { useProduct, useUpdateProduct } from "../hooks/useProducts";
import EditProductForm from "../components/EditProductForm";
import { ProductPageSkeleton } from "../components/Skeleton";
import { WifiIcon, ShieldAlertIcon } from "lucide-react";

function EditProductPage() {
  const { id } = useParams();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const { data: product, isLoading, error } = useProduct(id);
  const updateProduct = useUpdateProduct();

  if (isLoading) return <ProductPageSkeleton />;

  if (error || !product) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
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

  if (product.userId !== userId) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2">
            <span className="hidden sm:inline">Back</span>
          </button>
        </div>
        <div role="alert" className="alert alert-warning">
          <ShieldAlertIcon className="size-5" />
          <span>You can only edit your own products</span>
        </div>
      </div>
    );
  }

  return (
    <EditProductForm
      product={product}
      isPending={updateProduct.isPending}
      isError={updateProduct.isError}
      onSubmit={(formData) => {
        updateProduct.mutate(
          { id, ...formData },
          { onSuccess: () => navigate(`/product/${id}`) }
        );
      }}
    />
  );
}

export default EditProductPage;
