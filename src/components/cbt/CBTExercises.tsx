import { useState, useMemo } from "react";
import { Sparkles, Brain, Utensils, Heart, Filter, Star } from "lucide-react";
import { ICBTExercise, CBTExerciseCategory, ICBTExerciseCompletion } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { ExerciseCard } from "./ExerciseCard";
import { ExercisePlayer } from "./ExercisePlayer";

interface CBTExercisesProps {
  className?: string;
  category?: CBTExerciseCategory;
  showRecommended?: boolean;
}

// Built-in exercise library
const EXERCISES: ICBTExercise[] = [
  {
    id: "breathing-478",
    type: "breathing",
    title: "4-7-8 Breathing",
    description: "A calming breath technique to reduce anxiety and promote relaxation",
    duration: 5,
    difficulty: "beginner",
    category: "stress",
    instructions: [
      "Find a comfortable seated position and relax your shoulders",
      "Place the tip of your tongue behind your upper front teeth",
      "Exhale completely through your mouth, making a whoosh sound",
      "Close your mouth and inhale quietly through your nose for 4 seconds",
      "Hold your breath for 7 seconds",
      "Exhale completely through your mouth for 8 seconds",
      "This completes one cycle. Repeat 3 more times",
    ],
    benefits: ["Reduces anxiety", "Improves sleep", "Calms nervous system"],
    icon: "🌬️",
  },
  {
    id: "gratitude-journal",
    type: "gratitude",
    title: "Gratitude Reflection",
    description: "Shift focus to positive aspects of your day",
    duration: 5,
    difficulty: "beginner",
    category: "mood",
    instructions: [
      "Take a moment to settle and clear your mind",
      "Think of 3 things you're grateful for today, no matter how small",
      "For each one, pause and really feel the gratitude",
      "Notice any positive emotions that arise",
      "Consider why these things matter to you",
      "End by taking a deep breath and acknowledging this moment of positivity",
    ],
    benefits: ["Improves mood", "Builds positivity", "Reduces stress"],
    icon: "🙏",
  },
  {
    id: "mindful-eating",
    type: "mindful_eating",
    title: "Mindful Eating Practice",
    description: "Develop awareness around eating habits and hunger cues",
    duration: 10,
    difficulty: "beginner",
    category: "eating",
    instructions: [
      "Before eating, pause and rate your hunger on a scale of 1-10",
      "Notice any emotions you're feeling right now",
      "Look at your food - notice the colors, textures, and arrangement",
      "Take a small bite and chew slowly, noticing flavors and textures",
      "Put down your utensil between bites",
      "Halfway through, pause and check in - how hungry are you now?",
      "Notice when you feel satisfied (not full) and consider stopping",
      "Reflect: Was this eating driven by hunger or emotions?",
    ],
    benefits: ["Reduces overeating", "Improves digestion", "Identifies emotional eating"],
    icon: "🍽️",
  },
  {
    id: "body-scan",
    type: "body_scan",
    title: "Body Scan Relaxation",
    description: "Release tension by bringing awareness to each part of your body",
    duration: 10,
    difficulty: "beginner",
    category: "stress",
    instructions: [
      "Lie down or sit comfortably. Close your eyes",
      "Take 3 deep breaths, relaxing more with each exhale",
      "Bring attention to your feet. Notice any sensations, then relax them",
      "Move awareness to your calves and thighs. Release any tension",
      "Notice your abdomen and lower back. Let them soften",
      "Bring attention to your chest, shoulders, and arms. Let them feel heavy",
      "Relax your neck, jaw, and face muscles",
      "Notice your whole body as relaxed and calm",
      "Take a few more deep breaths before opening your eyes",
    ],
    benefits: ["Reduces muscle tension", "Promotes relaxation", "Improves body awareness"],
    icon: "🧘",
  },
  {
    id: "cognitive-restructuring",
    type: "cognitive_restructuring",
    title: "Challenge Your Thoughts",
    description: "Identify and reframe unhelpful thinking patterns",
    duration: 10,
    difficulty: "intermediate",
    category: "mood",
    instructions: [
      "Identify a negative thought that's been bothering you",
      "Write it down or say it clearly in your mind",
      "Ask yourself: What evidence supports this thought?",
      "Now ask: What evidence contradicts this thought?",
      "Consider: Is there another way to view this situation?",
      "Create a more balanced, realistic thought",
      "Notice how this new perspective feels",
      "Practice replacing the old thought with the new one",
    ],
    benefits: ["Reduces negative thinking", "Builds mental flexibility", "Improves mood"],
    icon: "💭",
  },
  {
    id: "urge-surfing",
    type: "urge_surfing",
    title: "Urge Surfing",
    description: "Learn to ride out cravings without acting on them",
    duration: 5,
    difficulty: "intermediate",
    category: "eating",
    instructions: [
      "When you notice a craving, pause instead of acting",
      "Observe the craving without judgment - where do you feel it in your body?",
      "Rate the intensity from 1-10",
      "Imagine the craving as a wave - it will rise, peak, and fall",
      "Breathe slowly and stay curious about the sensation",
      "Notice as the intensity naturally decreases over 10-15 minutes",
      "Remind yourself: Cravings are temporary and will pass",
      "Congratulate yourself for surfing the urge",
    ],
    benefits: ["Reduces impulsive eating", "Builds self-control", "Manages cravings"],
    icon: "🌊",
  },
  {
    id: "self-compassion",
    type: "self_compassion",
    title: "Self-Compassion Break",
    description: "Practice kindness toward yourself during difficult moments",
    duration: 5,
    difficulty: "beginner",
    category: "general",
    instructions: [
      "Think of a situation that's causing you stress or self-criticism",
      "Say to yourself: 'This is a moment of difficulty'",
      "Acknowledge: 'Difficulty is part of being human. I'm not alone'",
      "Place your hand on your heart and feel its warmth",
      "Ask yourself: 'What do I need to hear right now?'",
      "Offer yourself kind words as you would to a good friend",
      "Take a moment to feel the compassion you're giving yourself",
    ],
    benefits: ["Reduces self-criticism", "Builds resilience", "Improves emotional wellbeing"],
    icon: "💕",
  },
  {
    id: "behavioral-activation",
    type: "behavioral_activation",
    title: "Activity Planning",
    description: "Schedule enjoyable activities to improve mood",
    duration: 10,
    difficulty: "intermediate",
    category: "mood",
    instructions: [
      "List 5 activities that usually bring you joy or satisfaction",
      "For each activity, rate how much pleasure (1-10) and achievement (1-10) it brings",
      "Choose one activity you can do today, even if motivation is low",
      "Set a specific time and duration for this activity",
      "Commit to doing it regardless of how you feel",
      "After completing it, notice any changes in your mood",
      "Plan another activity for tomorrow",
      "Build a routine of positive activities throughout your week",
    ],
    benefits: ["Improves mood", "Increases motivation", "Breaks depression cycles"],
    icon: "📅",
  },
];

