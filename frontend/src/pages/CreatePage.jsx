import { Link, useNavigate } from "react-router";
import { useCreateProduct } from "../hooks/useProducts";
import { useState, useEffect } from "react";
import api from "../lib/axios";
import {
  ArrowLeftIcon,
  FileTextIcon,
  ImageIcon,
  SparklesIcon,
  TypeIcon,
  MapPinIcon,
  DollarSignIcon,
  PlusIcon,
} from "lucide-react";

function CreatePage() {
  const CITIES = ["delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "jaipur", "ahmedabad", "lucknow", "chandigarh", "surat", "nagpur"];
  const navigate = useNavigate();
  const createProduct = useCreateProduct();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    price: "",
    isNegotiable: false,
  });

  const [city, setCity] = useState(() => localStorage.getItem("city") || "");
  const [savingCity, setSavingCity] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherCity, setOtherCity] = useState("");

  useEffect(() => {
    if (localStorage.getItem("city")) {
      setCity(localStorage.getItem("city"));
    }
  }, []);

  const saveCity = async (selectedCity) => {
    setSavingCity(true);
    try {
      await api.patch("/users/city", { city: selectedCity });
      localStorage.setItem("city", selectedCity);
      setCity(selectedCity);
    } catch (e) {
      console.error("Failed to save city:", e);
    }
    setSavingCity(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!city) return;

    createProduct.mutate({ ...formData, city }, {
      onSuccess: () => {
        setFormData({ title: "", description: "", imageUrl: "", price: "", isNegotiable: false });
        navigate("/");
      },
    });
  };

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
            <SparklesIcon className="size-6 text-primary" />
            Create New Product
          </h1>
          <p className="text-base-content/60 text-sm mb-4">Fill in the details to list your product</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* City Selector */}
            <div className="p-4 rounded-lg bg-base-200 border border-base-content/5">
              <div className="flex items-center gap-2 mb-3">
                <MapPinIcon className="size-4 text-primary" />
                <span className="font-medium text-sm">Select city</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {CITIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`btn btn-sm capitalize ${city === c ? "btn-primary" : "btn-outline"}`}
                    onClick={() => saveCity(c)}
                    disabled={savingCity}
                  >
                    {c}
                  </button>
                ))}
                <button
                  type="button"
                  className={`btn btn-sm capitalize ${showOtherInput ? "btn-primary" : "btn-outline"}`}
                  onClick={() => setShowOtherInput(!showOtherInput)}
                >
                  Other
                </button>
              </div>
              {showOtherInput && (
                <div className="flex gap-2 mt-3">
                  <input
                    type="text"
                    placeholder="Enter city name"
                    className="input input-bordered input-sm flex-1 bg-base-300"
                    value={otherCity}
                    onChange={(e) => setOtherCity(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-primary"
                    onClick={() => {
                      if (otherCity.trim()) {
                        saveCity(otherCity.trim().toLowerCase());
                        setOtherCity("");
                        setShowOtherInput(false);
                      }
                    }}
                    disabled={savingCity || !otherCity.trim()}
                  >
                    <PlusIcon className="size-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Title */}
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
                disabled={!city}
              />
            </div>

            {/* Image URL */}
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
                disabled={!city}
              />
            </div>

            {/* Image Preview */}
            {formData.imageUrl && (
              <div className="rounded-lg overflow-hidden border border-base-content/5">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover"
                  onError={(e) => (e.target.style.display = "none")}
                />
              </div>
            )}

            {/* Price */}
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
                  disabled={!city}
                />
              </div>
            </div>

            {/* Negotiable */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={formData.isNegotiable}
                  onChange={(e) => setFormData({ ...formData, isNegotiable: e.target.checked })}
                  disabled={!city}
                />
                <span className="label-text">Price is negotiable</span>
              </label>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text flex items-center gap-2 mr-4">
                  <FileTextIcon className="size-4" /> Description
                </span>
              </label>
              <textarea
                placeholder="Describe your product..."
                className="textarea textarea-bordered bg-base-200 h-32 max-w-full"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                disabled={!city}
              />
            </div>

            {createProduct.isError && (
              <div role="alert" className="alert alert-error">
                <span>Failed to create product. Please try again.</span>
              </div>
            )}

            {!city && (
              <div className="alert bg-base-200">
                <span>Please select a city to continue</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full gap-2 hover:scale-[1.01] transition-transform"
              disabled={createProduct.isPending || !city}
            >
              {createProduct.isPending ? (
                <span className="loading loading-spinner" />
              ) : (
                <>
                  <SparklesIcon className="size-5" />
                  Create Product
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreatePage;
