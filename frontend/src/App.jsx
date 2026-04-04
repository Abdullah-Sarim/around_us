import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePage from "./pages/CreatePage";
import EditProductPage from "./pages/EditProductPage";
import SelectCity from "./pages/SelectCity";
import ChatPage from "./pages/ChatPage";
import WishlistPage from "./pages/WishlistPage";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";
import RequireAuthModal from "./components/RequireAuthModal";
import ConfirmDialog from "./components/ConfirmDialog";

function App() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  useUserSync();

  if (!isClerkLoaded) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <ConfirmDialog />
      <main className="max-w-11/12 mx-auto px-2.5 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/product/:id" element={<ProductPage />} />

          <Route path="/select-city" element={<SelectCity />} />

          <Route
            path="/chat"
            element={isSignedIn ? <ChatPage /> : <RequireAuthModal />}
          />
          <Route
            path="/chat/:id"
            element={isSignedIn ? <ChatPage /> : <RequireAuthModal />}
          />

          <Route
            path="/profile"
            element={isSignedIn ? <ProfilePage /> : <RequireAuthModal />}
          />

          <Route
            path="/create"
            element={isSignedIn ? <CreatePage /> : <RequireAuthModal />}
          />

          <Route
            path="/edit/:id"
            element={isSignedIn ? <EditProductPage /> : <RequireAuthModal />}
          />

          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
