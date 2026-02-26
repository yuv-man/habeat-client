import { useState } from "react";
import {
  X, ChevronLeft, ChevronRight, Lightbulb, Scale, Heart, Sparkles,
} from "lucide-react";
import { useCBTStore } from "@/stores/cbtStore";
import { MoodLevel, CognitiveDistortionType, IThoughtEntry, IThoughtEmotion } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DistortionSelector } from "./DistortionSelector";

interface ThoughtEntryFormProps {
  className?: string;
  linkedMealId?: string;
  linkedMealType?: "breakfast" | "lunch" | "dinner" | "snacks";
  onComplete?: (entry: IThoughtEntry) => void;
  onCancel?: () => void;
}

const COMMON_EMOTIONS = [
  "Anxious", "Sad", "Angry", "Frustrated", "Overwhelmed",
  "Guilty", "Ashamed", "Scared", "Hopeless", "Lonely",
  "Jealous", "Embarrassed", "Disappointed", "Hurt", "Worried",
];

const STEPS = [
  { num: 1, title: "Situation", icon: "situation" },
  { num: 2, title: "Thought", icon: "thought" },
  { num: 3, title: "Emotions", icon: "emotions" },
  { num: 4, title: "Patterns", icon: "patterns" },
  { num: 5, title: "Evidence", icon: "evidence" },
  { num: 6, title: "Reframe", icon: "reframe" },
];

