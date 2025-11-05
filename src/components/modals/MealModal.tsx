import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { mealTypes } from "@/lib/paths";

interface MealModalProps {
  children: React.ReactNode;
  onMealAdd: (meal: { name: string; calories: string; type: string }) => void;
}

const MealModal = ({ children, onMealAdd }: MealModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mealData, setMealData] = useState({ name: '', calories: '', type: '' });

  const handleSubmit = () => {
    if (mealData.name && mealData.calories && mealData.type) {
      onMealAdd(mealData);
      setMealData({ name: '', calories: '', type: '' });
      setIsOpen(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setMealData({ name: '', calories: '', type: '' });
    }
  };

  const handlePickFromPlan = () => {
    // TODO: Implement meal plan selection
    console.log('Pick from plan functionality');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Meal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="meal-name">Meal Name</Label>
            <Input
              id="meal-name"
              placeholder="e.g., Grilled Chicken Salad"
              value={mealData.name}
              onChange={(e) => setMealData({ ...mealData, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="meal-calories">Calories</Label>
            <Input
              id="meal-calories"
              type="number"
              placeholder="350"
              value={mealData.calories}
              onChange={(e) => setMealData({ ...mealData, calories: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="meal-type">Meal Type</Label>
            <Select value={mealData.type} onValueChange={(value) => setMealData({ ...mealData, type: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select meal type" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(mealTypes).map((type) => (
                  <SelectItem key={type.id} value={type.label}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="pt-2">
            <Button variant="outline" className="w-full mb-2" onClick={handlePickFromPlan}>
              Pick from Plan
            </Button>
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={!mealData.name || !mealData.calories || !mealData.type}
            >
              Add Meal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MealModal; 