import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SignupStep from "./SignupStep";
import EmotionalEatingStep from "./EmotionalEatingStep";
import DietStep from "./DietStep";
import DietaryRestrictionsStep from "./DietaryRestrictionsStep";
import FastingHoursStep from "./FastingHoursStep";
import ProfileStep from "./ProfileStep";
import HealthProfileStep from "./HealthProfileStep";
import FitnessStep from "./FitnessStep";
import PreferencesStep from "./PreferencesStep";
import CompleteStep from "./CompleteStep";
import { AuthData, KYCData, CustomInputs } from "./types";
import type { IUser } from "@/types/interfaces";
import { useAuthStore } from "@/stores/authStore";
import { useToast } from "@/hooks/use-toast";
import { userAPI } from "@/services/api";
import {
  calculateBMR,
  calculateTDEE,
  calculateIdealWeight,
} from "@/lib/calculations";
import { handleSubscriptionApiError } from "@/lib/subscriptionAccess";

const STORAGE_KEYS = {
  AUTH_DATA: "habeat_auth_data",
  KYC_DATA: "habeat_kyc_data",
  CUSTOM_INPUTS: "habeat_custom_inputs",
  CURRENT_STEP: "habeat_current_step",
};

const getErrorMessage = (err: unknown, fallback: string) =>
  err instanceof Error ? err.message : fallback;

