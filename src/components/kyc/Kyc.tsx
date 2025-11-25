import React, { useState, useEffect } from "react";
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
import { initGoogleOAuth, decodeGoogleToken } from "@/lib/googleOAuth";

const STORAGE_KEYS = {
  GOOGLE_CREDENTIAL: "habeat_google_credential",
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
  const [googleCredential, setGoogleCredential] = useState<string | null>(null);

  const [kycData, setKycData] = useState<KYCData>({
    dietType: "",
    weight: "",
    height: "",
    age: "",
    gender: "",
    workoutFrequency: 3,
    allergies: [],
    dislikes: [],
    favoriteFoods: [],
  });

  const [customInputs, setCustomInputs] = useState<CustomInputs>({
    allergy: "",
    dislike: "",
    favoriteFood: "",
  });

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedCredential = localStorage.getItem(
        STORAGE_KEYS.GOOGLE_CREDENTIAL
      );
      const storedAuthData = localStorage.getItem(STORAGE_KEYS.AUTH_DATA);
      const storedKycData = localStorage.getItem(STORAGE_KEYS.KYC_DATA);
      const storedCustomInputs = localStorage.getItem(
        STORAGE_KEYS.CUSTOM_INPUTS
      );
      const storedStep = localStorage.getItem(STORAGE_KEYS.CURRENT_STEP);

      if (storedCredential) {
        try {
          const userInfo = decodeGoogleToken(storedCredential);
          setGoogleCredential(storedCredential);
          setAuthData({
            name: userInfo.name,
            email: userInfo.email,
            password: "",
            authMethod: "google",
          });
        } catch (err) {
          console.error("Failed to decode stored Google token:", err);
          localStorage.removeItem(STORAGE_KEYS.GOOGLE_CREDENTIAL);
        }
      }

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

      if (storedStep && storedStep !== "signup" && storedStep !== "complete") {
        setStep(storedStep);
      }
    } catch (err) {
      console.error("Failed to load from localStorage:", err);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (googleCredential) {
      localStorage.setItem(STORAGE_KEYS.GOOGLE_CREDENTIAL, googleCredential);
    }
  }, [googleCredential]);

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
      customInputs.favoriteFood
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
      // Initialize Google OAuth
      await initGoogleOAuth((credential: string) => {
        try {
          // Decode the credential to get user info
          const userInfo = decodeGoogleToken(credential);

          // Store the credential and user info
          setGoogleCredential(credential);
          // Store in localStorage
          localStorage.setItem(STORAGE_KEYS.GOOGLE_CREDENTIAL, credential);

          setAuthData((prev) => ({
            ...prev,
            name: userInfo.name,
            email: userInfo.email,
            authMethod: "google",
          }));

          // Move to next step
          setStep("diet");
          setLoading(false);
        } catch (err: any) {
          setError(err.message || "Failed to process Google sign-in");
          setLoading(false);
        }
      });

      // Trigger the Google sign-in popup
      if (window.google?.accounts?.id) {
        window.google.accounts.id.prompt();
      } else {
        setError("Google OAuth not initialized. Please refresh and try again.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(
        err.message ||
          "Google signup failed. Please make sure VITE_GOOGLE_CLIENT_ID is set in your .env file."
      );
      setLoading(false);
    }
  };

  const submitDietType = async () => {
    if (!kycData.dietType) {
      setError("Please select a diet type");
      return;
    }
    // If 8-16 fasting is selected, go to fasting hours step
    if (kycData.dietType === "8 - 16 hours fasting") {
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

      // Map diet type to path
      const dietTypeToPath: Record<string, string> = {
        Keto: "keto",
        "Healthy Balance": "healthy",
        "Muscle Up": "gain-muscle",
        Running: "healthy",
        "Lose Weight": "lose-weight",
        "8 - 16 hours fasting": "fasting",
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
        allergies: kycData.allergies,
        dietaryRestrictions: [],
        favoriteMeals: kycData.favoriteFoods,
        dislikes: kycData.dislikes,
        isPremium: false,
      };

      // Add fasting data if 8-16 fasting is selected
      if (
        kycData.dietType === "8 - 16 hours fasting" &&
        kycData.fastingHours &&
        kycData.fastingStartTime
      ) {
        userData.fastingHours = kycData.fastingHours;
        userData.fastingStartTime = kycData.fastingStartTime;
      }

      // Add fasting data if 8-16 fasting is selected
      if (
        kycData.dietType === "8 - 16 hours fasting" &&
        kycData.fastingHours &&
        kycData.fastingStartTime
      ) {
        userData.fastingHours = kycData.fastingHours;
        userData.fastingStartTime = kycData.fastingStartTime;
      }

      // Signup with all collected data
      if (authData.authMethod === "email") {
        await authStore.signup(authData.email, authData.password, userData);
      } else if (authData.authMethod === "google" && googleCredential) {
        // Send Google credential to backend for signup with user data
        await authStore.handleOAuthCallback(
          "google",
          "signup",
          googleCredential,
          undefined,
          userData
        );
      } else {
        throw new Error("Invalid authentication method");
      }

      // Clear localStorage on successful completion
      localStorage.removeItem(STORAGE_KEYS.GOOGLE_CREDENTIAL);
      localStorage.removeItem(STORAGE_KEYS.AUTH_DATA);
      localStorage.removeItem(STORAGE_KEYS.KYC_DATA);
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_INPUTS);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);

      setStep("complete");
    } catch (err: any) {
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

  const addCustomItem = (category: string, inputKey: keyof CustomInputs) => {
    const value = customInputs[inputKey].trim();
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
      [inputKey]: "",
    }));
  };

  const handleComplete = () => {
    navigate("/daily-tracker");
  };

  const handleBack = () => {
    switch (step) {
      case "diet":
        setStep("signup");
        break;
      case "profile":
        setStep("diet");
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
      return <CompleteStep onComplete={handleComplete} />;

    default:
      return null;
  }
}
