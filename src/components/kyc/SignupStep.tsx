import type { Dispatch, SetStateAction } from "react";
import { AuthData } from "./types";
import GoogleIcon from "@/assets/icons/google";
import MealLoader from "@/components/helper/MealLoader";
import { SLOGAN_EAT_WELL } from "@/lib/copy";

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
  // Let the parent (Kyc.tsx) handle Google OAuth initialization and triggering
  // This prevents duplicate initialization that causes credential to be ignored
  const handleGoogleClick = () => {
    onGoogleSignup();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Get Started</h1>
          <p className="text-gray-600 text-sm max-w-sm mx-auto">{SLOGAN_EAT_WELL}</p>
        </div>

        <div className="backdrop-blur-sm bg-white/95 rounded-lg p-6 shadow-lg">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full mb-6 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-4 px-4 rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-3"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
            <input
              type="email"
              placeholder="Email"
              value={authData.email}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, email: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
            <input
              type="password"
              placeholder="Password"
              value={authData.password}
              onChange={(e) =>
                setAuthData((prev) => ({ ...prev, password: e.target.value }))
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-base"
            />
            <button
              onClick={onSignupEmail}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-4 rounded-xl transition disabled:opacity-50"
            >
              {loading ? (
                <MealLoader size="small" />
              ) : (
                "Sign Up"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
