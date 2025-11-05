import React from 'react';
import timeIcon from '@/assets/clock.svg';
import caloriesIcon from '@/assets/fire.svg';
import "@/styles/mealPlanCell.css";


const WorkoutPlanCell = ({workouts, isEditMode, isToday, date}: {workouts: {name: string, duration: number, caloriesBurned: number}[], isEditMode: boolean, isToday: boolean, date: Date}) => {
    return (
        <div className={`grid-cell border-l ${isToday ? 'today' : ''}`}>
            {workouts.map((workout, index) => (
                <div className="flex flex-col gap-2" key={index}>
                    <p className="workout-name-text" title={workout.name}>
                        {workout.name}
                    </p>
                    <div className="flex flex-row justify-between">
                        <div className="info-container calories">
                            <img src={caloriesIcon} alt="fire" />
                            <p>{workout.caloriesBurned}</p>
                        </div>
                        <div className="info-container time">
                            <img src={timeIcon} alt="clock" />
                            <p>{workout.duration}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WorkoutPlanCell;