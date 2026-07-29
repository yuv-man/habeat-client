import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/stores/authStore";
import {
  allergies as ALLERGY_OPTIONS,
  dislikes as DISLIKE_OPTIONS,
  dietaryRestrictions as DIETARY_RESTRICTION_OPTIONS,
} from "@/components/kyc/types";
import { X, Plus } from "lucide-react";

export function UserSettingsModal({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuthStore();
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [newAllergy, setNewAllergy] = useState("");
  const [newPreference, setNewPreference] = useState("");
  const [newDislike, setNewDislike] = useState("");
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [preferences, setPreferences] = useState<string[]>(
    user?.dietaryRestrictions || []
  );
  const [dislikes, setDislikes] = useState<string[]>(user?.dislikes || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(user?._id || "", {
        ...user,
        weight: parseFloat(weight),
        allergies,
        dietaryRestrictions: preferences,
        dislikes,
      });
    } catch (error) {
      console.error("Failed to update profile:", error);
    } finally {
      setIsLoading(false);
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

  const addPreference = () => {
    if (newPreference.trim() && !preferences.includes(newPreference.trim())) {
      setPreferences([...preferences, newPreference.trim()]);
      setNewPreference("");
    }
  };

  const removePreference = (preference: string) => {
    setPreferences(preferences.filter((p) => p !== preference));
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

  // Toggle a preset chip (add if missing, remove if selected). Mirrors the KYC
  // flow so both share the same canonical option lists.
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

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>User Settings</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Weight Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="weight" className="text-right">
              Weight (kg)
            </Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="col-span-3"
            />
          </div>

          {/* Allergies Section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Allergies</Label>
            <div className="col-span-3">
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {allergies
                    .filter((a) => !ALLERGY_OPTIONS.includes(a))
                    .map((allergy) => (
                      <div
                        key={allergy}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                      >
                        <span>{allergy}</span>
                        <button
                          onClick={() => removeAllergy(allergy)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add custom allergy"
                  onKeyPress={(e) => e.key === "Enter" && addAllergy()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addAllergy}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dietary Preferences Section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Preferences</Label>
            <div className="col-span-3">
              {/* Preset chips (same dietary restrictions as KYC) */}
              <div className="flex flex-wrap gap-1.5 mb-2">
                {DIETARY_PRESETS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      toggleFromList(preferences, setPreferences, option.id)
                    }
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                      preferences.includes(option.id)
                        ? "bg-green-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {option.name}
                  </button>
                ))}
              </div>
              {/* Custom entries not in the preset list */}
              {preferences.filter((p) => !DIETARY_PRESET_IDS.includes(p)).length >
                0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferences
                    .filter((p) => !DIETARY_PRESET_IDS.includes(p))
                    .map((preference) => (
                      <div
                        key={preference}
                        className="bg-green-100 text-green-700 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                      >
                        <span>{dietaryNameFor(preference)}</span>
                        <button
                          onClick={() => removePreference(preference)}
                          className="text-green-600 hover:text-green-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  placeholder="Add custom preference"
                  onKeyPress={(e) => e.key === "Enter" && addPreference()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addPreference}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Dislikes Section */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Dislikes</Label>
            <div className="col-span-3">
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
                <div className="flex flex-wrap gap-2 mb-2">
                  {dislikes
                    .filter((d) => !DISLIKE_OPTIONS.includes(d))
                    .map((dislike) => (
                      <div
                        key={dislike}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md flex items-center gap-1 text-xs"
                      >
                        <span>{dislike}</span>
                        <button
                          onClick={() => removeDislike(dislike)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                </div>
              )}
              <div className="flex gap-2">
                <Input
                  value={newDislike}
                  onChange={(e) => setNewDislike(e.target.value)}
                  placeholder="Add custom dislike"
                  onKeyPress={(e) => e.key === "Enter" && addDislike()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addDislike}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <DialogTrigger asChild>
            <Button variant="outline">Cancel</Button>
          </DialogTrigger>
          <Button
            className="bg-green-500 text-white hover:bg-green-600"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
