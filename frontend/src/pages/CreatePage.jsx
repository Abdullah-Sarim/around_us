import { Link, useNavigate } from "react-router";
import { useCreateProduct } from "../hooks/useProducts";
import { useState } from "react";
import api from "../lib/axios";
import {
  ArrowLeftIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon,
  TypeIcon,
  MapPinIcon,
  DollarSignIcon,
} from "lucide-react";

function CreatePage() {
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    price: "",
    isNegotiable: false,
  });

  const [city, setCity] = useState(localStorage.getItem("city") || "");
  const [savingCity, setSavingCity] = useState(false);

  // 🔹 Save city to backend + localStorage
  const saveCity = async (selectedCity) => {
    setSavingCity(true);

    await api.patch("/users/city", { city: selectedCity });

    localStorage.setItem("city", selectedCity);
    setCity(selectedCity);
    setSavingCity(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!city) return;

    createProduct.mutate(formData, {
      onSuccess: () => {
        setFormData({ title: "", description: "", imageUrl: "" });
        navigate("/");
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/" className="btn btn-ghost btn-sm gap-1 mb-4">
        <ArrowLeftIcon className="size-4" /> Back
      </Link>

      <div className="card bg-base-300">
        <div className="card-body">
          <h1 className="card-title">
            <SparklesIcon className="size-5 text-primary" />
            New Product
          </h1>

          {/*CITY REQUIRED */}
          {!city && (
            <div className="alert alert-warning flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <MapPinIcon className="size-4" />
                <span>Please select your city before creating a product</span>
              </div>

              <div className="flex gap-2">
                {["delhi", "mumbai", "bangalore"].map((c) => (
                  <button
                    key={c}
                    className="btn btn-outline btn-sm capitalize"
                    onClick={() => saveCity(c)}
                    disabled={savingCity}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* TITLE */}
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <TypeIcon className="size-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Product title"
                className="grow"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                disabled={!city}
              />
            </label>

            {/* IMAGE URL */}
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <ImageIcon className="size-4 text-base-content/50" />
              <input
                type="url"
                placeholder="Image URL"
                className="grow"
                value={formData.imageUrl}
                onChange={(e) =>
                  setFormData({ ...formData, imageUrl: e.target.value })
                }
                required
                disabled={!city}
              />
            </label>

            {/* IMAGE PREVIEW */}
            {formData.imageUrl && (
              <div className="rounded-box overflow-hidden">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {/* PRICE */}
            <label className="input input-bordered flex items-center gap-2 bg-base-200">
              <DollarSignIcon className="size-4 text-base-content/50" />
              <input
                type="number"
                placeholder="Price (₹)"
                className="grow"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                disabled={!city}
              />
            </label>

            {/* NEGOTIABLE CHECKBOX */}
            <div className="form-control">
              <label className="label cursor-pointer gap-2">
                <span className="label-text">Price is negotiable</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isNegotiable}
                  onChange={(e) =>
                    setFormData({ ...formData, isNegotiable: e.target.checked })
                  }
                  disabled={!city}
                />
              </label>
            </div>

            {/* DESCRIPTION */}
            <div className="form-control">
              <div className="flex items-start gap-2 p-3 rounded-box bg-base-200 border border-base-300">
                <FileTextIcon className="size-4 text-base-content/50 mt-1" />
                <textarea
                  placeholder="Description"
                  className="grow bg-transparent resize-none focus:outline-none min-h-24"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  required
                  disabled={!city}
                />
              </div>
            </div>

            {createProduct.isError && (
              <div role="alert" className="alert alert-error alert-sm">
                <span>Failed to create. Try again.</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={createProduct.isPending || !city}
            >
              {createProduct.isPending ? (
                <span className="loading loading-spinner" />
              ) : city ? (
                "Create Product"
              ) : (
                "Select city first"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
