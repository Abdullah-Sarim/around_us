import { useNavigate } from "react-router";
import { useAuth } from "@clerk/clerk-react";
import { updateUserCity } from "../lib/api";

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

          <button
            className="btn btn-outline"
            onClick={() => handleSelect("delhi")}
          >
            Delhi
          </button>

          <button
            className="btn btn-outline"
            onClick={() => handleSelect("mumbai")}
          >
            Mumbai
          </button>

          <button
            className="btn btn-outline"
            onClick={() => handleSelect("bangalore")}
          >
            Bangalore
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectCity;
