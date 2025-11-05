import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, User, Target, Calculator, AlertTriangle, UserCheck } from "lucide-react";
import iconImage from "@/assets/habeatIcon.png";
import { paths } from "@/lib/paths";
import { calculateBMR, calculateTDEE, calculateIdealWeight } from "@/lib/calculations";
import { commonAllergies, dietaryOptions } from "@/lib/dietry";
import { IUser } from "@/types/interfaces";
import AuthModal from "@/components/auth/AuthModal";
import { useAuthStore } from "@/stores/authStore";

const Registration = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userData, setUserData] = useState<IUser>({
    name: "",
    email: "",
    password: "",
    height: 0,
    weight: 0,
    gender: "",
    age: 0,
    path: "",
    bmr: 0,
    tdee: 0,
    idealWeight: 0,
    allergies: [],
    dietaryRestrictions: [],
    isPremium: false,
  });

  const [customAllergy, setCustomAllergy] = useState("");
  const [showOtherAllergy, setShowOtherAllergy] = useState(false);

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else {
      setStep(5);
    }
  };

  const handleCreateAccount = () => {
    // AuthModal will handle the signup, just navigate after success
    navigate('/dashboard');
  };  

  const handleGuest = () => {
    authStore.guestSignin(userData);
    navigate('/dashboard');
  };

  const isStep1Valid = userData.height && userData.weight && userData.gender && userData.age;
  const isStep2Valid = userData.path;
  const idealWeight = calculateIdealWeight(userData);

  const toggleAllergy = (allergy: string) => {
    if (allergy === "Other") {
      setShowOtherAllergy(!showOtherAllergy);
      return;
    }
    
    setUserData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }));
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !userData.allergies.includes(customAllergy.trim())) {
      setUserData(prev => ({
        ...prev,
        allergies: [...prev.allergies, customAllergy.trim()]
      }));
      setCustomAllergy("");
    }
  };

  const removeAllergy = (allergy: string) => {
    setUserData(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const toggleDietaryRestriction = (diet: string) => {
    setUserData(prev => ({
      ...prev,
      dietaryRestrictions: prev.dietaryRestrictions.includes(diet)
        ? prev.dietaryRestrictions.filter(d => d !== diet)
        : [...prev.dietaryRestrictions, diet]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-4">
          <div className="flex items-center justify-center mb-2">
            <img src={iconImage} alt="Habeat" className="h-20 w-20" />
            <h1 className="text-4xl font-bold text-white">Habeat</h1>
          </div>
          <p className="text-white/80">Your journey to better health starts here</p> 
        </div>

        <Card className="backdrop-blur-sm bg-white/95">
          {step === 1 && (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Tell us about yourself</CardTitle>
                <CardDescription>We need some basic information to personalize your experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      placeholder="170"
                      value={userData.height}
                      onChange={(e) => setUserData({ ...userData, height: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      placeholder="70"
                      value={userData.weight}
                      onChange={(e) => setUserData({ ...userData, weight: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select value={userData.gender} onValueChange={(value) => setUserData({ ...userData, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    value={userData.age}
                    onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) })}
                  />
                </div>

                <Button 
                  onClick={handleNext} 
                  disabled={!isStep1Valid}
                  className="w-full"
                >
                  Continue <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </>
          )}

          {step === 2 && (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Choose your path</CardTitle>
                <CardDescription>Select your primary health goal</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={userData.path}
                  onValueChange={(value) => setUserData({ ...userData, path: value })}
                  className="space-y-3"
                >
                  {paths.map((path) => (
                    <div key={path.id} className="relative">
                      <RadioGroupItem
                        value={path.id}
                        id={path.id}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={path.id}
                        className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          userData.path === path.id 
                            ? 'border-primary bg-primary/5' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                          <div className="flex items-center space-x-3">
                            <img src={path.icon} alt={path.label} className="w-6 h-6" />
                          <div className="flex-1">
                            <div className="font-semibold">{path.label}</div>
                            <div className="text-sm text-muted-foreground">{path.description}</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={!isStep2Valid} className="flex-1">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 3 && (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Dietary Preferences</CardTitle>
                <CardDescription>Help us personalize your meal recommendations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Allergies Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Food Allergies</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {commonAllergies.map((allergy) => (
                      <div key={allergy} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergy-${allergy}`}
                          checked={allergy === "Other" ? showOtherAllergy : userData.allergies.includes(allergy)}
                          onCheckedChange={() => toggleAllergy(allergy)}
                        />
                        <Label htmlFor={`allergy-${allergy}`} className="text-sm cursor-pointer">
                          {allergy}
                        </Label>
                      </div>
                    ))}
                  </div>

                  {/* Custom Allergy Input */}
                  {showOtherAllergy && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Add custom allergy:</Label>
                      <div className="flex space-x-2">
                        <Input
                          placeholder="Enter allergy..."
                          value={customAllergy}
                          onChange={(e) => setCustomAllergy(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && addCustomAllergy()}
                        />
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={addCustomAllergy}
                          disabled={!customAllergy.trim()}
                        >
                          Add
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Display Selected Allergies */}
                  {userData.allergies.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground">Selected allergies:</Label>
                      <div className="flex flex-wrap gap-2">
                        {userData.allergies.map((allergy) => (
                          <div key={allergy} className="flex items-center space-x-1 bg-primary/10 text-primary px-2 py-1 rounded-md">
                            <span className="text-sm">{allergy}</span>
                            <button
                              type="button"
                              onClick={() => removeAllergy(allergy)}
                              className="text-primary hover:text-primary/70 text-xs"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Dietary Restrictions Section */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Dietary Preferences</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {dietaryOptions.map((diet) => (
                      <div key={diet} className="flex items-center space-x-2">
                        <Checkbox
                          id={`diet-${diet}`}
                          checked={userData.dietaryRestrictions.includes(diet)}
                          onCheckedChange={() => toggleDietaryRestriction(diet)}
                        />
                        <Label htmlFor={`diet-${diet}`} className="text-sm cursor-pointer">
                          {diet}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 4 && (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <Calculator className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Your Health Profile</CardTitle>
                <CardDescription>Based on your information, here are your metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="bg-gradient-primary p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Basal Metabolic Rate</div>
                    <div className="text-2xl font-bold">{Math.round(calculateBMR(userData))} kcal/day</div>
                  </div>
                  
                  <div className="bg-gradient-healthy p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Total Daily Energy Expenditure</div>
                    <div className="text-2xl font-bold">{Math.round(calculateTDEE(calculateBMR(userData)))} kcal/day</div>
                  </div>
                  
                  <div className="bg-gradient-primary p-4 rounded-lg text-white">
                    <div className="text-sm opacity-90">Ideal Weight Range</div>
                    <div className="text-2xl font-bold">{Math.round(idealWeight)} kg</div>
                  </div>
                </div>

                <div className="flex space-x-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNext} className="flex-1">
                    Start Journey <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {step === 5 && (
            <>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  <UserCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Create Your Account</CardTitle>
                <CardDescription>Join Habeat to save your progress and access personalized features</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Create an account to unlock:
                  </p>
                  <div className="grid gap-2 text-sm">
                    <div className="flex items-center justify-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Personalized meal plans</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Progress tracking & photos</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Smart notifications</span>
                    </div>
                    <div className="flex items-center justify-start space-x-2">
                      <span className="text-green-500">✓</span>
                      <span>Share with friends</span>
                    </div>
                  </div>
                </div>

                <AuthModal 
                  userData={{
                    ...userData,
                    bmr: Math.round(calculateBMR(userData)),
                    tdee: Math.round(calculateTDEE(calculateBMR(userData))),
                    idealWeight: Math.round(idealWeight),
                    weightRange: `${Math.round(idealWeight) - 10} - ${Math.round(idealWeight) + 10} kg`,
                  }}
                  onSuccess={handleCreateAccount}
                >
                  <Button className="w-full">
                    Create Account <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </AuthModal>

                <div className="flex space-x-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                    Back
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={handleGuest} 
                    className="flex-1"
                  >
                    Continue as Guest
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Registration;