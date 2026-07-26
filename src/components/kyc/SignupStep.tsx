import type { Dispatch, SetStateAction } from "react";
import { useNavigate } from "react-router-dom";
import { AuthData } from "./types";
import GoogleIcon from "@/assets/icons/google";
import MealLoader from "@/components/helper/MealLoader";
import { SLOGAN_EAT_WELL } from "@/lib/copy";
import logo from "@/assets/logos/habeat-logo.png";

interface SignupStepProps {
  authData: AuthData;
  setAuthData: Dispatch<SetStateAction<AuthData>>;
  loading: boolean;
  error: string;
  onSignupEmail: () => void;
  onGoogleSignup: () => void;
}

export default function SignupStep({
  authData,
  setAuthData,
  loading,
  error,
  onSignupEmail,
  onGoogleSignup,
}: SignupStepProps) {
  const navigate = useNavigate();

  // Let the parent (Kyc.tsx) handle Google OAuth initialization and triggering
  // This prevents duplicate initialization that causes credential to be ignored
  const handleGoogleClick = () => {
    onGoogleSignup();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-[#f7fdf9]"
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logo} alt="Habeats" className="w-20 h-20 object-contain" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Get Started</h1>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">{SLOGAN_EAT_WELL}</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full mb-6 bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50 text-gray-700 font-semibold py-4 px-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-3 shadow-sm"
          >
            <GoogleIcon />
            {loading ? "Loading..." : "Continue with Google"}
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or with email</span>
            </div>
          </div>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Full Name"
              value={authData.name}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-base transition-all"
            />
            <input
              type="email"
              placeholder="Email"
              value={authData.email}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-base transition-all"
            />
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 text-base transition-all"
            />
            <button
              onClick={onSignupEmail}
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-4 rounded-xl transition disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <MealLoader size="small" />
              ) : (
                "Sign Up"
              )}
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/")}
              disabled={loading}
              className="font-semibold text-green-600 hover:text-green-700 disabled:opacity-50"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
