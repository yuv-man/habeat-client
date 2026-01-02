import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupStep from "./SignupStep";
import DietStep from "./DietStep";
import FastingHoursStep from "./FastingHoursStep";
import ProfileStep from "./ProfileStep";
import HealthProfileStep from "./HealthProfileStep";
import FitnessStep from "./FitnessStep";
import PreferencesStep from "./PreferencesStep";
import CompleteStep from "./CompleteStep";
import { AuthData, KYCData, CustomInputs } from "./types";
import { useAuthStore } from "@/stores/authStore";
import {
  calculateBMR,
  calculateTDEE,
  calculateIdealWeight,
} from "@/lib/calculations";

const STORAGE_KEYS = {
  AUTH_DATA: "habeat_auth_data",
  KYC_DATA: "habeat_kyc_data",
  CUSTOM_INPUTS: "habeat_custom_inputs",
  CURRENT_STEP: "habeat_current_step",
};

export default function KYCFlow() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const [step, setStep] = useState("signup");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [authData, setAuthData] = useState<AuthData>({
    name: "",
    email: "",
    password: "",
    authMethod: null,
  });

  const [kycData, setKycData] = useState<KYCData>({
    dietType: "",
    dietaryRestrictions: [],
    weight: "",
    height: "",
    age: "",
    gender: "",
    workoutFrequency: 3,
    allergies: [],
    dislikes: [],
    foodPreferences: [],
  });

  const [customInputs, setCustomInputs] = useState<CustomInputs>({
    allergy: "",
    dislike: "",
    foodPreference: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedAuthData = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      const storedKycData = localStorage.getItem(STORAGE_KEYS.KYC_DATA);
      const storedCustomInputs = localStorage.getItem(
        STORAGE_KEYS.CUSTOM_INPUTS
      );
      const storedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);

      if (storedAuthData) {
        try {
          const parsed = JSON.parse(storedAuthData);
          setAuthData((prev) => ({ ...prev, ...parsed }));
        } catch (err) {
          console.error("Failed to parse stored auth data:", err);
        }
      }

      if (storedKycData) {
        try {
          setKycData(JSON.parse(storedKycData));
        } catch (err) {
          console.error("Failed to parse stored KYC data:", err);
        }
      }

      if (storedCustomInputs) {
        try {
          setCustomInputs(JSON.parse(storedCustomInputs));
        } catch (err) {
          console.error("Failed to parse stored custom inputs:", err);
        }
      }

      // Handle step restoration - skip signup if user is already authenticated
      if (
        storedStep &&
        storedStep !== "signup" &&
        storedStep !== "complete" &&
        storedStep !== "google_oauth_pending"
      ) {
        setStep(storedStep);
      } else if (storedStep === "google_oauth_pending") {
        // This shouldn't happen as OAuthCallback sets it to "diet", but handle it just in case
        setStep("diet");
      }
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
    }
  }, []);

  useEffect(() => {
    if (authData.authMethod) {
      localStorage.setItem(STORAGE_KEYS.AUTH_DATA, JSON.stringify(authData));
    }
  }, [authData]);

  useEffect(() => {
    if (kycData.dietType || kycData.weight || kycData.height) {
      localStorage.setItem(STORAGE_KEYS.KYC_DATA, JSON.stringify(kycData));
    }
  }, [kycData]);

  useEffect(() => {
    if (step && step !== "signup" && step !== "complete") {
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, step);
    }
  }, [step]);

  useEffect(() => {
    if (
      customInputs.allergy ||
      customInputs.dislike ||
      customInputs.foodPreference
    ) {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_INPUTS,
        JSON.stringify(customInputs)
      );
    }
  }, [customInputs]);

  const handleSignupEmail = async () => {
    setError("");
    if (!authData.email || !authData.password || !authData.name) {
      setError("Please fill all fields");
      return;
    }
    setLoading(true);
    try {
      // Store auth data but don't signup yet - we'll do it at the end with all KYC data
      setAuthData((prev) => ({ ...prev, authMethod: "email" }));
      setStep("diet");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      // Save current state to localStorage before redirecting
      // This will be restored after OAuth callback
      localStorage.setItem(STORAGE_KEYS.CURRENT_STEP, "google_oauth_pending");

      // Use backend OAuth flow - this will redirect to Google
      await authStore.oauthSignup("google");
      // Note: The redirect happens in oauthSignup, so code after this won't execute
    } catch (err: any) {
      setError(err.message || "Google signup failed. Please try again.");
      setLoading(false);
    }
  };

  const submitDietType = async () => {
    if (!kycData.dietType) {
      setError("Please select a diet type");
      return;
    }
    // If fasting is selected, go to fasting hours step
    if (kycData.dietType === "fasting") {
      setStep("fastingHours");
    } else {
      setStep("profile");
    }
  };

  const submitFastingHours = async () => {
    if (!kycData.fastingHours || !kycData.fastingStartTime) {
      setError("Please set your fasting schedule");
      return;
    }
    setStep("profile");
  };

  const submitProfile = async () => {
    if (!kycData.weight || !kycData.height || !kycData.age || !kycData.gender) {
      setError("Please fill all fields");
      return;
    }
    setStep("fitness");
  };

  const submitFitness = async () => {
    setStep("preferences");
  };

  const submitPreferences = async () => {
    setStep("healthProfile");
  };

  const submitHealthProfile = async () => {
    setLoading(true);
    setError("");
    try {
      // Calculate health metrics
      const userDataForCalc = {
        weight: parseFloat(kycData.weight) || 0,
        height: parseFloat(kycData.height) || 0,
        age: parseFloat(kycData.age) || 0,
        gender: kycData.gender || "male",
      };

      const bmr = calculateBMR(userDataForCalc);
      const tdee = calculateTDEE(bmr);
      const idealWeight = calculateIdealWeight(userDataForCalc);

      // Map diet goal to path
      const dietTypeToPath: Record<string, string> = {
        keto: "keto",
        "healthy-balance": "healthy",
        "muscle-up": "gain-muscle",
        running: "running",
        "lose-weight": "lose-weight",
        fasting: "fasting",
      };

      // Prepare user data for signup
      const userData: any = {
        name: authData.name,
        email: authData.email,
        password: authData.password,
        height: parseFloat(kycData.height),
        weight: parseFloat(kycData.weight),
        gender: kycData.gender,
        age: parseFloat(kycData.age),
        path: dietTypeToPath[kycData.dietType] || "healthy",
        bmr: Math.round(bmr),
        tdee: Math.round(tdee),
        idealWeight: Math.round(idealWeight),
        workoutFrequency: kycData.workoutFrequency,
        allergies: kycData.allergies,
        dietaryRestrictions: kycData.dietaryRestrictions || [],
        foodPreferences: kycData.foodPreferences,
        dislikes: kycData.dislikes,
        isPremium: false,
      };

      // Add fasting data if fasting is selected
      if (
        kycData.dietType === "fasting" &&
        kycData.fastingHours &&
        kycData.fastingStartTime
      ) {
        userData.fastingHours = kycData.fastingHours;
        userData.fastingStartTime = kycData.fastingStartTime;
      }

      // Signup with all collected data
      if (authData.authMethod === "email") {
        await authStore.signup(authData.email, authData.password, userData);
      } else if (authData.authMethod === "google") {
        // User already authenticated via Google OAuth - update profile and generate plan
        const currentUser = authStore.user;
        if (!currentUser?._id) {
          throw new Error(
            "User not authenticated. Please try signing in again."
          );
        }
        // Update user profile with KYC data
        await authStore.updateProfile(currentUser._id, userData);
        // Generate meal plan
        await authStore.generateMealPlan(userData, "Weekly Meal Plan", "en");
      } else {
        throw new Error("Invalid authentication method");
      }

      // Clear all KYC-related localStorage on successful completion
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.KYC_DATA);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_INPUTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);

      console.log("Signup successful, setting step to complete");
      setStep("complete");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to complete registration");
    } finally {
      setLoading(false);
    }
  };

  const toggleOption = (list: string, value: string) => {
    setKycData((prev) => {
      const currentList = prev[list as keyof KYCData] as string[];
      return {
        ...prev,
        [list]: currentList.includes(value)
          ? currentList.filter((item) => item !== value)
          : [...currentList, value],
      };
    });
  };

  const addCustomItem = (category: string, inputKey: string) => {
    const key = inputKey as keyof CustomInputs;
    const value = customInputs[key].trim();
    if (!value) return;

    setKycData((prev) => {
      const currentList = prev[category as keyof KYCData] as string[];
      return {
        ...prev,
        [category]: [...currentList, value],
      };
    });
    setCustomInputs((prev) => ({
      ...prev,
      [key]: "",
    }));
  };

  const handleComplete = () => {
    console.log("handleComplete called, navigating to daily-tracker");
    navigate("/daily-tracker");
  };

  const handleBack = () => {
    switch (step) {
      case "diet":
        setStep("signup");
        break;
      case "fastingHours":
        setStep("diet");
        break;
      case "profile":
        // Go back to diet or fasting hours depending on selected diet
        if (kycData.dietType === "fasting") {
          setStep("fastingHours");
        } else {
          setStep("diet");
        }
        break;
      case "fitness":
        setStep("profile");
        break;
      case "preferences":
        setStep("fitness");
        break;
      case "healthProfile":
        setStep("preferences");
        break;
      default:
        break;
    }
  };

  switch (step) {
    case "signup":
      return (
        <SignupStep
          authData={authData}
          setAuthData={setAuthData}
          loading={loading}
          error={error}
          onSignupEmail={handleSignupEmail}
          onGoogleSignup={handleGoogleSignup}
        />
      );

    case "diet":
      return (
        <DietStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitDietType}
          onBack={handleBack}
        />
      );

    case "fastingHours":
      return (
        <FastingHoursStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitFastingHours}
          onBack={handleBack}
        />
      );

    case "profile":
      return (
        <ProfileStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitProfile}
          onBack={handleBack}
        />
      );

    case "healthProfile":
      return (
        <HealthProfileStep
          kycData={kycData}
          loading={loading}
          error={error}
          onSubmit={submitHealthProfile}
          onBack={handleBack}
        />
      );

    case "fitness":
      return (
        <FitnessStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitFitness}
          onBack={handleBack}
        />
      );

    case "preferences":
      return (
        <PreferencesStep
          kycData={kycData}
          setKycData={setKycData}
          customInputs={customInputs}
          setCustomInputs={setCustomInputs}
          loading={loading}
          error={error}
          onSubmit={submitPreferences}
          onToggleOption={toggleOption}
          onAddCustomItem={addCustomItem}
          onBack={handleBack}
        />
      );

    case "complete":
      console.log("Rendering CompleteStep");
      return <CompleteStep onComplete={handleComplete} />;

    default:
      return null;
  }
}
