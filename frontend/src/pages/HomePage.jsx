import { useProducts, useSearchProducts } from "../hooks/useProducts";
import { PackageIcon, SparklesIcon, MapPinIcon, ChevronDownIcon, SearchIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../lib/api";

const CITIES = ["all", "delhi", "mumbai", "bangalore"];

function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, user } = useUser();
  const [selectedCity, setSelectedCity] = useState("all");
  const [showDropdown, setShowDropdown] = useState(false);
  const [userCity, setUserCity] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationInfo, setPaginationInfo] = useState(null);
  const searchMutation = useSearchProducts();

  useEffect(() => {
    if (location.state?.searchResults) {
      const results = Array.isArray(location.state.searchResults) 
        ? location.state.searchResults 
        : (location.state.searchResults.products || []);
      setSearchResults(results);
      setSearchQuery(location.state.searchQuery || "");
    }
  }, [location.state]);

  useEffect(() => {
    async function fetchUserCity() {
      if (isSignedIn) {
        try {
          const { user: dbUser } = await getCurrentUser();
          if (dbUser?.city) {
            setUserCity(dbUser.city);
            setSelectedCity(dbUser.city);
          }
        } catch (e) {
          console.error("Error fetching user:", e);
        }
      }
      setIsLoadingUser(false);
    }
    fetchUserCity();
  }, [isSignedIn]);

  const cityQuery = selectedCity === "all" ? null : selectedCity;
  
  const { data: productsData, isLoading, error } = useProducts(cityQuery, currentPage);
  
  const products = (Array.isArray(productsData) ? productsData : (productsData?.products || [])).filter(Boolean);
  
  useEffect(() => {
    if (productsData && typeof productsData === 'object' && productsData.totalPages) {
      setPaginationInfo({
        total: productsData.total,
        page: productsData.page,
        totalPages: productsData.totalPages,
        limit: productsData.limit
      });
    } else {
      setPaginationInfo(null);
    }
  }, [productsData]);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    setShowDropdown(false);
    setSearchResults(null);
    setSearchQuery("");
    setCurrentPage(1);
    setPaginationInfo(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    try {
      const result = await searchMutation.mutateAsync({ query: searchInput });
      setSearchResults(Array.isArray(result) ? result : (result.products || []));
      setSearchQuery(searchInput);
      setSearchInput("");
      if (result.totalPages) {
        setPaginationInfo({
          total: result.total,
          page: result.page,
          totalPages: result.totalPages,
          limit: result.limit
        });
      }
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  const displayCity = selectedCity === "all" ? "All Cities" : selectedCity;

  if (isLoadingUser) return <LoadingSpinner />;

  return (
    <div className="space-y-10">
      {/* HERO */}
      <div className="hero bg-linear-to-br from-base-300 via-base-200 to-base-300 rounded-box overflow-hidden">
        <div className="hero-content flex-col lg:flex-row-reverse gap-10 py-10">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-110" />
            <img
              src="/image3.png"
              alt="Creator"
              className="relative h-64 lg:h-72 rounded-2xl shadow-2xl bg-transparent"
            />
          </div>
          <div className="text-center lg:text-left">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Share Your <span className="text-primary">Products</span>
            </h1>
            <p className="py-4 text-base-content/60">
              Upload, discover, and connect with sellers near you.
            </p>
            <SignInButton mode="modal">
              <button className="btn btn-primary">
                <SparklesIcon className="size-4" />
                Start Selling
              </button>
            </SignInButton>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS or CITY FILTER */}
      {searchResults ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              Search results for "{searchQuery}"
              <span className="text-base-content/60 text-sm font-normal ml-2">
                ({searchResults.length} found)
              </span>
            </h2>
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery("");
                setPaginationInfo(null);
              }}
            >
              Clear search
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="card bg-base-300">
              <div className="card-body items-center text-center py-16">
                <PackageIcon className="size-16 text-base-content/20" />
                <h3 className="card-title text-base-content/50">No products found</h3>
                <p className="text-base-content/40 text-sm">Try a different search term</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="relative flex items-center gap-1.5">
              <button
                className="btn btn-outline gap-1"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <MapPinIcon className="size-4" />
                <span className="capitalize">{displayCity}</span>
                <ChevronDownIcon className="size-4" />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full left-0 mt-2 bg-base-300 rounded-box shadow-lg z-10 min-w-40">
                  {CITIES.map((city) => (
                    <button
                      key={city}
                      className={`w-full text-left px-4 py-2 hover:bg-base-200 first:rounded-t-box last:rounded-b-box capitalize ${
                        selectedCity === city ? "bg-primary text-primary-content" : ""
                      }`}
                      onClick={() => handleCitySelect(city)}
                    >
                      {city === "all" ? "All Cities" : city}
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSearch} className="flex">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="input input-bordered md:w-100"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-md ml-1" disabled={searchMutation.isPending}>
                  {searchMutation.isPending ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : (
                    <SearchIcon className="size-5" />
                  )}
                </button>
              </form>
            </div>

            {isSignedIn && !userCity && (
              <Link to="/select-city" className="btn btn-sm btn-ghost">
                Set your city
              </Link>
            )}
          </div>

          {/* PRODUCTS */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div role="alert" className="alert alert-error">
              <span>Something went wrong. Please refresh the page.</span>
            </div>
          ) : products.length === 0 ? (
            <div className="card bg-base-300 my-4">
              <div className="card-body items-center text-center py-16">
                <PackageIcon className="size-16 text-base-content/20" />
                <h3 className="card-title text-base-content/50">
                  No products found
                </h3>
                <p className="text-base-content/40 text-sm">
                  {selectedCity === "all" 
                    ? "Be the first to share something!" 
                    : `No products in ${selectedCity} yet`}
                </p>
                <Link to="/create" className="btn btn-primary btn-sm mt-2">
                  Create Product
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button 
                    className="btn btn-sm btn-outline"
                    disabled={paginationInfo.page <= 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-base-content/60">
                    Page {paginationInfo.page} of {paginationInfo.totalPages}
                  </span>
                  <button 
                    className="btn btn-sm btn-outline"
                    disabled={paginationInfo.page >= paginationInfo.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default HomePage;
