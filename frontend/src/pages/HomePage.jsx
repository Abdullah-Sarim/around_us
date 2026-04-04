import { useProducts, useSearchProducts } from "../hooks/useProducts";
import { PackageIcon, SparklesIcon, MapPinIcon, ChevronDownIcon, SearchIcon, XIcon } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router";
import LoadingSpinner from "../components/LoadingSpinner";
import ProductCard from "../components/ProductCard";
import { SignInButton, useUser } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { getCurrentUser } from "../lib/api";

const CITIES = ["all", "delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "jaipur", "ahmedabad", "lucknow", "chandigarh", "surat", "nagpur"];

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
  const [heroVisible, setHeroVisible] = useState(false);
  const searchMutation = useSearchProducts();

  useEffect(() => {
    setHeroVisible(true);
  }, []);

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
    <div className="space-y-12">
      {/* HERO */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-base-200 via-base-300 to-base-200 border border-base-content/5">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
        <div className="relative hero-content flex-col lg:flex-row-reverse gap-25 py-16 px-6">
          <div className={`relative transition-all duration-700 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="absolute inset-0 bg-primary/30 blur-2xl rounded-full scale-110 animate-pulse" />
            <div className="relative">
              <img
                src="/image3.png"
                alt="Creator"
                className="h-75 lg:h-90 rounded-2xl shadow-2xl bg-transparent hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
          </div>
          <div className={`text-center lg:text-left transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-block px-3 py-1 mb-4 text-xs font-medium tracking-wider uppercase bg-primary/10 text-primary rounded-full">
              Market Place
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Share Your <span className="text-primary">Products</span>
            </h1>
            <p className="py-5 text-base-content/60 max-w-md">
              Upload, discover, and connect with sellers near you. Build your local marketplace today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {isSignedIn ? (
                <button onClick={() => navigate("/create")} className="btn btn-primary btn-lg hover:scale-105 transition-transform">
                  <SparklesIcon className="size-5" />
                  Start Selling
                </button>
              ) : (
                <SignInButton mode="modal">
                  <button className="btn btn-primary btn-lg hover:scale-105 transition-transform">
                    <SparklesIcon className="size-5" />
                    Start Selling
                  </button>
                </SignInButton>
              )}
              <Link to="/wishlist" className="btn btn-outline btn-lg hover:bg-base-200 transition-colors">
                My Wishlist
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH RESULTS or CITY FILTER */}
      {searchResults ? (
        <div className="animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold">
                Search results
              </h2>
              <p className="text-base-content/50 mt-1">
                "{searchQuery}" <span className="text-sm">({searchResults.length} found)</span>
              </p>
            </div>
            <button
              className="btn btn-sm btn-ghost gap-1"
              onClick={() => {
                setSearchResults(null);
                setSearchQuery("");
                setPaginationInfo(null);
              }}
            >
              <XIcon className="size-4" />
              Clear
            </button>
          </div>
          {searchResults.length === 0 ? (
            <div className="card bg-base-200 border border-base-content/5">
              <div className="card-body items-center text-center py-16">
                <PackageIcon className="size-16 text-base-content/20 mb-4" />
                <h3 className="card-title text-base-content/60 text-xl">No products found</h3>
                <p className="text-base-content/40">Try a different search term</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((product, index) => (
                <div 
                  key={product.id} 
                  className="animate-fade-in" 
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* FILTERS BAR */}
          <div className="sticky top-0 z-10 bg-base-100/80 backdrop-blur-md py-4 border-b border-base-content/5 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="relative flex flex-wrap items-center gap-3">
                <div className="relative">
                  <button
                    className="btn btn-outline gap-2 hover:border-primary transition-colors"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <MapPinIcon className="size-4 text-primary" />
                    <span className="capitalize">{displayCity}</span>
                    <ChevronDownIcon className={`size-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showDropdown && (
                    <div className="absolute top-full left-0 mt-2 bg-base-200 rounded-lg shadow-xl border border-base-content/10 z-20 min-w-44 overflow-hidden animate-scale-in">
                      {CITIES.map((city, index) => (
                        <button
                          key={city}
                          className={`w-full text-left px-4 py-2.5 hover:bg-base-300 transition-colors capitalize flex items-center gap-2 ${
                            selectedCity === city ? "bg-primary text-primary-content" : ""
                          }`}
                          style={{ animationDelay: `${index * 30}ms` }}
                          onClick={() => handleCitySelect(city)}
                        >
                          {city === "all" ? "All Cities" : city}
                          {selectedCity === city && <span className="ml-auto">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <form onSubmit={handleSearch} className="flex">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="input input-bordered w-full md:w-64 pl-10 bg-base-200/50 focus:bg-base-200 transition-colors"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <SearchIcon className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary btn-md ml-2 hover:scale-105 transition-transform" 
                    disabled={searchMutation.isPending}
                  >
                    {searchMutation.isPending ? (
                      <span className="loading loading-spinner loading-sm" />
                    ) : (
                      <SearchIcon className="size-5" />
                    )}
                  </button>
                </form>
              </div>

              {isSignedIn && !userCity && (
                <Link to="/select-city" className="btn btn-sm btn-ghost text-primary hover:text-primary-focus">
                  Set your city
                </Link>
              )}
            </div>
          </div>

          {/* PRODUCTS GRID */}
          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <div role="alert" className="alert alert-error">
              <span>Something went wrong. Please refresh the page.</span>
            </div>
          ) : products.length === 0 ? (
            <div className="card bg-base-200 border border-base-content/5">
              <div className="card-body items-center text-center py-16">
                <div className="relative">
                  <PackageIcon className="size-20 text-base-content/10" />
                  <div className="absolute inset-0 bg-primary/5 rounded-full blur-2xl" />
                </div>
                <h3 className="card-title text-base-content/60 text-xl mt-4">
                  No products found
                </h3>
                <p className="text-base-content/40 mt-2">
                  {selectedCity === "all" 
                    ? "Be the first to share something!" 
                    : `No products in ${selectedCity} yet`}
                </p>
                <Link to="/create" className="btn btn-primary mt-4 hover:scale-105 transition-transform">
                  Create Product
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">
                  Latest Products
                </h2>
                <span className="text-sm text-base-content/50">
                  {paginationInfo?.total || products.length} items
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product, index) => (
                  <div 
                    key={product.id} 
                    className="animate-fade-in" 
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
              
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-12">
                  <button 
                    className="btn btn-outline btn-md hover:bg-base-200 transition-colors"
                    disabled={paginationInfo.page <= 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                  >
                    ← Previous
                  </button>
                  <div className="join">
                    {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                      let pageNum;
                      if (paginationInfo.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (paginationInfo.page <= 3) {
                        pageNum = i + 1;
                      } else if (paginationInfo.page >= paginationInfo.totalPages - 2) {
                        pageNum = paginationInfo.totalPages - 4 + i;
                      } else {
                        pageNum = paginationInfo.page - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          className={`join-item btn btn-md ${paginationInfo.page === pageNum ? 'btn-primary' : 'btn-ghost'} hover:bg-base-200 transition-colors`}
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <button 
                    className="btn btn-outline btn-md hover:bg-base-200 transition-colors"
                    disabled={paginationInfo.page >= paginationInfo.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                  >
                    Next →
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
