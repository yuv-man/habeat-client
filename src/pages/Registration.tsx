import { useNavigate } from "react-router-dom";
import KYCFlow from "@/components/kyc/Kyc";
import { useAuthStore } from "@/stores/authStore";

const Registration = () => {
  const navigate = useNavigate();
  const authStore = useAuthStore();

  const handleComplete = () => {
    // This will be called when KYC flow completes
    // The actual user data should be saved during the KYC flow
    navigate("/daily-tracker");
  };

  return (
    <div className="min-h-screen bg-gradient-primary">
      <KYCFlow />
    </div>
  );
};

export default Registration;
