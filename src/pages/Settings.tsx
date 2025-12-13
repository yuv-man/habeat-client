import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { IUser, MealTimes } from "@/types/interfaces";
import { dietTypes } from "@/components/kyc/types";
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
import { ArrowLeft, X, Plus, Save, Loader, LogOut } from "lucide-react";
import NavBar from "@/components/ui/navbar";
import BottomNav from "@/components/ui/BottomNav";
import MobileHeader from "@/components/ui/MobileHeader";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    user,
    updateProfile,
    loading,
    token,
    logout,
    mealTimes: storeMealTimes,
    setMealTimes: setStoreMealTimes,
  } = useAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Profile fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Physical attributes
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");

  // Preferences
  const [allergies, setAllergies] = useState<string[]>([]);
  const [dislikes, setDislikes] = useState<string[]>([]);
  const [favoriteMeals, setFavoriteMeals] = useState<string[]>([]);
  const [newAllergy, setNewAllergy] = useState("");
  const [newDislike, setNewDislike] = useState("");
  const [newFavoriteMeal, setNewFavoriteMeal] = useState("");

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
    setWeight(user.weight?.toString() || "");
    setHeight(user.height?.toString() || "");
    setAge(user.age?.toString() || "");
    setGender(user.gender || "");
    setAllergies(user.allergies || []);
    setDislikes(user.dislikes || []);
    setFavoriteMeals(user.favoriteMeals || []);
    // Map user.path to diet type name
    setDietType(pathToDietType[user.path || ""] || "Healthy Balance");

    // Initialize meal times from store
    setMealTimes(storeMealTimes);
  }, [user, token, loading, navigate, storeMealTimes]);

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
        favoriteMeals,
        // Map diet type name back to path
        path: dietTypeToPath[dietType] || user.path || "healthy",
      };

      // Save meal times to store (local only, not to backend)
      setStoreMealTimes(mealTimes);

      await updateProfile(user._id, updatedUser);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      toast({
        title: "Settings saved successfully!",
      });
      navigate("/daily-tracker");
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

  const addFavoriteMeal = () => {
    if (
      newFavoriteMeal.trim() &&
      !favoriteMeals.includes(newFavoriteMeal.trim())
    ) {
      setFavoriteMeals([...favoriteMeals, newFavoriteMeal.trim()]);
      setNewFavoriteMeal("");
    }
  };

  const removeFavoriteMeal = (meal: string) => {
    setFavoriteMeals(favoriteMeals.filter((m) => m !== meal));
  };

  const updateMealTime = (mealType: keyof MealTimes, time: string) => {
    setMealTimes((prev) => ({ ...prev, [mealType]: time }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-0 md:pt-16 pb-20 md:pb-0">
      <MobileHeader />
      <NavBar currentView="daily" />

      <div className="max-w-4xl mx-auto px-4 py-6 pt-14 md:pt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-full transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
            Settings saved successfully!
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  Name
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone (Optional)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Physical Attributes Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Physical Attributes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight" className="text-sm font-medium">
                  Weight (kg)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="mt-1"
                  min="0"
                  step="0.1"
                />
              </div>
              <div>
                <Label htmlFor="height" className="text-sm font-medium">
                  Height (cm)
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="age" className="text-sm font-medium">
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1"
                  min="0"
                />
              </div>
              <div>
                <Label htmlFor="gender" className="text-sm font-medium">
                  Gender
                </Label>
                <Select value={gender} onValueChange={setGender}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select gender" />
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Diet Type</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dietTypes.map((diet) => (
                <button
                  key={diet.name}
                  onClick={() => setDietType(diet.name)}
                  className={`p-4 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                    dietType === diet.name
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`${diet.color} p-3 rounded-full`}>
                    <div className="w-12 h-12 flex items-center justify-center">
                      {diet.icon}
                    </div>
                  </div>
                  <span className="font-medium text-gray-900 text-sm">
                    {diet.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Meal Times Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Meal Times</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="breakfast-time" className="text-sm font-medium">
                  Breakfast
                </Label>
                <Input
                  id="breakfast-time"
                  type="time"
                  value={mealTimes.breakfast}
                  onChange={(e) => updateMealTime("breakfast", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="lunch-time" className="text-sm font-medium">
                  Lunch
                </Label>
                <Input
                  id="lunch-time"
                  type="time"
                  value={mealTimes.lunch}
                  onChange={(e) => updateMealTime("lunch", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="dinner-time" className="text-sm font-medium">
                  Dinner
                </Label>
                <Input
                  id="dinner-time"
                  type="time"
                  value={mealTimes.dinner}
                  onChange={(e) => updateMealTime("dinner", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="snacks-time" className="text-sm font-medium">
                  Snacks
                </Label>
                <Input
                  id="snacks-time"
                  type="time"
                  value={mealTimes.snacks}
                  onChange={(e) => updateMealTime("snacks", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Preferences Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Preferences
            </h2>

            {/* Allergies */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">
                Allergies
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {allergies.map((allergy) => (
                  <div
                    key={allergy}
                    className="bg-red-100 text-red-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
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
                  onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                />
                <Button type="button" variant="outline" onClick={addAllergy}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Dislikes */}
            <div className="mb-6">
              <Label className="text-sm font-medium mb-2 block">Dislikes</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {dislikes.map((dislike) => (
                  <div
                    key={dislike}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
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
                  onKeyPress={(e) => e.key === "Enter" && addDislike()}
                />
                <Button type="button" variant="outline" onClick={addDislike}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Favorite Meals */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Favorite Meals
              </Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {favoriteMeals.map((meal) => (
                  <div
                    key={meal}
                    className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm"
                  >
                    <span>{meal}</span>
                    <button
                      onClick={() => removeFavoriteMeal(meal)}
                      className="hover:text-purple-900"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newFavoriteMeal}
                  onChange={(e) => setNewFavoriteMeal(e.target.value)}
                  placeholder="Add favorite meal"
                  onKeyPress={(e) => e.key === "Enter" && addFavoriteMeal()}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addFavoriteMeal}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end gap-3 pb-6">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || loading}
              className="min-w-[120px]"
            >
              {isSaving ? (
                <>
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>

          {/* Logout Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Account</h2>
            <p className="text-gray-600 text-sm mb-4">
              Sign out of your account on this device.
            </p>
            <Button
              variant="destructive"
              onClick={() => {
                logout();
                navigate("/register");
              }}
              className="w-full sm:w-auto"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Settings;
