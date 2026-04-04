import { Link } from "react-router";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import { ShoppingBagIcon, PlusIcon, UserIcon, MessageCircleIcon, HeartIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useState, useEffect } from "react";

function Navbar() {
  const { isSignedIn } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    setWishlistCount(wishlist.length);

    const handleWishlistUpdate = () => {
      const updated = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(updated.length);
    };

    window.addEventListener("wishlistUpdated", handleWishlistUpdate);
    return () => window.removeEventListener("wishlistUpdated", handleWishlistUpdate);
  }, []);

  return (
    <div className={`navbar sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? "bg-base-100/90 backdrop-blur-md shadow-lg shadow-base-content/5" 
        : "bg-base-300"
    }`}>
      <div className="max-w-11/12 mx-auto w-full px-1 sm:px-2.5 flex justify-between items-center">
        {/* LOGO - LEFT SIDE */}
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost gap-2 pl-0 hover:bg-transparent hover:scale-105 transition-all">
            <div className="relative">
              <ShoppingBagIcon className="size-7 md:size-8 text-primary" />
              <div className="absolute -inset-1 bg-primary/20 rounded-full blur-md -z-10" />
            </div>
            <span className="text-xl md:text-2xl font-bold tracking-tight hidden sm:inline">
              Around<span className="text-primary">Us</span>
            </span>
          </Link>
        </div>

        {/* NAV - RIGHT SIDE */}
        <div className="flex items-center gap-0.5">
          <ThemeSelector />
          
          <Link 
            to="/wishlist" 
            className="btn btn-ghost btn-sm gap-1.5 px-2 md:px-3 hover:bg-base-200 active:scale-95 transition-all"
          >
            <div className="relative">
              <HeartIcon className="md:size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-secondary text-secondary-content text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          
          {isSignedIn ? (
            <>
              <Link 
                to="/chat" 
                className="btn btn-ghost btn-sm gap-1.5 px-2 md:px-3 hover:bg-base-200 active:scale-95 transition-all"
              >
                <MessageCircleIcon className="md:size-5" />
                <span className="hidden sm:inline">Chats</span>
              </Link>
              
              <Link 
                to="/create" 
                className="btn btn-primary btn-sm gap-1.5 px-2 md:px-3 active:scale-95 transition-transform shadow-lg shadow-primary/25"
              >
                <PlusIcon className="size-4.5 md:size-5" />
                <span className="hidden sm:inline">Product</span>
              </Link>
              
              <Link 
                to="/profile" 
                className="btn btn-ghost btn-sm gap-1.5 px-2 md:px-3 hover:bg-base-200 active:scale-95 transition-all"
              >
                <UserIcon className="md:size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              
              <div className="ml-1 active:scale-95 transition-transform">
                <UserButton />
              </div>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="btn btn-ghost btn-sm hover:bg-base-200 active:scale-95 transition-all">
                  <span className="hidden sm:inline">Sign In</span>
                  <span className="sm:hidden">Sign</span>
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary btn-sm active:scale-95 transition-transform shadow-lg shadow-primary/25">
                  <span className="hidden sm:inline">Get Started</span>
                  <span className="sm:hidden">Start</span>
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default Navbar;
