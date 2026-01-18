import { Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import ProductPage from "./pages/ProductPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePage from "./pages/CreatePage";
import EditProductPage from "./pages/EditProductPage";
import SelectCity from "./pages/SelectCity";
import ChatPage from "./pages/ChatPage";
import useAuthReq from "./hooks/useAuthReq";
import useUserSync from "./hooks/useUserSync";
import RequireAuthModal from "./components/RequireAuthModal";

function App() {
  const { isClerkLoaded, isSignedIn } = useAuthReq();
  useUserSync();

  if (!isClerkLoaded) return null;

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
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
        </Routes>
      </main>
    </div>
  );
}

export default App;