const CATEGORY_FILTERS: { value: CBTExerciseCategory | "all"; label: string; icon: React.ReactNode }[] = [
  { value: "all", label: "All", icon: <Filter className="w-4 h-4" /> },
  { value: "mood", label: "Mood", icon: <Brain className="w-4 h-4" /> },
  { value: "eating", label: "Eating", icon: <Utensils className="w-4 h-4" /> },
  { value: "stress", label: "Stress", icon: <Heart className="w-4 h-4" /> },
  { value: "general", label: "General", icon: <Sparkles className="w-4 h-4" /> },
];

export function CBTExercises({
  className,
  category: initialCategory,
  showRecommended = true,
}: CBTExercisesProps) {
  const [selectedCategory, setSelectedCategory] = useState<CBTExerciseCategory | "all">(
    initialCategory || "all"
  );
  const [activeExercise, setActiveExercise] = useState<ICBTExercise | null>(null);

  const filteredExercises = useMemo(() => {
    if (selectedCategory === "all") return EXERCISES;
    return EXERCISES.filter((e) => e.category === selectedCategory);
  }, [selectedCategory]);

  // Recommended exercises (eating-focused for this app)
  const recommendedExercises = useMemo(() => {
    return EXERCISES.filter((e) =>
      e.category === "eating" || e.type === "urge_surfing" || e.type === "mindful_eating"
    ).slice(0, 3);
  }, []);

  const handleExerciseComplete = (completion: ICBTExerciseCompletion) => {
    setActiveExercise(null);
    // Could show a toast or celebration here
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Exercise Player Modal */}
      {activeExercise && (
        <ExercisePlayer
          exercise={activeExercise}
          onComplete={handleExerciseComplete}
          onCancel={() => setActiveExercise(null)}
        />
      )}

      {/* Recommended section */}
      {showRecommended && selectedCategory === "all" && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500" />
            <h3 className="font-semibold text-gray-800">Recommended for You</h3>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
            {recommendedExercises.map((exercise) => (
              <div key={exercise.id} className="flex-shrink-0 w-64">
                <ExerciseCard
                  exercise={exercise}
                  onStart={setActiveExercise}
                  compact
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() => setSelectedCategory(filter.value)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
              selectedCategory === filter.value
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {filter.icon}
            {filter.label}
          </button>
        ))}
      </div>

      {/* Exercise grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredExercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            onStart={setActiveExercise}
          />
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No exercises found for this category
        </div>
      )}
    </div>
  );
}
