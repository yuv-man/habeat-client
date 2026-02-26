import { useEffect, useState } from "react";
import { BookOpen, Plus, ChevronDown, ChevronUp, Calendar, Brain, Scale, Sparkles, AlertTriangle } from "lucide-react";
import { useCBTStore, useThoughtEntries } from "@/stores/cbtStore";
import { IThoughtEntry, CognitiveDistortionType } from "@/types/interfaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThoughtEntryForm } from "./ThoughtEntryForm";
import { COGNITIVE_DISTORTIONS } from "./DistortionSelector";

interface ThoughtJournalProps {
  className?: string;
  limit?: number;
  showAddButton?: boolean;
}

const formatDate = (dateStr: string, timeStr?: string) => {
  const date = new Date(dateStr);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  return timeStr ? `${formattedDate} at ${timeStr}` : formattedDate;
};

const getDistortionName = (type: CognitiveDistortionType): string => {
  return COGNITIVE_DISTORTIONS.find((d) => d.type === type)?.name || type;
};

function ThoughtEntryCard({ entry }: { entry: IThoughtEntry }) {
  const [expanded, setExpanded] = useState(false);

  const emotionsSummary = entry.emotions
    .sort((a, b) => b.intensity - a.intensity)
    .slice(0, 3)
    .map((e) => e.name)
    .join(", ");

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-sm transition-shadow">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 text-left"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
              <Calendar className="w-3 h-3" />
              {formatDate(entry.date, entry.time)}
              {entry.isEmotionalEating && (
                <span className="px-1.5 py-0.5 bg-orange-100 text-orange-600 rounded text-xs">
                  Emotional Eating
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-gray-800 line-clamp-2">
              {entry.situation}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Felt: {emotionsSummary}
            </p>
          </div>
          <div className={cn(
            "p-1 text-gray-400 transition-transform",
            expanded && "rotate-180"
          )}>
            <ChevronDown className="w-5 h-5" />
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4 animate-in slide-in-from-top-2">
          {/* Automatic thought */}
          <div>
            <div className="flex items-center gap-2 text-xs text-purple-600 font-medium mb-1">
              <Brain className="w-3 h-3" />
              Automatic Thought
            </div>
            <p className="text-sm text-gray-700 bg-purple-50 rounded-lg p-3 italic">
              "{entry.automaticThought}"
            </p>
          </div>

          {/* Emotions with intensity */}
          <div>
            <div className="flex items-center gap-2 text-xs text-red-500 font-medium mb-2">
              Emotions
            </div>
            <div className="flex flex-wrap gap-2">
              {entry.emotions.map((emotion, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs"
                >
                  {emotion.name}
                  <span className="px-1 bg-red-200 rounded text-red-800 font-medium">
                    {emotion.intensity}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Cognitive distortions */}
          {entry.cognitiveDistortions && entry.cognitiveDistortions.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-xs text-amber-600 font-medium mb-2">
                <AlertTriangle className="w-3 h-3" />
                Thinking Patterns Identified
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.cognitiveDistortions.map((distortion, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs"
                  >
                    {getDistortionName(distortion)}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Evidence */}
          {entry.evidence && (entry.evidence.supporting.length > 0 || entry.evidence.contradicting.length > 0) && (
            <div>
              <div className="flex items-center gap-2 text-xs text-green-600 font-medium mb-2">
                <Scale className="w-3 h-3" />
                Evidence Examined
              </div>
              <div className="grid grid-cols-2 gap-3">
                {entry.evidence.supporting.length > 0 && (
                  <div className="bg-red-50 rounded-lg p-2">
                    <p className="text-xs text-red-600 font-medium mb-1">Supporting:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {entry.evidence.supporting.map((e, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-red-400">-</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {entry.evidence.contradicting.length > 0 && (
                  <div className="bg-green-50 rounded-lg p-2">
                    <p className="text-xs text-green-600 font-medium mb-1">Against:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {entry.evidence.contradicting.map((e, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-green-400">-</span>
                          {e}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Balanced thought */}
          {entry.balancedThought && (
            <div>
              <div className="flex items-center gap-2 text-xs text-blue-600 font-medium mb-1">
                <Sparkles className="w-3 h-3" />
                Balanced Perspective
              </div>
              <p className="text-sm text-gray-700 bg-blue-50 rounded-lg p-3">
                {entry.balancedThought}
              </p>
            </div>
          )}

          {/* Outcome emotion */}
          {entry.outcomeEmotion && (
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2 border-t border-gray-100">
              <span>After reflection:</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">
                {entry.outcomeEmotion.name}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ThoughtJournal({
  className,
  limit = 10,
  showAddButton = true,
}: ThoughtJournalProps) {
  const { fetchThoughts, loading } = useCBTStore();
  const thoughtEntries = useThoughtEntries();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchThoughts(limit);
  }, [fetchThoughts, limit]);

  const displayedEntries = thoughtEntries.slice(0, limit);

  if (showForm) {
    return (
      <div className={className}>
        <ThoughtEntryForm
          onComplete={() => {
            setShowForm(false);
            fetchThoughts(limit);
          }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-800">Thought Journal</h3>
        </div>
        {showAddButton && (
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            New Entry
          </Button>
        )}
      </div>

      {/* Loading state */}
      {loading && displayedEntries.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Loading entries...
        </div>
      )}

      {/* Empty state */}
      {!loading && displayedEntries.length === 0 && (
        <div className="text-center py-8 bg-gray-50 rounded-xl">
          <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-2">No thought entries yet</p>
          <p className="text-sm text-gray-400 mb-4">
            Record your thoughts to identify patterns and reframe negative thinking
          </p>
          {showAddButton && (
            <Button variant="outline" onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Create First Entry
            </Button>
          )}
        </div>
      )}

      {/* Entries list */}
      {displayedEntries.length > 0 && (
        <div className="space-y-3">
          {displayedEntries.map((entry) => (
            <ThoughtEntryCard key={entry._id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
