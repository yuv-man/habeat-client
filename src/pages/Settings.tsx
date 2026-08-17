import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useLanguageStore } from "@/stores/languageStore";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/lib/i18n";
import { IUser, MealTimes } from "@/types/interfaces";
import {
  dietTypes,
  allergies as ALLERGY_OPTIONS,
  dislikes as DISLIKE_OPTIONS,
  foodPreferences as FOOD_PREFERENCE_OPTIONS,
  dietaryRestrictions as DIETARY_RESTRICTION_OPTIONS,
} from "@/components/kyc/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  X,
  Plus,
  Save,
  LogOut,
  Check,
  Camera,
  User,
  Activity,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import MealLoader from "@/components/helper/MealLoader";
import { NotificationSettings } from "@/components/settings";
import { useWatchStore } from "@/stores/watchStore";

const Settings = () => {
  const { t } = useTranslation("settings");
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    user,
    updateProfile,
    loading,
    token,
    logout,
    mealTimes: storeMealTimes,
    setMealTimes: setStoreMealTimes,
  } = useAuthStore();
  const { status: watchStatus, grant: grantWatch, deny: denyWatch } = useWatchStore();
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  // Physical attributes
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Preferences
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [foodPreferences, setFoodPreferences] = useState<string[]>([]);
  const [dietaryRestrictions, setDietaryRestrictions] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [newDislike, setNewDislike] = useState("");
  const [newFoodPreference, setNewFoodPreference] = useState("");
  const [newDietaryRestriction, setNewDietaryRestriction] = useState("");

  // Meal times (initialized from store)
  const [mealTimes, setMealTimes] = useState<MealTimes>(storeMealTimes);

  // Diet type
  const [dietType, setDietType] = useState("");

  // Nutrition display
  const [showMacros, setShowMacros] = useState(true);

  // Map path to diet type name
  const pathToDietType: Record<string, string> = {
    keto: "Keto",
    healthy: "Healthy Balance",
    "gain-muscle": "Muscle Up",
    "lose-weight": "Lose Weight",
    fasting: "8 - 16 hours fasting",
    other: "Healthy Balance",
  };

  // Map diet type name to path
  const dietTypeToPath: Record<string, string> = {
    Keto: "keto",
    "Healthy Balance": "healthy",
    "Muscle Up": "gain-muscle",
    Running: "healthy",
    "Lose Weight": "lose-weight",
    "8 - 16 hours fasting": "fasting",
  };

  useEffect(() => {
    // Only redirect if no user AND no token (not authenticated)
    if (!user && !token && !loading) {
      navigate("/register");
      return;
    }
    if (!user) {
      return; // Wait for user to load
    }

    // Initialize form with user data
    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setProfilePicture(user.profilePicture || null);
    setWeight(user.weight?.toString() || "");
    setHeight(user.height?.toString() || "");
    setAge(user.age?.toString() || "");
    setGender(user.gender || "");
    setAllergies(user.allergies || []);
    setDislikes(user.dislikes || []);
    setFoodPreferences(user.foodPreferences || []);
    setDietaryRestrictions(user.dietaryRestrictions || []);
    setShowMacros(user.showMacros !== false);
    // Map user.path to diet type name
    setDietType(pathToDietType[user.path || ""] || "Healthy Balance");

    // Initialize meal times from store
    setMealTimes(storeMealTimes);
  }, [user, token, loading, navigate, storeMealTimes]);

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast({
          title: t("profileInfo.invalidFileType"),
          description: t("profileInfo.invalidFileTypeDesc"),
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t("profileInfo.fileTooLarge"),
          description: t("profileInfo.fileTooLargeDesc"),
          variant: "destructive",
        });
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfilePicture(reader.result as string);
        }
      };
      reader.onerror = () => {
        toast({
          title: t("profileInfo.readErrorTitle"),
          description: t("profileInfo.readErrorDesc"),
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);

      // Reset file input to allow re-selecting the same file
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    if (!user?._id) return;

    setError(null);
    setSuccess(false);
    setIsSaving(true);

    try {
      const updatedUser: Partial<IUser> = {
        name,
        email,
        phone: phone || undefined,
        weight: parseFloat(weight) || user.weight,
        height: parseFloat(height) || user.height,
        age: parseInt(age) || user.age,
        gender: gender || user.gender,
        allergies,
        dislikes,
        foodPreferences,
        dietaryRestrictions,
        showMacros,
        // Map diet type name back to path
        path: dietTypeToPath[dietType] || user.path || "healthy",
      };

      // If there's a new profile picture, add it (base64 for now)
      if (profilePicture && profilePicture !== user.profilePicture) {
        updatedUser.profilePicture = profilePicture;
      }

      // Save meal times to store (local only, not to backend)
      setStoreMealTimes(mealTimes);

      await updateProfile(user._id, updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      toast({
        title: t("success"),
      });
      navigate("/daily-tracker");
    } catch (err: any) {
      setError(err.message || t("genericSaveError"));
    } finally {
      setIsSaving(false);
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setAllergies(allergies.filter((a) => a !== allergy));
  };

  const addDislike = () => {
    if (newDislike.trim() && !dislikes.includes(newDislike.trim())) {
      setDislikes([...dislikes, newDislike.trim()]);
      setNewDislike("");
    }
  };

  const removeDislike = (dislike: string) => {
    setDislikes(dislikes.filter((d) => d !== dislike));
  };

  const addFoodPreference = () => {
    if (
      newFoodPreference.trim() &&
      !foodPreferences.includes(newFoodPreference.trim())
    ) {
      setFoodPreferences([...foodPreferences, newFoodPreference.trim()]);
      setNewFoodPreference("");
    }
  };

  const removeFoodPreference = (foodPreference: string) => {
    setFoodPreferences(foodPreferences.filter((fp) => fp !== foodPreference));
  };

  const addDietaryRestriction = () => {
    const value = `other:${newDietaryRestriction.trim()}`;
    if (newDietaryRestriction.trim() && !dietaryRestrictions.includes(value)) {
      setDietaryRestrictions([...dietaryRestrictions, value]);
      setNewDietaryRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(
      dietaryRestrictions.filter((r) => r !== restriction)
    );
  };

  // Toggle a preset chip (add if missing, remove if already selected). Mirrors
  // the KYC PreferencesStep so both flows share the same canonical option lists.
  const toggleFromList = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    value: string
  ) => {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  // Preset dietary-restriction ids (excludes "other" — the custom input covers that).
  const DIETARY_PRESETS = DIETARY_RESTRICTION_OPTIONS.filter(
    (o) => o.id !== "other"
  );
  const DIETARY_PRESET_IDS = DIETARY_PRESETS.map((o) => o.id);
  const dietaryNameFor = (id: string) =>
    DIETARY_RESTRICTION_OPTIONS.find((o) => o.id === id)?.name ??
    id.replace(/^other:/, "");

  const updateMealTime = (mealType: keyof MealTimes, time: string) => {
    setMealTimes((prev) => ({ ...prev, [mealType]: time }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MealLoader />
          <p className="text-gray-600 text-sm mt-4">{t("loading")}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout currentView="daily">
      <div className="max-w-2xl mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <button
            onClick={() => navigate(-1)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition"
            aria-label={t("goBack")}
          >
            <ArrowLeft className="w-4 h-4 text-gray-600 rtl:-scale-x-100" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{t("title")}</h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg mb-4 text-sm">
            {t("success")}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {/* Profile Picture & Basic Info Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("profileInfo.heading")}
            </h2>

            {/* Profile Picture */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-2 border-gray-200">
                  {profilePicture ? (
                    <img
                      src={profilePicture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -end-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:bg-emerald-600 transition"
                >
                  <Camera className="w-3 h-3 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                  className="hidden"
                />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-600">
                  {t("profileInfo.uploadHint")}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {t("profileInfo.uploadConstraints")}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="name" className="text-xs font-medium">
                  {t("profileInfo.name")}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-xs font-medium">
                  {t("profileInfo.email")}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-xs font-medium">
                  {t("profileInfo.phone")}
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Physical Attributes Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("physicalAttributes.heading")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="weight" className="text-xs font-medium">
                  {t("physicalAttributes.weight")}
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1 h-9 text-sm"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-xs font-medium">
                  {t("physicalAttributes.height")}
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1 h-9 text-sm"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-xs font-medium">
                  {t("physicalAttributes.age")}
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 h-9 text-sm"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-xs font-medium">
                  {t("physicalAttributes.gender")}
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1 h-9 text-sm">
                    <SelectValue placeholder={t("physicalAttributes.genderSelectPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("physicalAttributes.genderMale")}</SelectItem>
                    <SelectItem value="female">{t("physicalAttributes.genderFemale")}</SelectItem>
                    <SelectItem value="other">{t("physicalAttributes.genderOther")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Language Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-1">
              {t("language.heading")}
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              {t("language.description")}
            </p>
            <Select
              value={language}
              onValueChange={(value) =>
                setLanguage(value as SupportedLanguage, user?._id)
              }
            >
              <SelectTrigger className="h-9 text-sm max-w-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang === "he"
                      ? t("common:language.hebrew")
                      : t("common:language.english")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Nutrition Display Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-gray-900">
                  {t("nutritionDisplay.heading")}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {t("nutritionDisplay.description")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Label htmlFor="show-macros" className="text-xs font-medium sr-only">
                  {t("nutritionDisplay.toggleLabel")}
                </Label>
                <Switch
                  id="show-macros"
                  checked={showMacros}
                  onCheckedChange={setShowMacros}
                />
              </div>
            </div>
          </div>

          {/* Diet Type Section - Redesigned as horizontal chips */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("dietType.heading")}
            </h2>
            <div className="flex flex-wrap gap-2">
              {dietTypes.map((diet) => {
                const isSelected = dietType === diet.name;
                return (
                  <button
                    key={diet.name}
                    onClick={() => setDietType(diet.name)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    {diet.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Meal Times Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("mealTimes.heading")}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <Label htmlFor="breakfast-time" className="text-xs font-medium">
                  {t("mealTimes.breakfast")}
                </Label>
                <Input
                  id="breakfast-time"
                  type="time"
                  value={mealTimes.breakfast}
                  onChange={(e) => updateMealTime("breakfast", e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="lunch-time" className="text-xs font-medium">
                  {t("mealTimes.lunch")}
                </Label>
                <Input
                  id="lunch-time"
                  type="time"
                  value={mealTimes.lunch}
                  onChange={(e) => updateMealTime("lunch", e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="dinner-time" className="text-xs font-medium">
                  {t("mealTimes.dinner")}
                </Label>
                <Input
                  id="dinner-time"
                  type="time"
                  value={mealTimes.dinner}
                  onChange={(e) => updateMealTime("dinner", e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
              <div>
                <Label htmlFor="snacks-time" className="text-xs font-medium">
                  {t("mealTimes.snacks")}
                </Label>
                <Input
                  id="snacks-time"
                  type="time"
                  value={mealTimes.snacks}
                  onChange={(e) => updateMealTime("snacks", e.target.value)}
                  className="mt-1 h-9 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <NotificationSettings />

          {/* App Features */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-100">
            <h2 className="text-sm font-semibold text-gray-900 px-4 pt-4 pb-3">{t("appFeatures.heading")}</h2>

            {/* Health Data */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                watchStatus === 'granted' ? 'bg-green-100' : 'bg-gray-100'
              }`}>
                <Activity className={`w-4 h-4 ${watchStatus === 'granted' ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{t("appFeatures.healthData")}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {watchStatus === 'granted'
                    ? t("appFeatures.healthDataConnected")
                    : watchStatus === 'unavailable'
                    ? t("appFeatures.healthDataUnavailable")
                    : t("appFeatures.healthDataDisconnected")}
                </p>
              </div>
              {watchStatus === 'granted' ? (
                <Button variant="outline" size="sm" onClick={denyWatch} className="h-8 text-xs shrink-0">
                  {t("appFeatures.disconnect")}
                </Button>
              ) : watchStatus === 'unavailable' ? (
                <span className="text-xs text-gray-400 shrink-0">{t("appFeatures.mobileOnly")}</span>
              ) : (
                <Button size="sm" onClick={grantWatch} className="h-8 text-xs shrink-0 bg-green-500 text-white hover:bg-green-600">
                  {t("appFeatures.connect")}
                </Button>
              )}
            </div>

            {/* Sensory & Routine Profile */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                user.sensoryProfile?.enabled ? 'bg-purple-100' : 'bg-gray-100'
              }`}>
                <span className={`text-base ${user.sensoryProfile?.enabled ? '' : 'grayscale opacity-50'}`}>🌿</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">{t("appFeatures.sensoryProfile")}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user.sensoryProfile?.enabled
                    ? t("appFeatures.sensoryProfileActive")
                    : t("appFeatures.sensoryProfileInactive")}
                </p>
              </div>
              <button
                onClick={() => navigate('/sensory-profile')}
                className="text-xs font-medium px-3 py-1.5 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition shrink-0"
              >
                {user.sensoryProfile?.enabled ? t("appFeatures.edit") : t("appFeatures.setUp")}
              </button>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-3">
              {t("preferences.heading")}
            </h2>

            {/* Dietary Restrictions */}
            <div className="mb-4">
              <Label className="text-xs font-medium mb-1.5 block">
                {t("preferences.dietaryRestrictions")}
              </Label>
              {/* Preset chips (same options as KYC) */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DIETARY_PRESETS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      toggleFromList(
                        dietaryRestrictions,
                        setDietaryRestrictions,
                        option.id
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      dietaryRestrictions.includes(option.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
              {/* Custom entries not in the preset list */}
              {dietaryRestrictions.filter(
                (r) => !DIETARY_PRESET_IDS.includes(r)
              ).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dietaryRestrictions
                    .filter((r) => !DIETARY_PRESET_IDS.includes(r))
                    .map((restriction) => (
                      <div
                        key={restriction}
                        className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                      >
                        <span>{dietaryNameFor(restriction)}</span>
                        <button
                          onClick={() => removeDietaryRestriction(restriction)}
                          className="hover:text-green-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newDietaryRestriction}
                  onChange={(e) => setNewDietaryRestriction(e.target.value)}
                  placeholder={t("preferences.addCustomDietaryRestriction")}
                  className="h-8 text-sm"
                  onKeyPress={(e) =>
                    e.key === "Enter" && addDietaryRestriction()
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={addDietaryRestriction}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Allergies */}
            <div className="mb-4">
              <Label className="text-xs font-medium mb-1.5 block">
                {t("preferences.allergies")}
              </Label>
              {/* Preset chips (same options as KYC) */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {ALLERGY_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFromList(allergies, setAllergies, item)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      allergies.includes(item)
                        ? "bg-red-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {/* Custom entries not in the preset list */}
              {allergies.filter((a) => !ALLERGY_OPTIONS.includes(a)).length >
                0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {allergies
                    .filter((a) => !ALLERGY_OPTIONS.includes(a))
                    .map((allergy) => (
                      <div
                        key={allergy}
                        className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                      >
                        <span>{allergy}</span>
                        <button
                          onClick={() => removeAllergy(allergy)}
                          className="hover:text-red-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder={t("preferences.addCustomAllergy")}
                  className="h-8 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addAllergy}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Dislikes */}
            <div className="mb-4">
              <Label className="text-xs font-medium mb-1.5 block">
                {t("preferences.dislikes")}
              </Label>
              {/* Preset chips (same options as KYC) */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DISLIKE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleFromList(dislikes, setDislikes, item)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      dislikes.includes(item)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {/* Custom entries not in the preset list */}
              {dislikes.filter((d) => !DISLIKE_OPTIONS.includes(d)).length >
                0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dislikes
                    .filter((d) => !DISLIKE_OPTIONS.includes(d))
                    .map((dislike) => (
                      <div
                        key={dislike}
                        className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                      >
                        <span>{dislike}</span>
                        <button
                          onClick={() => removeDislike(dislike)}
                          className="hover:text-blue-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newDislike}
                  onChange={(e) => setNewDislike(e.target.value)}
                  placeholder={t("preferences.addCustomDislike")}
                  className="h-8 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && addDislike()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addDislike}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Food Preferences */}
            <div>
              <Label className="text-xs font-medium mb-1.5 block">
                {t("preferences.foodPreferences")}
              </Label>
              {/* Preset chips (same options as KYC) */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {FOOD_PREFERENCE_OPTIONS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      toggleFromList(foodPreferences, setFoodPreferences, item)
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      foodPreferences.includes(item)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {/* Custom entries not in the preset list */}
              {foodPreferences.filter(
                (fp) => !FOOD_PREFERENCE_OPTIONS.includes(fp)
              ).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {foodPreferences
                    .filter((fp) => !FOOD_PREFERENCE_OPTIONS.includes(fp))
                    .map((foodPreference) => (
                      <div
                        key={foodPreference}
                        className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1 text-xs"
                      >
                        <span>{foodPreference}</span>
                        <button
                          onClick={() => removeFoodPreference(foodPreference)}
                          className="hover:text-purple-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newFoodPreference}
                  onChange={(e) => setNewFoodPreference(e.target.value)}
                  placeholder={t("preferences.addCustomFoodPreference")}
                  className="h-8 text-sm"
                  onKeyPress={(e) => e.key === "Enter" && addFoodPreference()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFoodPreference}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Buttons - Now before logout */}
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              disabled={isSaving}
              className="h-9"
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || loading}
              size="sm"
              className="h-9 min-w-[100px] bg-green-500 text-white hover:bg-green-600"
            >
              {isSaving ? (
                <>
                  <MealLoader size="small" />
                  {t("buttons.saving")}
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 me-1.5" />
                  {t("buttons.save")}
                </>
              )}
            </Button>
          </div>

          {/* Account Section - Now at the end */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-2">
              {t("account.heading")}
            </h2>
            <div className="flex items-center justify-between">
              <p className="text-gray-600 text-xs">
                {t("account.description")}
              </p>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="h-8 text-xs"
              >
                <LogOut className="w-3.5 h-3.5 me-1.5" />
                {t("account.logOut")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