export function ThoughtEntryForm({
  className,
  linkedMealId,
  linkedMealType,
  onComplete,
  onCancel,
}: ThoughtEntryFormProps) {
  const { logThought, loading } = useCBTStore();
  const [step, setStep] = useState(1);

  // Form state
  const [situation, setSituation] = useState("");
  const [automaticThought, setAutomaticThought] = useState("");
  const [emotions, setEmotions] = useState<IThoughtEmotion[]>([]);
  const [customEmotion, setCustomEmotion] = useState("");
  const [distortions, setDistortions] = useState<CognitiveDistortionType[]>([]);
  const [supportingEvidence, setSupportingEvidence] = useState<string[]>([""]);
  const [contradictingEvidence, setContradictingEvidence] = useState<string[]>([""]);
  const [balancedThought, setBalancedThought] = useState("");
  const [outcomeEmotion, setOutcomeEmotion] = useState<IThoughtEmotion | null>(null);
  const [isEmotionalEating, setIsEmotionalEating] = useState(false);

  const addEmotion = (name: string) => {
    if (!emotions.find((e) => e.name === name)) {
      setEmotions([...emotions, { name, intensity: 3 }]);
    }
  };

  const updateEmotionIntensity = (name: string, intensity: MoodLevel) => {
    setEmotions(emotions.map((e) => (e.name === name ? { ...e, intensity } : e)));
  };

  const removeEmotion = (name: string) => {
    setEmotions(emotions.filter((e) => e.name !== name));
  };

  const addCustomEmotion = () => {
    if (customEmotion.trim() && !emotions.find((e) => e.name.toLowerCase() === customEmotion.toLowerCase())) {
      addEmotion(customEmotion.trim());
      setCustomEmotion("");
    }
  };

  const updateEvidence = (type: "supporting" | "contradicting", index: number, value: string) => {
    if (type === "supporting") {
      const updated = [...supportingEvidence];
      updated[index] = value;
      setSupportingEvidence(updated);
    } else {
      const updated = [...contradictingEvidence];
      updated[index] = value;
      setContradictingEvidence(updated);
    }
  };

  const addEvidenceField = (type: "supporting" | "contradicting") => {
    if (type === "supporting") {
      setSupportingEvidence([...supportingEvidence, ""]);
    } else {
      setContradictingEvidence([...contradictingEvidence, ""]);
    }
  };

  const handleSubmit = async () => {
    const now = new Date();
    const entry = {
      date: now.toISOString().split("T")[0],
      time: now.toTimeString().split(" ")[0].slice(0, 5),
      situation,
      automaticThought,
      emotions,
      cognitiveDistortions: distortions.length > 0 ? distortions : undefined,
      evidence: {
        supporting: supportingEvidence.filter((e) => e.trim()),
        contradicting: contradictingEvidence.filter((e) => e.trim()),
      },
      balancedThought: balancedThought.trim() || undefined,
      outcomeEmotion: outcomeEmotion || undefined,
      linkedMealId,
      linkedMealType,
      isEmotionalEating: linkedMealId ? isEmotionalEating : undefined,
    };

    const result = await logThought(entry);
    if (result) {
      onComplete?.(result);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1: return situation.trim().length > 0;
      case 2: return automaticThought.trim().length > 0;
      case 3: return emotions.length > 0;
      case 4: return true; // Distortions are optional
      case 5: return true; // Evidence is optional
      case 6: return true; // Reframe is optional
      default: return false;
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Lightbulb className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">What happened?</h3>
          <p className="text-sm text-gray-500">Describe the situation briefly</p>
        </div>
      </div>
      <Textarea
        placeholder="e.g., I was about to eat dinner and felt really anxious..."
        value={situation}
        onChange={(e) => setSituation(e.target.value)}
        rows={4}
        className="resize-none"
      />
      {linkedMealId && (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="emotional-eating"
            checked={isEmotionalEating}
            onChange={(e) => setIsEmotionalEating(e.target.checked)}
            className="rounded border-gray-300"
          />
          <label htmlFor="emotional-eating" className="text-sm text-gray-600">
            This might be emotional eating
          </label>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <div className="p-2 bg-purple-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">What thought popped up?</h3>
          <p className="text-sm text-gray-500">Write your automatic thought</p>
        </div>
      </div>
      <Textarea
        placeholder="e.g., I'm going to mess this up. Everyone will think I'm a failure..."
        value={automaticThought}
        onChange={(e) => setAutomaticThought(e.target.value)}
        rows={4}
        className="resize-none"
      />
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <div className="p-2 bg-red-100 rounded-lg">
          <Heart className="w-5 h-5 text-red-500" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">How did you feel?</h3>
          <p className="text-sm text-gray-500">Select emotions and rate their intensity</p>
        </div>
      </div>

      {/* Common emotions */}
      <div className="flex flex-wrap gap-2">
        {COMMON_EMOTIONS.map((emotion) => (
          <button
            key={emotion}
            onClick={() => addEmotion(emotion)}
            disabled={emotions.some((e) => e.name === emotion)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm border transition-all",
              emotions.some((e) => e.name === emotion)
                ? "bg-purple-100 border-purple-300 text-purple-700"
                : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
            )}
          >
            {emotion}
          </button>
        ))}
      </div>

      {/* Custom emotion input */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom emotion..."
          value={customEmotion}
          onChange={(e) => setCustomEmotion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addCustomEmotion()}
          className="flex-1"
        />
        <Button variant="outline" onClick={addCustomEmotion}>
          Add
        </Button>
      </div>

      {/* Selected emotions with intensity */}
      {emotions.length > 0 && (
        <div className="space-y-3 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-500 font-medium">Rate intensity (1-5):</p>
          {emotions.map((emotion) => (
            <div key={emotion.name} className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 w-24 truncate">
                {emotion.name}
              </span>
              <div className="flex gap-1 flex-1">
                {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => updateEmotionIntensity(emotion.name, level)}
                    className={cn(
                      "w-8 h-8 rounded-lg text-sm font-medium transition-all",
                      emotion.intensity === level
                        ? "bg-purple-500 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <button
                onClick={() => removeEmotion(emotion.name)}
                className="p-1 text-gray-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-4">
      <DistortionSelector
        selected={distortions}
        onSelectionChange={setDistortions}
      />
      <p className="text-xs text-gray-400 text-center">
        This step is optional - skip if none apply
      </p>
    </div>
  );

  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <div className="p-2 bg-green-100 rounded-lg">
          <Scale className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Examine the evidence</h3>
          <p className="text-sm text-gray-500">What supports and contradicts this thought?</p>
        </div>
      </div>

      {/* Supporting evidence */}
      <div>
        <label className="text-sm font-medium text-red-600 mb-2 block">
          Evidence supporting the thought
        </label>
        {supportingEvidence.map((evidence, index) => (
          <Input
            key={index}
            placeholder="What facts support this thought?"
            value={evidence}
            onChange={(e) => updateEvidence("supporting", index, e.target.value)}
            className="mb-2"
          />
        ))}
        <button
          onClick={() => addEvidenceField("supporting")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          + Add more
        </button>
      </div>

      {/* Contradicting evidence */}
      <div>
        <label className="text-sm font-medium text-green-600 mb-2 block">
          Evidence against the thought
        </label>
        {contradictingEvidence.map((evidence, index) => (
          <Input
            key={index}
            placeholder="What facts contradict this thought?"
            value={evidence}
            onChange={(e) => updateEvidence("contradicting", index, e.target.value)}
            className="mb-2"
          />
        ))}
        <button
          onClick={() => addEvidenceField("contradicting")}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          + Add more
        </button>
      </div>
    </div>
  );

  const renderStep6 = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-gray-600 mb-2">
        <div className="p-2 bg-amber-100 rounded-lg">
          <Sparkles className="w-5 h-5 text-amber-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">Create a balanced thought</h3>
          <p className="text-sm text-gray-500">A more realistic perspective</p>
        </div>
      </div>
      <Textarea
        placeholder="e.g., While I might feel nervous, I've handled similar situations before and learned from them..."
        value={balancedThought}
        onChange={(e) => setBalancedThought(e.target.value)}
        rows={4}
        className="resize-none"
      />

      {/* Outcome emotion */}
      <div>
        <label className="text-sm font-medium text-gray-600 mb-2 block">
          How do you feel now? (optional)
        </label>
        <div className="flex flex-wrap gap-2">
          {["Better", "Calmer", "Hopeful", "Same", "Neutral"].map((emotion) => (
            <button
              key={emotion}
              onClick={() => setOutcomeEmotion({ name: emotion, intensity: 3 })}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm border transition-all",
                outcomeEmotion?.name === emotion
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              )}
            >
              {emotion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn("p-4 rounded-xl bg-white border border-gray-200 shadow-sm relative", className)}>
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Progress indicator */}
      <div className="flex gap-1 mb-4">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className={cn(
              "flex-1 h-1 rounded-full transition-colors",
              s.num <= step ? "bg-purple-500" : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Step title */}
      <p className="text-xs text-purple-600 font-medium mb-4">
        Step {step} of 6: {STEPS[step - 1].title}
      </p>

      {/* Step content */}
      <div className="min-h-[300px]">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
        {step === 6 && renderStep6()}
      </div>

      {/* Navigation */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
        {step > 1 && (
          <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        )}
        {step < 6 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={!canProceed()}
            className="flex-1"
          >
            {step === 4 || step === 5 ? "Skip" : "Continue"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="flex-1">
            {loading ? "Saving..." : "Complete Entry"}
          </Button>
        )}
      </div>
    </div>
  );
}
