import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IUser, MealTimes, IRecipe } from "@/types/interfaces";
import { dietTypes, dietaryRestrictions as dietaryRestrictionsList } from "@/components/kyc/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  X,
  Plus,
  Save,
  LogOut,
  Check,
  Camera,
  User,
  Settings as SettingsIcon,
  Heart,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useToast } from "@/components/ui/use-toast";
import MealLoader from "@/components/helper/MealLoader";
import { NotificationSettings } from "@/components/settings";
import RecipeItem from "@/components/recipes/RecipeItem";
import { toast } from "sonner";

const Profile = () => {
  const { toast: uiToast } = useToast();
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
    favoriteMealsData,
    favoriteMealsLoaded,
    fetchFavoriteMeals,
    updateFavorite,
  } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"settings" | "favorites">("settings");
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
    if (!loading && !user && !token) {
      navigate("/register");
      return;
    }
    if (!user) {
      return;
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
    setDietType(pathToDietType[user.path || ""] || "Healthy Balance");
    setMealTimes(storeMealTimes);

    // Fetch favorite meals when user is available
    if (user?._id) {
      fetchFavoriteMeals(user._id);
    }
  }, [user?._id, fetchFavoriteMeals]);

  // Also fetch when switching to favorites tab
  useEffect(() => {
    if (activeTab === "favorites" && user?._id) {
      fetchFavoriteMeals(user._id); // Refresh when viewing favorites tab
    }
  }, [activeTab, user?._id, fetchFavoriteMeals]);

  // Convert favorite meals to recipe format
  const favoriteMealsAsRecipes: IRecipe[] = favoriteMealsData.map((meal) => ({
    _id: meal._id,
    mealId: meal._id,
    mealName: meal.name,
    category: meal.category || "meal",
    cookTime: meal.prepTime || 0,
    servings: 1,
    difficulty: "easy",
    tags: [],
    ingredients: (meal.ingredients || []).map((ing, idx) => {
      if (typeof ing === "string") {
        return { name: ing, amount: "", unit: "Other", _id: `ing-${idx}` };
      } else if (Array.isArray(ing)) {
        return {
          name: ing[0] || "",
          amount: ing[1] || "",
          unit: ing[2] || "Other",
          _id: `ing-${idx}`,
        };
      }
      return { name: "", amount: "", unit: "Other", _id: `ing-${idx}` };
    }),
    instructions: [],
    macros: {
      calories: meal.calories || 0,
      protein: meal.macros?.protein || 0,
      carbs: meal.macros?.carbs || 0,
      fat: meal.macros?.fat || 0,
    },
  }));

  const handleProfilePictureChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        uiToast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        uiToast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfilePicture(reader.result as string);
        }
      };
      reader.onerror = () => {
        uiToast({
          title: "Error reading file",
          description: "Failed to read the image file. Please try again.",
          variant: "destructive",
        });
      };
      reader.readAsDataURL(file);

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
        path: dietTypeToPath[dietType] || user.path || "healthy",
      };

      if (profilePicture && profilePicture !== user.profilePicture) {
        updatedUser.profilePicture = profilePicture;
      }

      setStoreMealTimes(mealTimes);
      await updateProfile(user._id, updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      uiToast({
        title: "Settings saved successfully!",
      });
    } catch (err: any) {
      setError(err.message || "Failed to save settings. Please try again.");
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
    if (
      newDietaryRestriction.trim() &&
      !dietaryRestrictions.includes(newDietaryRestriction.trim())
    ) {
      setDietaryRestrictions([...dietaryRestrictions, newDietaryRestriction.trim()]);
      setNewDietaryRestriction("");
    }
  };

  const removeDietaryRestriction = (restriction: string) => {
    setDietaryRestrictions(dietaryRestrictions.filter((r) => r !== restriction));
  };

  const updateMealTime = (mealType: keyof MealTimes, time: string) => {
    setMealTimes((prev) => ({ ...prev, [mealType]: time }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MealLoader />
          <p className="text-gray-600 text-sm mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout currentView="daily">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Profile</h1>
              <p className="text-sm text-gray-500">
                Manage your settings and favorites
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          <button
            onClick={() => setActiveTab("settings")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "settings"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <SettingsIcon className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === "favorites"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Heart className="w-4 h-4" />
            Favorite Meals
          </button>
        </div>

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-3">
            {/* Success/Error Messages */}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-3 py-2 rounded-lg text-sm">
                Settings saved successfully!
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Profile Picture & Basic Info Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Profile Information
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
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center shadow-sm hover:bg-emerald-600 transition"
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
                    Click the camera icon to upload a profile picture
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Max size: 5MB • JPG, PNG, GIF
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="name" className="text-xs font-medium">
                    Name
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
                    Email
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
                    Phone (Optional)
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
                Physical Attributes
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="weight" className="text-xs font-medium">
                    Weight (kg)
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
                    Height (cm)
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
                    Age
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
                    Gender
                  </Label>
                  <Select value={gender} onValueChange={setGender}>
                    <SelectTrigger className="mt-1 h-9 text-sm">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Diet Type Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Diet Type
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
                Meal Times
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <Label htmlFor="breakfast-time" className="text-xs font-medium">
                    Breakfast
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
                    Lunch
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
                    Dinner
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
                    Snacks
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

            {/* Preferences Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-3">
                Preferences
              </h2>

              {/* Allergies */}
              <div className="mb-4">
                <Label className="text-xs font-medium mb-1.5 block">
                  Allergies
                </Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {allergies.map((allergy) => (
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
                <div className="flex gap-2">
                  <Input
                    value={newAllergy}
                    onChange={(e) => setNewAllergy(e.target.value)}
                    placeholder="Add allergy"
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
                  Dislikes
                </Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dislikes.map((dislike) => (
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
                <div className="flex gap-2">
                  <Input
                    value={newDislike}
                    onChange={(e) => setNewDislike(e.target.value)}
                    placeholder="Add dislike"
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
              <div className="mb-4">
                <Label className="text-xs font-medium mb-1.5 block">
                  Food Preferences
                </Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {foodPreferences.map((foodPreference) => (
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
                <div className="flex gap-2">
                  <Input
                    value={newFoodPreference}
                    onChange={(e) => setNewFoodPreference(e.target.value)}
                    placeholder="Add food preference"
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

              {/* Dietary Restrictions */}
              <div>
                <Label className="text-xs font-medium mb-1.5 block">
                  Dietary Restrictions
                </Label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {dietaryRestrictions.map((restriction) => {
                    // Check if it's a predefined restriction or custom
                    const isPredefined = dietaryRestrictionsList.some(
                      (r) => r.id === restriction || r.name === restriction
                    );
                    const displayName = restriction.startsWith("other:")
                      ? restriction.replace("other:", "")
                      : restriction;
                    
                    return (
                      <div
                        key={restriction}
                        className={`px-2 py-0.5 rounded-full flex items-center gap-1 text-xs ${
                          isPredefined
                            ? "bg-green-100 text-green-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        <span>{displayName}</span>
                        <button
                          onClick={() => removeDietaryRestriction(restriction)}
                          className={`hover:${
                            isPredefined ? "text-green-900" : "text-orange-900"
                          }`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newDietaryRestriction}
                    onChange={(e) => setNewDietaryRestriction(e.target.value)}
                    placeholder="Add dietary restriction"
                    className="h-8 text-sm"
                    onKeyPress={(e) => e.key === "Enter" && addDietaryRestriction()}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addDietaryRestriction}
                    size="sm"
                    className="h-8 px-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Save Buttons */}
            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                disabled={isSaving}
                className="h-9"
              >
                Cancel
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {/* Account Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">
                Account
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-gray-600 text-xs">
                  Sign out of your account on this device.
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
                  <LogOut className="w-3.5 h-3.5 mr-1.5" />
                  Log Out
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Favorite Meals
                </h2>
                <span className="text-sm text-gray-500">
                  {favoriteMealsAsRecipes.length} {favoriteMealsAsRecipes.length === 1 ? 'meal' : 'meals'}
                </span>
              </div>
              
              {!favoriteMealsLoaded ? (
                <div className="flex items-center justify-center py-12">
                  <MealLoader />
                </div>
              ) : favoriteMealsAsRecipes.length > 0 ? (
                <div className="grid grid-cols-2 gap-4">
                  {favoriteMealsAsRecipes.map((recipe: IRecipe) => {
                    const recipeId = recipe.mealId;
                    const isFavorite = user?.favoriteMeals?.includes(recipeId) || false;
                    return (
                      <RecipeItem
                        key={recipeId}
                        recipe={recipe}
                        isFavorite={isFavorite}
                        onFavoriteToggle={async () => {
                          if (user?._id && recipeId) {
                            try {
                              await updateFavorite(user._id, recipeId, !isFavorite);
                              // Refresh favorites after toggle
                              await fetchFavoriteMeals(user._id);
                              if (isFavorite) {
                                toast.success("Removed from favorites", {
                                  duration: 2000,
                                });
                              } else {
                                toast.success("❤️ Added to favorites!", {
                                  duration: 2000,
                                });
                              }
                            } catch (error) {
                              console.error("Failed to update favorite:", error);
                              toast.error("Failed to update favorite");
                            }
                          }
                        }}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No favorite recipes yet
                  </h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Start adding recipes to your favorites to see them here
                  </p>
                  <Button
                    onClick={() => navigate("/recipes")}
                    className="bg-green-500 hover:bg-green-600 text-white"
                  >
                    Browse Recipes
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Profile;
