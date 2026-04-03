import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { updateUserCity } from "../lib/api";

const CITIES = ["delhi", "mumbai", "bangalore", "chennai", "kolkata", "hyderabad", "pune", "jaipur", "ahmedabad", "lucknow", "chandigarh", "surat", "nagpur"];

function SelectCity() {
  const navigate = useNavigate();

  const { userId } = useAuth();

  const handleSelect = async (city) => {
    localStorage.setItem("city", city.toLowerCase());

    await updateUserCity(city);

    navigate("/");
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="card bg-base-300 w-full max-w-sm">
        <div className="card-body text-center">
          <h2 className="card-title justify-center">Select your city</h2>

          <div className="grid grid-cols-2 gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                className="btn btn-outline capitalize"
                onClick={() => handleSelect(city)}
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SelectCity;
