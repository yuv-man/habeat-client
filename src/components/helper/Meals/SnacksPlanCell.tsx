import fireIcon from '@/assets/fire.svg';
import checkedIcon from '@/assets/full_check.svg';
import uncheckedIcon from '@/assets/empty_check.svg';
import '@/styles/mealPlanCell.css'
import { useState } from 'react';

  interface SimpleSnack {
    name: string;
    calories: number;
  }
  interface SnacksPlanCellProps {
    snacks: SimpleSnack[];
    isEditMode: boolean;
    isToday: boolean;
    date: Date;
    onClick: (snack: SimpleSnack) => void;
  }
  
  const SnacksPlanCell = ({ 
    snacks,  
    isEditMode, 
    isToday, 
    date,
    onClick 
  }: SnacksPlanCellProps) => {
    const now = new Date();
    const isPastDate = date < now;
    const [snacksCompleted, setSnacksCompleted] = useState(snacks.map(() => false));

    const onComplete = (index: number) => {
      console.log(index);
      setSnacksCompleted(snacksCompleted.map((snack, i) => i === index ? !snack : snack));
    };

    return (
      <div
        className={`grid-cell border-l ${
          isEditMode && (isToday || date > now)
            ? 'cursor-pointer hover:bg-gray-50 hover:border-green-200' 
            : isPastDate
              ? 'bg-gray-50 opacity-75' 
              : ''
        } ${isToday ? 'today' : ''}`}
      >
        {snacks.map((snack, index) => (
          <div className="flex flex-col" key={index} onClick={() => onClick(snack)}>  
            <p className="cell-name-text snacks" title={snack.name}>
                {snack.name}
            </p>
            <div className="flex flex-row justify-between">
              <div className="info-container calories snacks">
                  <img src={fireIcon} alt="fire" />
                  <p>{snack.calories}</p>
              </div>
              <button className="complete-button" onClick={() => onComplete(index)}>
                  {snacksCompleted[index] ? <img src={checkedIcon} alt="complete" className="w-4 h-4" /> : <img src={uncheckedIcon} alt="complete" className="w-4 h-4" />}
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };
  
  export default SnacksPlanCell;
  