export default function KYCFlow() {
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const { toast } = useToast();
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
    foodRelationship: "",
    emotionalTriggers: [],
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

      let parsedAuthData: AuthData | null = null;

      if (storedAuthData) {
        try {
          parsedAuthData = JSON.parse(storedAuthData);
          setAuthData((prev) => ({ ...prev, ...parsedAuthData }));
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
      // IMPORTANT: Only restore step if authMethod is properly set
      const hasValidAuthMethod = parsedAuthData?.authMethod === "email" || parsedAuthData?.authMethod === "google";

      if (
        storedStep &&
        storedStep !== "signup" &&
        storedStep !== "complete" &&
        storedStep !== "google_oauth_pending" &&
        hasValidAuthMethod // Only restore if we have valid auth method
      ) {
        setStep(storedStep);
      } else if (storedStep === "google_oauth_pending") {
        // This shouldn't happen as OAuthCallback sets it to "diet", but handle it just in case
        setStep("diet");
      } else if (storedStep && !hasValidAuthMethod && storedStep !== "signup") {
        // User has a stored step but no valid auth method - reset to signup
        console.warn("Invalid auth state detected, resetting to signup");
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
        setStep("signup");
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
      // Create the account immediately with just name/email/password
      await authStore.signup(authData.email, authData.password, {
        name: authData.name,
      } as IUser);
      setAuthData((prev) => ({ ...prev, authMethod: "email" }));
      setStep("emotionalEating");
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Failed to sign up. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    try {
      await authStore.googleAuth("signup");
      const currentUser = useAuthStore.getState().user;
      const currentPlan = useAuthStore.getState().plan;

      if (currentUser && currentPlan) {
        navigate("/daily-tracker");
        return;
      }

      if (currentUser) {
        setAuthData((prev) => ({
          ...prev,
          name: currentUser.name || "",
          email: currentUser.email || "",
          authMethod: "google",
        }));
        setStep("emotionalEating");
      }
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Google signup failed. Please try again.");
      const accountExists =
        /already|exists|registered|sign in instead/i.test(message);

      if (accountExists) {
        toast({
          title: "Account already exists",
          description: "This email is already registered. Please sign in instead.",
          variant: "destructive",
        });
        navigate("/", { replace: true });
        return;
      }

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const submitEmotionalEating = () => setStep("diet");

  const submitDietType = async () => {
    if (!kycData.dietType) {
      setError("Please select a diet type");
      return;
    }
    // Always go to dietary restrictions step after selecting diet type
    setStep("dietaryRestrictions");
  };

  const submitDietaryRestrictions = async () => {
    // Dietary restrictions are optional, so we can proceed
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
      const userData: IUser = {
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
        foodRelationship: kycData.foodRelationship ?? "",
        emotionalTriggers: kycData.emotionalTriggers ?? [],
        subscriptionTier: "free",
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

      // Complete profile with all collected KYC data
      if (authData.authMethod === "email") {
        // Account already created at signup — just update profile + generate plan
        const currentUser = authStore.user;
        if (!currentUser?._id) {
          throw new Error("Session expired. Please sign up again.");
        }
        await authStore.updateProfile(currentUser._id, userData);
        await authStore.generateMealPlan(userData, "Weekly Meal Plan", "en");
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
        // Reset to signup step and clear corrupted state
        localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
        setStep("signup");
        throw new Error("Session expired. Please sign up again to continue.");
      }

      // Mark KYC as completed on the backend
      try {
        const finalUser = useAuthStore.getState().user;
        if (finalUser?._id) {
          await userAPI.markKYCCompleted(finalUser._id);
        }
      } catch (kycError) {
        console.error("Failed to mark KYC as completed:", kycError);
      }

      // Clear all KYC-related localStorage on successful completion
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.KYC_DATA);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_INPUTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);

      console.log("Signup successful, setting step to complete");
      setStep("complete");
    } catch (err: unknown) {
      if (handleSubscriptionApiError(err, navigate)) {
        setError("");
        return;
      }
      console.error("Signup error:", err);
      const rawMsg = err instanceof Error ? err.message : String(err);
      const isAiBusy = rawMsg.includes("PLAN_GENERATION_UNAVAILABLE") ||
        rawMsg.toLowerCase().includes("rate limit") ||
        rawMsg.toLowerCase().includes("temporarily busy");
      setError(
        isAiBusy
          ? "Your profile was saved! Our AI is temporarily busy — please tap 'Generate Plan' from the home screen in a few minutes. Your dietary preferences will be fully applied."
          : getErrorMessage(err, "Failed to complete registration")
      );
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

  // Helper function to calculate step number and total steps
  const getStepInfo = (currentStep: string) => {
    const hasFasting = kycData.dietType === "fasting";
    const totalSteps = hasFasting ? 8 : 7;

    let stepNumber = 0;
    switch (currentStep) {
      case "emotionalEating":
        stepNumber = 1;
        break;
      case "diet":
        stepNumber = 2;
        break;
      case "dietaryRestrictions":
        stepNumber = 3;
        break;
      case "fastingHours":
        stepNumber = 4;
        break;
      case "profile":
        stepNumber = hasFasting ? 5 : 4;
        break;
      case "fitness":
        stepNumber = hasFasting ? 6 : 5;
        break;
      case "preferences":
        stepNumber = hasFasting ? 7 : 6;
        break;
      case "healthProfile":
        stepNumber = hasFasting ? 8 : 7;
        break;
      default:
        stepNumber = 0;
    }

    return { stepNumber, totalSteps };
  };

  const handleBack = () => {
    switch (step) {
      case "emotionalEating":
        setStep("signup");
        break;
      case "diet":
        setStep("emotionalEating");
        break;
      case "dietaryRestrictions":
        setStep("diet");
        break;
      case "fastingHours":
        setStep("dietaryRestrictions");
        break;
      case "profile":
        // Go back to dietary restrictions or fasting hours depending on selected diet
        if (kycData.dietType === "fasting") {
          setStep("fastingHours");
        } else {
          setStep("dietaryRestrictions");
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

    case "emotionalEating": {
      const { stepNumber, totalSteps } = getStepInfo("emotionalEating");
      return (
        <EmotionalEatingStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitEmotionalEating}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "diet": {
      const { stepNumber, totalSteps } = getStepInfo("diet");
      return (
        <DietStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitDietType}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "dietaryRestrictions": {
      const { stepNumber, totalSteps } = getStepInfo("dietaryRestrictions");
      return (
        <DietaryRestrictionsStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitDietaryRestrictions}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "fastingHours": {
      const { stepNumber, totalSteps } = getStepInfo("fastingHours");
      return (
        <FastingHoursStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitFastingHours}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "profile": {
      const { stepNumber, totalSteps } = getStepInfo("profile");
      return (
        <ProfileStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitProfile}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "healthProfile": {
      const { stepNumber, totalSteps } = getStepInfo("healthProfile");
      return (
        <HealthProfileStep
          kycData={kycData}
          loading={loading}
          error={error}
          onSubmit={submitHealthProfile}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "fitness": {
      const { stepNumber, totalSteps } = getStepInfo("fitness");
      return (
        <FitnessStep
          kycData={kycData}
          setKycData={setKycData}
          loading={loading}
          error={error}
          onSubmit={submitFitness}
          onBack={handleBack}
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "preferences": {
      const { stepNumber, totalSteps } = getStepInfo("preferences");
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
          currentStep={stepNumber}
          totalSteps={totalSteps}
        />
      );
    }

    case "complete":
      console.log("Rendering CompleteStep");
      return <CompleteStep onComplete={handleComplete} />;

    default:
      return null;
  }
}
