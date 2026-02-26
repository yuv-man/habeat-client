import { useState } from "react";
import { Info, Check, ChevronDown, ChevronUp } from "lucide-react";
import { CognitiveDistortionType, ICognitiveDistortion } from "@/types/interfaces";
import { cn } from "@/lib/utils";

interface DistortionSelectorProps {
  selected: CognitiveDistortionType[];
  onSelectionChange: (distortions: CognitiveDistortionType[]) => void;
  className?: string;
}

export const COGNITIVE_DISTORTIONS: ICognitiveDistortion[] = [
  {
    type: "all_or_nothing",
    name: "All-or-Nothing Thinking",
    description: "Seeing things in black and white, with no middle ground",
    example: "If I don't do this perfectly, I'm a total failure.",
    reframeQuestion: "Is there a middle ground I'm missing?",
  },
  {
    type: "overgeneralization",
    name: "Overgeneralization",
    description: "Making broad conclusions from a single event",
    example: "I failed once, so I'll always fail.",
    reframeQuestion: "Am I basing this on one experience?",
  },
  {
    type: "mental_filter",
    name: "Mental Filter",
    description: "Focusing only on negative details while ignoring positives",
    example: "I got one criticism, so my whole presentation was bad.",
    reframeQuestion: "What positives am I overlooking?",
  },
  {
    type: "disqualifying_positive",
    name: "Disqualifying the Positive",
    description: "Dismissing positive experiences as if they don't count",
    example: "They only said that to be nice.",
    reframeQuestion: "Why am I discounting this good thing?",
  },
  {
    type: "jumping_to_conclusions",
    name: "Jumping to Conclusions",
    description: "Making negative interpretations without evidence",
    example: "They haven't texted back - they must be angry at me.",
    reframeQuestion: "What evidence do I actually have?",
  },
  {
    type: "magnification",
    name: "Magnification/Minimization",
    description: "Blowing things out of proportion or shrinking their importance",
    example: "This mistake is going to ruin everything!",
    reframeQuestion: "Am I making this bigger or smaller than it is?",
  },
  {
    type: "emotional_reasoning",
    name: "Emotional Reasoning",
    description: "Assuming feelings reflect reality",
    example: "I feel anxious, so something bad must be about to happen.",
    reframeQuestion: "Are my feelings facts, or just feelings?",
  },
  {
    type: "should_statements",
    name: "Should Statements",
    description: "Having rigid rules about how things should be",
    example: "I should always be productive.",
    reframeQuestion: "Is this a rule I chose, or one I inherited?",
  },
  {
    type: "labeling",
    name: "Labeling",
    description: "Attaching a negative label to yourself or others",
    example: "I'm such an idiot.",
    reframeQuestion: "Am I describing a behavior or a person?",
  },
  {
    type: "personalization",
    name: "Personalization",
    description: "Taking excessive responsibility for external events",
    example: "It's my fault they're in a bad mood.",
    reframeQuestion: "What factors are actually outside my control?",
  },
];

export function DistortionSelector({
  selected,
  onSelectionChange,
  className,
}: DistortionSelectorProps) {
  const [expanded, setExpanded] = useState<CognitiveDistortionType | null>(null);

  const toggleDistortion = (type: CognitiveDistortionType) => {
    if (selected.includes(type)) {
      onSelectionChange(selected.filter((d) => d !== type));
    } else {
      onSelectionChange([...selected, type]);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">Thinking Patterns</h4>
        <span className="text-xs text-gray-500">{selected.length} selected</span>
      </div>
      <p className="text-xs text-gray-500 mb-3">
        Tap to select any patterns you notice in your thinking
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {COGNITIVE_DISTORTIONS.map((distortion) => {
          const isSelected = selected.includes(distortion.type);
          const isExpanded = expanded === distortion.type;

          return (
            <div
              key={distortion.type}
              className={cn(
                "rounded-xl border transition-all",
                isSelected
                  ? "border-purple-300 bg-purple-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => toggleDistortion(distortion.type)}
              >
                <div
                  className={cn(
                    "w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                    isSelected
                      ? "border-purple-500 bg-purple-500"
                      : "border-gray-300"
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn(
                    "text-sm font-medium",
                    isSelected ? "text-purple-700" : "text-gray-700"
                  )}>
                    {distortion.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{distortion.description}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpanded(isExpanded ? null : distortion.type);
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="px-3 pb-3 space-y-2 border-t border-gray-100 pt-2 animate-in slide-in-from-top-1">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-500 mb-1">Example:</p>
                    <p className="text-sm text-gray-700 italic">"{distortion.example}"</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-2">
                    <p className="text-xs text-purple-600 mb-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Question to ask yourself:
                    </p>
                    <p className="text-sm text-purple-700 font-medium">{distortion.reframeQuestion}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
