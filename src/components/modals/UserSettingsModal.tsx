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
import { X, Plus } from "lucide-react";

export function UserSettingsModal({ children }: { children: React.ReactNode }) {
  const { user, updateProfile } = useAuthStore();
  const [weight, setWeight] = useState(user?.weight?.toString() || "");
  const [newAllergy, setNewAllergy] = useState("");
  const [newPreference, setNewPreference] = useState("");
  const [newDislike, setNewDislike] = useState("");
  const [allergies, setAllergies] = useState<string[]>(user?.allergies || []);
  const [preferences, setPreferences] = useState<string[]>(user?.dietaryRestrictions || []);
  const [dislikes, setDislikes] = useState<string[]>(user?.dislikes || []);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile({
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
              <div className="flex flex-wrap gap-2 mb-2">
                {allergies.map((allergy) => (
                  <div
                    key={allergy}
                    className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{allergy}</span>
                    <button
                      onClick={() => removeAllergy(allergy)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
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
              <div className="flex flex-wrap gap-2 mb-2">
                {preferences.map((preference) => (
                  <div
                    key={preference}
                    className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{preference}</span>
                    <button
                      onClick={() => removePreference(preference)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newPreference}
                  onChange={(e) => setNewPreference(e.target.value)}
                  placeholder="Add preference"
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
              <div className="flex flex-wrap gap-2 mb-2">
                {dislikes.map((dislike) => (
                  <div
                    key={dislike}
                    className="bg-gray-100 px-2 py-1 rounded-md flex items-center gap-1"
                  >
                    <span>{dislike}</span>
                    <button
                      onClick={() => removeDislike(dislike)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
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
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
