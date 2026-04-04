import { ArrowLeftIcon, ImageIcon, TypeIcon, FileTextIcon, SaveIcon, DollarSignIcon, WifiIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { ProductPageSkeleton } from "./Skeleton";

function EditProductForm({ product, isPending, isError, onSubmit }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: product?.title || "",
    description: product?.description || "",
    imageUrl: product?.imageUrl || "",
    price: product?.price || "",
    isNegotiable: product?.isNegotiable === "true",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        imageUrl: product.imageUrl || "",
        price: product.price || "",
        isNegotiable: product.isNegotiable === "true",
      });
    }
  }, [product]);

  if (!product) return <ProductPageSkeleton />;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm gap-2 hover:bg-base-200">
          <ArrowLeftIcon className="size-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
      </div>

      <div className="card bg-base-300 transition-shadow duration-300 hover:shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-2xl flex items-center gap-2">
            <SaveIcon className="size-6 text-primary" />
            Edit Product
          </h1>
          <p className="text-base-content/60 text-sm mb-4">Update your product details</p>

          <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 mr-4">
                  <TypeIcon className="size-4" /> Title
                </span>
              </label>
              <input
                type="text"
                placeholder="What are you selling?"
                className="input input-bordered bg-base-200"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 mr-4">
                  <ImageIcon className="size-4" /> Image URL
                </span>
              </label>
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                className="input input-bordered bg-base-200"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                required
              />
            </div>

            {formData.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-base-content/5">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="h-60 object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 mr-4">
                  <DollarSignIcon className="size-4" /> Price
                </span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/50">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  className="input input-bordered bg-base-200 pl-8"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
            </div>

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                />
                <span className="label-text">Price is negotiable</span>
              </label>
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 mr-4">
                  <FileTextIcon className="size-4" /> Description
                </span>
              </label>
              <textarea
                placeholder="Describe your product..."
                className="textarea textarea-bordered bg-base-200 h-32"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            {isError && (
              <div role="alert" className="alert alert-error">
                <WifiIcon className="size-5" />
                <span>Failed to update. Retrying automatically...</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full gap-2 hover:scale-[1.01] transition-transform"
              disabled={isPending}
            >
              {isPending ? (
                <span className="loading loading-spinner" />
              ) : (
                <>
                  <SaveIcon className="size-5" />
                  Save Changes
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default EditProductForm;
