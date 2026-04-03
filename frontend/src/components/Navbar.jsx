import { Link } from "react-router";
import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/clerk-react";
import { ShoppingBagIcon, PlusIcon, UserIcon, MessageCircleIcon, HeartIcon } from "lucide-react";
import ThemeSelector from "./ThemeSelector";
import { useState, useEffect } from "react";

function Navbar() {
  const { isSignedIn } = useAuth();
  const [wishlistCount, setWishlistCount] = useState(0);

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
    <div className="navbar bg-base-300 sticky top-0 shadow z-50">
      <div className="max-w-full mx-auto w-full px-1 flex justify-between items-center">
        {/* LOGO - LEFT SIDE */}
        <div className="flex-1">
          <Link to="/" className="btn btn-ghost gap-2 p-1.5">
            <ShoppingBagIcon className="size-6 text-primary" />
            <span className="text-2xl font-bold font-mono tracking-wider hidden sm:inline">AroundUs</span>
          </Link>
        </div>

        <div className="flex items-center">
          <ThemeSelector />
          <Link to="/wishlist" className="btn btn-ghost btn-sm gap-1 md:p-2.5 p-1.5">
            <div className="relative">
              <HeartIcon className="size-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-content text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden sm:inline">Wishlist</span>
          </Link>
          {isSignedIn ? (
            <>
              <Link to="/chat" className="btn btn-ghost btn-sm gap-1 md:p-2.5 p-1.5">
                <MessageCircleIcon className="size-5" />
                <span className="hidden sm:inline">Chats</span>
              </Link>
              <Link to="/create" className="btn btn-primary btn-sm gap-1 md:p-2.5 p-1.5">
                <PlusIcon className="size-5" />
                <span className="hidden sm:inline">Product</span>
              </Link>
              <Link to="/profile" className="btn btn-ghost btn-sm gap-1 md:p-2.5 p-1.5">
                <UserIcon className="size-5" />
                <span className="hidden sm:inline">Profile</span>
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="btn btn-ghost btn-sm">Sign In</button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="btn btn-primary btn-sm">
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
