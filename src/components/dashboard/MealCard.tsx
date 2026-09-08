import { useState, memo } from "react";
import {
  Heart,
  Check,
  BookOpen,
  RefreshCw,
  Clock,
  Flame,
  ChevronUp,
  ChevronDown,
  Brain,
  Pencil,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { IMeal } from "@/types/interfaces";
import { useProgressStore } from "@/stores/progressStore";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { getMealImageVite } from "@/lib/mealImageHelper";
import ChangeMealModal from "@/components/modals/ChangeMealModal";
import TiredButton from "@/components/dashboard/TiredButton";
import { formatMealName } from "@/lib/formatters";
import HealthIcon from "@/assets/icons/healthy.svg";
import {
  calculateMealHealthScore,
  getHealthScoreColor,
} from "@/lib/nutritionHelpers";
import { MealCheckIn } from "@/components/cbt/MealCheckIn";
import { useShowMacros } from "@/hooks/useShowMacros";
import {
  MealSlot,
  MissReason,
  PatternEventOf,
  usePatternStore,
} from "@/stores/patternStore";
import MissedMealPanel, { MISSED_ACTION_CLASS } from "./MissedMealPanel";
import { LATE_NIGHT_HOUR } from "@/lib/mindfulEating";
import { toLocalDateString, formatTime12Hour } from "@/lib/dateUtils";

type MealStatus = "past" | "current" | "future" | "missed";

interface MealCardProps {
  meal: IMeal;
  mealType: string;
  mealTime: string;
  date: string; // Date in YYYY-MM-DD format for API calls
  snackIndex?: number; // Index of snack (for snacks only)
  onMealChange?: (newMeal: IMeal) => void;
  onViewRecipe?: () => void;
  isSnack?: boolean;
  mealStatus?: MealStatus; // Status: past, current, future, or missed
  /** Called when the user says a missed meal was skipped, with their reason.
   *  Owned by the screen because the reason belongs on today's reflection, and
   *  the card has no business knowing about mood entries. */
  onMealMissed?: (mealType: MealSlot, reason: MissReason | null) => void;
  /** Opens this snack's mood check-in expanded. Decided by the screen, which is
   *  the only place that can see the whole list — a card acting alone would
   *  have every unfinished snack spring open at once on a late evening. */
  promptMoodCheck?: boolean;
}

const MealCard = ({
  meal,
  mealType,
  mealTime,
  date,
  snackIndex,
  onMealChange,
  onViewRecipe,
  isSnack = false,
  mealStatus = "current",
  onMealMissed,
  promptMoodCheck = false,
}: MealCardProps) => {
  const navigate = useNavigate();
  const displayName = formatMealName(meal.name);
  const { user, updateFavorite } = useAuthStore();
  const { completeMeal, todayProgress, setMealEatenTime } = useProgressStore();
  const showMacros = useShowMacros();
  const recordPattern = usePatternStore((state) => state.record);
  const isLateNight = new Date().getHours() >= LATE_NIGHT_HOUR;

  /** Whether this meal has already been marked skipped today, so the panel can
   *  resume where the user left it instead of starting the question over. */
  const priorMissAnswer = usePatternStore((state) =>
    state.events.find(
      (e): e is PatternEventOf<"missed-meal"> =>
        e.kind === "missed-meal" &&
        e.mealType === mealType &&
        e.date === toLocalDateString(date)
    )
  );
  // Auto-expand if current meal (but never for snacks), otherwise start collapsed
  const [isExpanded, setIsExpanded] = useState(
    !isSnack && mealStatus === "current",
  );
  // State to track if title is expanded (to show full text)
  const [isTitleExpanded, setIsTitleExpanded] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  /** The Mood button's answer, when the user has given one: `null` means the
   *  card is still following its own default. Marking a meal done opens the
   *  check-in on its own, but the button stays available either way — a meal
   *  you already ticked off is still a meal you might want to reflect on. */
  const [checkInOverride, setCheckInOverride] = useState<boolean | null>(null);
  /** Set when the user marks the meal done *here*, so the check-in opens at
   *  the moment it's relevant rather than on every card already ticked off
   *  when the screen loaded. */
  const [justCompleted, setJustCompleted] = useState(false);
  /** Non-null while the user is correcting the time this meal was eaten. */
  const [timeDraft, setTimeDraft] = useState<string | null>(null);
  const [isSavingTime, setIsSavingTime] = useState(false);

  // Get meal ID with fallback for compatibility
  const mealId = meal._id || (meal as any).id || "";

  // Manual meals have a synthetic ID — they can't be favorited (no DB record)
  const isManualMeal = mealId.startsWith("manual-");

  // Check if meal is in user.favoriteMeals array
  const isFavorite = user?.favoriteMeals?.includes(mealId) || false;
  const isCompleted = meal.done || false;

  /** Which half of the meal the check-in asks about, and whether it's showing.
   *  Both phases are the same component; only the questions differ. */
  const checkInPhase: "before" | "after" = isCompleted ? "after" : "before";
  const isCheckInOpen = checkInOverride ?? justCompleted;

  // Calculate health score
  const healthScore = calculateMealHealthScore(meal);
  const healthScoreStyle = getHealthScoreColor(healthScore);

  const handleFavorite = async () => {
    if (user?._id && mealId) {
      const wasAlreadyFavorite = isFavorite;
      try {
        await updateFavorite(user._id, mealId, !wasAlreadyFavorite);

        if (wasAlreadyFavorite) {
          toast.success("Removed from favorites", {
            duration: 2000,
          });
        } else {
          toast.success("❤️ Added to favorites!", {
            duration: 2000,
          });
        }
      } catch (error) {
        toast.error("Failed to update favorite");
      }
    }
  };

  const handleComplete = async () => {
    if (user?._id && todayProgress && mealId) {
      const date = todayProgress.date;
      setIsCompleting(true);
      try {
        await completeMeal(user._id, date, mealType, mealId);

        // Opening the check-in is the point of ticking the box; un-ticking
        // should take it back down rather than leave it hanging.
        setJustCompleted(!isCompleted);
        setCheckInOverride(null);

        // Only on the way *in* — un-ticking a snack shouldn't file a second
        // late-night episode. The hour is read at completion time, which is
        // when the user is telling us they ate it.
        if (isSnack && !isCompleted && isLateNight) {
          recordPattern({
            kind: "late-snack",
            date: toLocalDateString(new Date()),
            hour: new Date().getHours(),
          });
        }

        // Success animation duration
        setTimeout(() => {
          setIsCompleting(false);
        }, 600);
      } catch (error) {
        // Error handling is done in the store with rollback
        setIsCompleting(false);
        toast.error("Failed to update meal. Please try again.");
      }
    }
  };

  /**
   * When this meal was actually eaten, as "HH:MM", or null if we don't know.
   *
   * `completedAt` is stamped by the tick, so on a meal ticked hours late it is
   * the logging time rather than the eating time. The user can correct it, and
   * `completedAtSource` says which of the two this is.
   */
  const eatenTime = meal.completedAt
    ? (() => {
        const at = new Date(meal.completedAt);
        return isNaN(at.getTime())
          ? null
          : `${String(at.getHours()).padStart(2, "0")}:${String(
              at.getMinutes(),
            ).padStart(2, "0")}`;
      })()
    : null;

  /** Only a meal the user has ticked has an eating time to correct. */
  const canEditTime = isCompleted && Boolean(user?._id && mealId);

  const startEditingTime = () => {
    // Seed with what we have: the recorded time, else the planned slot time,
    // else now — so the picker never opens on 00:00.
    const now = new Date();
    setTimeDraft(
      eatenTime ??
        `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes(),
        ).padStart(2, "0")}`,
    );
  };

  const saveEatenTime = async () => {
    if (!timeDraft || !user?._id) return;
    setIsSavingTime(true);
    try {
      await setMealEatenTime(
        user._id,
        toLocalDateString(date),
        mealType,
        mealId,
        timeDraft,
      );
      setTimeDraft(null);
      toast.success(`Logged as eaten at ${formatTime12Hour(timeDraft)}`);
    } catch {
      // The store already rolled the optimistic change back.
      toast.error("Couldn't save that time. Please try again.");
    } finally {
      setIsSavingTime(false);
    }
  };

  /**
   * The time line on the card: the planned slot time until the meal is ticked,
   * then the time it was actually eaten, editable in place.
   */
  const renderTime = (size: "sm" | "md") => {
    const iconClass = size === "sm" ? "w-3 h-3" : "w-4 h-4";

    if (timeDraft !== null) {
      return (
        <div
          className="flex items-center gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="time"
            value={timeDraft}
            onChange={(e) => setTimeDraft(e.target.value)}
            className="border border-gray-300 rounded-md px-1.5 py-0.5 text-xs text-gray-700 bg-white"
            aria-label="Time you ate this meal"
            autoFocus
          />
          <button
            onClick={saveEatenTime}
            disabled={isSavingTime || !timeDraft}
            className="p-1 rounded-md bg-green-500 text-white disabled:opacity-50"
            aria-label="Save time"
          >
            <Check className="w-3 h-3" />
          </button>
          <button
            onClick={() => setTimeDraft(null)}
            disabled={isSavingTime}
            className="p-1 rounded-md bg-gray-100 text-gray-500"
            aria-label="Cancel"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (!canEditTime) {
      return (
        <div className="flex items-center gap-1">
          <Clock className={iconClass} />
          <span>{mealTime}</span>
        </div>
      );
    }

    const eatenLabel = eatenTime ? formatTime12Hour(eatenTime) : null;

    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            startEditingTime();
          }}
          className="flex items-center gap-1 hover:text-gray-700 transition-colors"
          aria-label="Change the time you ate this meal"
        >
          <Clock className={iconClass} />
          <span>{eatenLabel ? `ate at ${eatenLabel}` : mealTime}</span>
          <Pencil className="w-2.5 h-2.5 opacity-60" />
        </button>
        {/* Keeps the plan visible next to what actually happened — the gap
            between the two is the thing worth noticing. */}
        {eatenLabel && eatenLabel !== mealTime && (
          <span className="text-[10px] text-gray-300">planned {mealTime}</span>
        )}
      </div>
    );
  };

  const handleViewRecipe = () => {
    if (onViewRecipe) {
      onViewRecipe();
    } else {
      // Navigate to recipe detail page if available
      navigate(`/recipes/${mealId}`);
    }
  };

  const handleMealChange = (newMeal: IMeal) => {
    if (onMealChange) {
      onMealChange(newMeal);
      toast.success(`Meal changed to ${formatMealName(newMeal.name)}`, {
        duration: 2000,
      });
    }
  };

  // Determine card styling based on status
  // Snacks can NEVER be current - override mealStatus for snacks
  const isPast = mealStatus === "past";
  const isCurrent = !isSnack && mealStatus === "current";
  // A missed meal is explicitly *not* `isPast`: swapping and marking it done
  // both still make sense, and those actions are gated on `isPast`.
  const isMissed = !isSnack && mealStatus === "missed";

  // Card classes based on status - make cards bigger
  const cardClasses = isMissed
    ? // Full opacity on purpose. Fading a missed meal is what made it invisible
      // in the first place; it needs to read as open, not concluded.
      "bg-white border border-amber-200 border-s-4 border-s-amber-400 rounded-lg p-4 shadow-sm"
    : isPast
      ? "bg-gray-50 border border-gray-200 rounded-lg p-3 shadow-sm opacity-75"
      : isCurrent
        ? "bg-white border-2 border-green-200 rounded-lg pl-2 p-5 shadow-md"
        : "bg-white border border-gray-200 rounded-lg p-4 shadow-sm opacity-90";

  if (isSnack) {
    // Simple snack card - no fold, no recipe, compact vertical size
    return (
      <div className={cardClasses}>
        <div className="flex items-center justify-between gap-2 mb-0">
          <div className="flex-1 min-w-0">
            <h3
              onClick={() => setIsTitleExpanded(!isTitleExpanded)}
              className={`font-medium break-words cursor-pointer transition-colors hover:text-gray-900 ${
                isTitleExpanded ? "" : "line-clamp-2"
              } ${
                isPast
                  ? "text-gray-500 text-xs"
                  : isCurrent
                    ? "text-gray-900 text-sm"
                    : "text-gray-700 text-xs"
              }`}
              title={
                isTitleExpanded
                  ? "Click to collapse"
                  : "Click to see full title"
              }
            >
              {displayName}
            </h3>
            <div
              className={`flex items-center gap-2 mt-0.5 ${
                isPast
                  ? "text-xs text-gray-400"
                  : isCurrent
                    ? "text-xs text-gray-600"
                    : "text-xs text-gray-500"
              }`}
            >
              {renderTime("sm")}
              {showMacros && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span>{meal.calories} kcal</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons - Only Favorite and Swap for snacks */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleFavorite}
              disabled={isManualMeal}
              className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label={
                isManualMeal ? "Cannot favorite a manually-entered meal" : isFavorite ? "Remove from favorites" : "Add to favorites"
              }
            >
              <Heart
                className={`w-4 h-4 ${
                  isFavorite
                    ? "fill-red-500 text-red-500"
                    : "text-gray-400 stroke-2"
                }`}
              />
            </button>

            <ChangeMealModal
              currentMeal={meal}
              mealType={mealType}
              date={date}
              snackIndex={isSnack ? snackIndex : undefined}
              onMealChange={handleMealChange}
            >
              <button
                className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Swap snack"
              >
                <RefreshCw className="w-4 h-4 text-gray-400 stroke-2" />
              </button>
            </ChangeMealModal>

            <button
              onClick={handleComplete}
              disabled={isCompleting}
              className={`p-1.5 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                isCompleted
                  ? "bg-gradient-to-br from-emerald-400 to-teal-500 scale-110 shadow-sm"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              aria-label={
                isCompleted ? "Mark as incomplete" : "Mark as complete"
              }
            >
              <Check
                className={`w-3.5 h-3.5 transition-all duration-200 ${
                  isCompleted
                    ? "text-white stroke-[3]"
                    : "text-gray-400 stroke-2"
                }`}
              />
            </button>
          </div>
        </div>

        {/* The 9pm snack is the single episode the emotional-eating model cares
            most about, so it gets the check-in before it happens as well as
            after. Before eating it stays collapsed unless the hour itself is
            the reason to ask. */}
        {mealId &&
          (isCompleted ? (
            <MealCheckIn
              className="mt-3"
              mealId={mealId}
              mealType="snacks"
              mealName={displayName}
              date={date}
              phase="after"
              // Collapsible so that logging it leaves a re-openable line
              // rather than a hole, and so a snack already ticked off when the
              // screen loaded doesn't reopen a question it has answered.
              collapsible
              defaultOpen={justCompleted}
            />
          ) : (
            <MealCheckIn
              className="mt-3"
              mealId={mealId}
              mealType="snacks"
              mealName={displayName}
              date={date}
              phase="before"
              collapsible
              defaultOpen={promptMoodCheck}
            />
          ))}
      </div>
    );
  }

  return (
    <div className={`${cardClasses} relative`}>
      {/* Meal Info Section */}
      <div className={`flex items-start gap-3`}>
        {/* Meal Image - Make bigger */}
        <img
          src={getMealImageVite(meal.nameEn || meal.name, meal.icon)}
          alt={displayName}
          className={`rounded-lg object-cover flex-shrink-0 ${
            isPast ? "w-16 h-16" : isCurrent ? "w-20 h-20" : "w-[72px] h-[72px]"
          }`}
        />

        {/* Meal Details */}
        <div className="flex-1 min-w-0">
          <h3
            onClick={() => setIsTitleExpanded(!isTitleExpanded)}
            className={`font-bold break-words cursor-pointer transition-colors hover:text-gray-900 mb-1 ${
              isTitleExpanded ? "" : "line-clamp-2"
            } ${
              isPast
                ? "text-gray-500 text-sm"
                : isCurrent
                  ? "text-gray-900 text-base"
                  : "text-gray-700 text-sm"
            }`}
            title={
              isTitleExpanded ? "Click to collapse" : "Click to see full title"
            }
          >
            {displayName}
          </h3>
          <div
            className={`flex items-center gap-2 ${
              isPast
                ? "text-xs text-gray-400"
                : isCurrent
                  ? "text-sm text-gray-600"
                  : "text-xs text-gray-500"
            }`}
          >
            {renderTime("md")}
            {showMacros && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{meal.calories} kcal</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons - Always Visible */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Favorite Button */}
          <button
            onClick={handleFavorite}
            disabled={isManualMeal}
            className="p-2.5 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={
              isManualMeal ? "Cannot favorite a manually-entered meal" : isFavorite ? "Remove from favorites" : "Add to favorites"
            }
          >
            <Heart
              className={`w-4 h-4 transition-all duration-200 ${
                isFavorite
                  ? "fill-red-500 text-red-500"
                  : "text-gray-400 stroke-2"
              }`}
            />
          </button>

          {/* Done Button */}
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className={`p-2 rounded-full transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
              isCompleted
                ? "bg-gradient-to-br from-emerald-400 to-teal-500 scale-110 shadow-sm"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
          >
            <Check
              className={`w-4 h-4 transition-all duration-200 ${
                isCompleted ? "text-white stroke-[3]" : "text-gray-400 stroke-2"
              }`}
            />
          </button>
        </div>

        {/* Chevron Button - Right side of card, fixed position */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute top-14 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600 z-10"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          {isExpanded ? (
            <ChevronUp className="w-6 h-6" />
          ) : (
            <ChevronDown className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sits outside the expandable section deliberately — a recovery prompt
          hidden behind a chevron is a recovery prompt nobody sees. */}
      {isMissed && (
        <MissedMealPanel
          className="mt-3"
          mealLabel={mealType.charAt(0).toUpperCase() + mealType.slice(1)}
          hasAnswered={Boolean(priorMissAnswer)}
          answeredReason={priorMissAnswer?.reason ?? null}
          logSomethingElseSlot={
            <ChangeMealModal
              currentMeal={meal}
              mealType={mealType}
              date={date}
              onMealChange={handleMealChange}
              quickMode
            >
              <div className={MISSED_ACTION_CLASS}>I ate something else</div>
            </ChangeMealModal>
          }
          onSkipped={(reason) =>
            onMealMissed?.(mealType as MealSlot, reason)
          }
        />
      )}

      {/* Expandable Section */}
      {isExpanded && (
        <div className="border-t border-gray-200 pt-4 mt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
          {/* Prep Time and Health Score - Compact Row */}
          <div className="flex items-center gap-2">
            {/* Prep Time */}
            {!isSnack && meal.prepTime > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                  Prep time: {meal.prepTime}m
                </span>
              </div>
            )}
            {/* Health Score */}
            <div
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border ${healthScoreStyle.bg} ${healthScoreStyle.border}`}
            >
              <img
                src={HealthIcon}
                alt="Health score"
                className="w-4 h-4 flex-shrink-0"
              />
              <span
                className={`text-xs font-semibold ${healthScoreStyle.text} whitespace-nowrap`}
              >
                Health Score: {healthScore}
              </span>
            </div>
          </div>
          {/* Nutrition Details */}
          <div className="space-y-3">
            {showMacros && meal.macros && (
              <div className="flex items-center gap-4 text-sm text-gray-600 justify-center">
                <span>Protein: {meal.macros.protein}g</span>
                <span>•</span>
                <span>Carbs: {meal.macros.carbs}g</span>
                <span>•</span>
                <span>Fat: {meal.macros.fat}g</span>
              </div>
            )}
          </div>

          {/* Action Buttons - Inside Expand */}
          <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
            {/* Done Button and Swap Button - Same Line */}
            {!isPast && (
              <div className="flex items-center gap-3">
                {/* Bold Done Button */}
                <button
                  onClick={handleComplete}
                  className={`flex-1 px-4 py-3 rounded-lg transition-all duration-300 font-bold text-base flex items-center justify-center gap-2 relative overflow-hidden ${
                    isCompleting && !isCompleted
                      ? "bg-habeat text-white shadow-lg"
                      : isCompleted
                        ? 
                         "bg-habeat-light hover:bg-habeat/10 text-habeat border border-habeat/20"
                        :"bg-habeat hover:bg-habeat-hover text-white shadow-md"
                  }`}
                  aria-label={
                    isCompleted ? "Mark as incomplete" : "Mark as complete"
                  }
                  disabled={isCompleting}
                >
                  {isCompleting && !isCompleted && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-habeat/40 to-transparent animate-shimmer" />
                  )}
                  <Check
                    className={`w-5 h-5 transition-all duration-300 ${
                      isCompleted || isCompleting ? "stroke-[3]" : "stroke-2"
                    }`}
                  />
                  <span className="relative z-10">
                    {isCompleting && !isCompleted
                      ? "Completing..."
                      : isCompleted
                        ? "Completed"
                        : "Mark as Done"}
                  </span>
                </button>
                {/* I'm Tired Button - Quick meal swap */}
                {!isSnack && (
                  <TiredButton
                    meal={meal}
                    mealType={mealType as "breakfast" | "lunch" | "dinner"}
                    date={date}
                    onMealChange={handleMealChange}
                  />
                )}
              </div>
            )}

            {/* The check-in, in whichever phase the meal is in. Inline and not
                a modal: this used to open a three-step wizard over the whole
                screen to ask what one tap here answers. Keyed on the phase so
                ticking the box swaps the questions instead of carrying the
                pre-meal answers into the post-meal ones. */}
            {isCheckInOpen && mealId && (
              <MealCheckIn
                key={checkInPhase}
                mealId={mealId}
                mealType={mealType as MealSlot}
                mealName={displayName}
                date={date}
                phase={checkInPhase}
                // Put it away once it's answered; the Mood button below brings
                // it back if the user wants to change something.
                onLogged={() => {
                  setJustCompleted(false);
                  setCheckInOverride(false);
                }}
              />
            )}

            {/* Other Action Buttons */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleViewRecipe}
                className="flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors group"
                aria-label="View recipe"
              >
                <div className="p-2 rounded-full bg-gray-100 group-hover:bg-emerald-100 transition-colors">
                  <BookOpen className="w-3.5 h-3.5 stroke-2" />
                </div>
                <span className="text-xs font-medium">Recipe</span>
              </button>

              {!isPast && (
                <ChangeMealModal
                  currentMeal={meal}
                  mealType={mealType}
                  date={date}
                  snackIndex={isSnack ? snackIndex : undefined}
                  onMealChange={handleMealChange}
                >
                  <button
                    className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors group"
                    aria-label="Swap meal"
                  >
                    <div className="p-2 rounded-full bg-gray-100 group-hover:bg-blue-100 transition-colors">
                      <RefreshCw className="w-3.5 h-3.5 stroke-2" />
                    </div>
                    <span className="text-xs font-medium">Swap</span>
                  </button>
                </ChangeMealModal>
              )}

              {/* Mood button — always available, before the meal and after it.
                  It toggles the panel above rather than opening a modal. */}
              <button
                onClick={() => setCheckInOverride(!isCheckInOpen)}
                aria-expanded={isCheckInOpen}
                className={`flex items-center gap-1.5 transition-colors group ${
                  isCheckInOpen
                    ? "text-purple-600"
                    : "text-gray-600 hover:text-purple-600"
                }`}
                aria-label={
                  isCompleted
                    ? "Check in on how the meal went"
                    : "Check in on how you feel before this meal"
                }
              >
                <div
                  className={`p-2 rounded-full transition-colors ${
                    isCheckInOpen
                      ? "bg-purple-100"
                      : "bg-gray-100 group-hover:bg-purple-100"
                  }`}
                >
                  <Brain className="w-3.5 h-3.5 stroke-2" />
                </div>
                <span className="text-xs font-medium">Mood</span>
              </button>
            </div>

            {/* Quick log shortcut */}
            {!isCompleted && (
              <ChangeMealModal
                currentMeal={meal}
                mealType={mealType}
                date={date}
                snackIndex={isSnack ? snackIndex : undefined}
                onMealChange={handleMealChange}
                quickMode
              >
                <button className="w-full text-center text-xs text-gray-400 hover:text-gray-600 transition py-1">
                  Ate something else?
                </button>
              </ChangeMealModal>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MealCard);
