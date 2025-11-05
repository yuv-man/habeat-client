import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Droplets, Plus } from "lucide-react";
import ProgressBar from "@/components/helper/ProgressBar";
import addCircle from "@/assets/add_circle.svg";
import waterIcon from "@/assets/water.svg";
import "@/styles/dailyScreen.css";
import "@/styles/waterCard.css";

interface WaterCardProps {
  current: number;
  goal: number;
  onAddGlass: () => void;
}

const WaterCard = ({ current, goal, onAddGlass }: WaterCardProps) => {
  const [showDrop, setShowDrop] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const progress = (current / goal) * 100;

  useEffect(() => {
    // Check if goal is reached
    if (current === goal) {
      setShowCelebration(true);
      const timer = setTimeout(() => setShowCelebration(false), 500);
      return () => clearTimeout(timer);
    }
  }, [current, goal]);

  const addGlassClicked = () => {
    setShowDrop(true);
    setTimeout(() => setShowDrop(false), 1000);
    onAddGlass();
  };

  return (
    <div className={`mealCard water-container ${showCelebration ? 'celebrate' : ''}`}>
      <div className="pb-3 flex justify-between items-center p-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={waterIcon} alt="water" className="w-10 h-10" />
            {showDrop && (
              <Droplets 
                className="water-drop absolute top-0 left-1/2 transform -translate-x-1/2 text-blue-500" 
                size={24}
              />
            )}
          </div>
          <div className="flex flex-col text-md font-semibold text-gray-800">
            <div className="flex items-center gap-2">
              <span className="capitalize text-gray-800">Water</span>
            </div>
            <div className="text-xs text-blue-300">
              {goal} daily glasses
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div 
              className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-2 rounded-full transition-colors duration-200"
              onClick={addGlassClicked}
            >
              <img src={addCircle} alt="add circle" className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 pb-2">
        <ProgressBar current={current} goal={goal} color="var(--water)" unit="glasses" icon="" label="" />
      </div>
    </div>
  );
};

export default WaterCard;