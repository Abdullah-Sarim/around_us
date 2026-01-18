import { SignInButton } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";

function RequireAuthModal() {
  const buttonRef = useRef(null);

  // Auto-open the Clerk modal when this component mounts
  useEffect(() => {
    buttonRef.current?.click();
  }, []);

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <SignInButton mode="modal">
        <button ref={buttonRef} className="btn btn-primary">
          Sign in to continue
        </button>
      </SignInButton>
    </div>
  );
}

export default RequireAuthModal;
