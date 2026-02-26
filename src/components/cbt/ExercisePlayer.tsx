import { useState, useEffect } from "react";
import {
  X, ChevronLeft, ChevronRight, CheckCircle, Clock, Pause, Play,
  Smile, Frown, Meh,
} from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { ICBTExercise, MoodLevel, ICBTExerciseCompletion } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ExercisePlayerProps {
  exercise: ICBTExercise;
  onComplete: (completion: ICBTExerciseCompletion) => void;
  onCancel: () => void;
  className?: string;
}

export function ExercisePlayer({
  exercise,
  onComplete,
  onCancel,
  className,
}: ExercisePlayerProps) {
  const { completeExercise, loading } = useCBTStore();
  const [step, setStep] = useState(0); // 0 = intro, 1-n = instructions, n+1 = reflection, n+2 = complete
  const [moodBefore, setMoodBefore] = useState<MoodLevel | null>(null);
  const [moodAfter, setMoodAfter] = useState<MoodLevel | null>(null);
  const [reflection, setReflection] = useState("");
  const [startTime] = useState(Date.now());
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const totalSteps = exercise.instructions.length + 3; // intro + instructions + reflection + complete

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleComplete = async () => {
    const duration = Math.round((Date.now() - startTime) / 60000); // Convert to minutes

    const completion = {
      exerciseId: exercise.id,
      exerciseType: exercise.type,
      date: new Date().toISOString().split("T")[0],
      duration: Math.max(1, duration), // At least 1 minute
      moodBefore: moodBefore || undefined,
      moodAfter: moodAfter || undefined,
      reflection: reflection.trim() || undefined,
    };

    const result = await completeExercise(completion);
    if (result) {
      onComplete(result);
    }
  };

  const renderMoodSelector = (
    label: string,
    value: MoodLevel | null,
    onChange: (level: MoodLevel) => void
  ) => (
    <div className="space-y-3">
      <p className="text-sm font-medium text-gray-600">{label}</p>
      <div className="flex justify-center gap-4">
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => {
          const icons = {
            1: <Frown className="w-8 h-8" />,
            2: <Frown className="w-8 h-8" />,
            3: <Meh className="w-8 h-8" />,
            4: <Smile className="w-8 h-8" />,
            5: <Smile className="w-8 h-8" />,
          };
          const colors = {
            1: "text-red-500 bg-red-50 border-red-200",
            2: "text-orange-500 bg-orange-50 border-orange-200",
            3: "text-gray-500 bg-gray-50 border-gray-200",
            4: "text-green-500 bg-green-50 border-green-200",
            5: "text-emerald-500 bg-emerald-50 border-emerald-200",
          };

          return (
            <button
              key={level}
              onClick={() => onChange(level)}
              className={cn(
                "p-3 rounded-xl border-2 transition-all",
                colors[level],
                value === level && "ring-2 ring-offset-2 ring-blue-500"
              )}
            >
              {icons[level]}
              <p className="text-xs mt-1">{level}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const renderIntro = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto">
        <span className="text-4xl">{exercise.icon || "🧘"}</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">{exercise.title}</h2>
        <p className="text-gray-600">{exercise.description}</p>
      </div>
      <div className="flex justify-center gap-4 text-sm text-gray-500">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {exercise.duration} min
        </span>
        <span className="capitalize">{exercise.difficulty}</span>
      </div>

      {renderMoodSelector("How are you feeling right now?", moodBefore, setMoodBefore)}

      <Button
        onClick={() => {
          setStep(1);
          setIsTimerRunning(true);
        }}
        disabled={!moodBefore}
        className="w-full"
      >
        Begin Exercise
      </Button>
    </div>
  );

  const renderInstruction = (index: number) => {
    const instruction = exercise.instructions[index];
    const progress = ((index + 1) / exercise.instructions.length) * 100;

    return (
      <div className="space-y-6">
        {/* Progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-gray-600">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            {isTimerRunning ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>
          <span className="text-lg font-mono">{formatTime(timer)}</span>
        </div>

        {/* Instruction */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl p-6 text-center">
          <p className="text-xs text-purple-600 font-medium mb-2">
            Step {index + 1} of {exercise.instructions.length}
          </p>
          <p className="text-lg text-gray-800">{instruction}</p>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            className="flex-1"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            onClick={() => {
              if (index < exercise.instructions.length - 1) {
                setStep(step + 1);
              } else {
                setStep(exercise.instructions.length + 1); // Go to reflection
                setIsTimerRunning(false);
              }
            }}
            className="flex-1"
          >
            {index < exercise.instructions.length - 1 ? "Next" : "Complete"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  };

  const renderReflection = () => (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-800">Exercise Complete!</h2>
        <p className="text-gray-600">Time: {formatTime(timer)}</p>
      </div>

      {renderMoodSelector("How do you feel now?", moodAfter, setMoodAfter)}

      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          Reflection (optional)
        </label>
        <Textarea
          placeholder="Any thoughts or insights from this exercise?"
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleComplete}
        disabled={loading || !moodAfter}
        className="w-full"
      >
        {loading ? "Saving..." : "Save & Finish"}
      </Button>
    </div>
  );

  return (
    <div className={cn("fixed inset-0 z-50 flex items-center justify-center", className)}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 z-10 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-6">
          {step === 0 && renderIntro()}
          {step > 0 && step <= exercise.instructions.length && renderInstruction(step - 1)}
          {step > exercise.instructions.length && renderReflection()}
        </div>
      </div>
    </div>
  );
}
