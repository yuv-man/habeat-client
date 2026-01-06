import { Check, X, Utensils, Dumbbell, Cookie, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useChatStore, ChatProposedAction } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

interface ChatActionCardProps {
  action: ChatProposedAction;
  messageId: string;
}

export function ChatActionCard({ action, messageId }: ChatActionCardProps) {
  const { acceptAction, rejectAction, isLoading } = useChatStore();
  const isPending = action.status === "pending";

  const getActionIcon = () => {
    switch (action.type) {
      case "meal_swap":
        return <Utensils className="h-4 w-4" />;
      case "workout_change":
        return <Dumbbell className="h-4 w-4" />;
      case "add_snack":
        return <Cookie className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getActionTitle = () => {
    switch (action.type) {
      case "meal_swap":
        return "Meal Swap Suggestion";
      case "workout_change":
        const workoutAction = (action.payload as Record<string, unknown>)?.action;
        if (workoutAction === "add") return "Add Workout";
        if (workoutAction === "remove") return "Remove Workout";
        return "Update Workout";
      case "add_snack":
        return "Add Snack Suggestion";
      default:
        return "Suggestion";
    }
  };

  const getActionDetails = () => {
    const payload = action.payload as Record<string, unknown>;

    switch (action.type) {
      case "meal_swap": {
        const currentMeal = payload.currentMeal as { name: string; calories: number } | undefined;
        const proposedMeal = payload.proposedMeal as { name: string; calories: number } | undefined;
        return (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 line-through">
              {currentMeal?.name || "Current meal"}
            </span>
            <ArrowRight className="h-3 w-3 text-gray-400" />
            <span className="font-medium text-emerald-600">
              {proposedMeal?.name || "New meal"}
            </span>
            {proposedMeal?.calories && (
              <span className="text-xs text-gray-400">
                ({proposedMeal.calories} kcal)
              </span>
            )}
          </div>
        );
      }

      case "workout_change": {
        const workoutAction = payload.action as string;
        const proposedWorkout = payload.proposedWorkout as {
          name: string;
          duration: number;
          caloriesBurned: number;
        } | undefined;
        const currentWorkout = payload.currentWorkout as { name: string } | undefined;

        if (workoutAction === "add" && proposedWorkout) {
          return (
            <div className="text-sm">
              <span className="font-medium text-emerald-600">
                {proposedWorkout.name}
              </span>
              <span className="text-gray-500">
                {" "}
                - {proposedWorkout.duration} min, {proposedWorkout.caloriesBurned} kcal
              </span>
            </div>
          );
        }

        if (workoutAction === "remove" && currentWorkout) {
          return (
            <div className="text-sm">
              <span className="text-gray-500 line-through">
                {currentWorkout.name}
              </span>
            </div>
          );
        }

        return null;
      }

      case "add_snack": {
        const proposedSnack = payload.proposedSnack as {
          name: string;
          calories: number;
        } | undefined;
        return (
          <div className="text-sm">
            <span className="font-medium text-emerald-600">
              {proposedSnack?.name || "Snack"}
            </span>
            {proposedSnack?.calories && (
              <span className="text-gray-500"> ({proposedSnack.calories} kcal)</span>
            )}
          </div>
        );
      }

      default:
        return null;
    }
  };

  const getReason = () => {
    const payload = action.payload as Record<string, unknown>;
    return payload.reason as string | undefined;
  };

  const getStatusBadge = () => {
    if (action.status === "accepted") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
          <Check className="h-3 w-3" />
          Applied
        </span>
      );
    }
    if (action.status === "rejected") {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
          <X className="h-3 w-3" />
          Declined
        </span>
      );
    }
    return null;
  };

  return (
    <Card className="mt-2 w-full max-w-sm border-emerald-200 bg-emerald-50/50">
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 text-emerald-700">
            {getActionIcon()}
            <span className="text-sm font-medium">{getActionTitle()}</span>
          </div>
          {!isPending && getStatusBadge()}
        </div>

        <div className="mt-2">{getActionDetails()}</div>

        {getReason() && (
          <p className="mt-2 text-xs text-gray-500 italic">
            {getReason()}
          </p>
        )}
      </CardContent>

      {isPending && (
        <CardFooter className="flex gap-2 border-t border-emerald-100 p-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => rejectAction(messageId)}
            disabled={isLoading}
            className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            <X className="mr-1 h-3 w-3" />
            Decline
          </Button>
          <Button
            size="sm"
            onClick={() => acceptAction(messageId)}
            disabled={isLoading}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
          >
            <Check className="mr-1 h-3 w-3" />
            Apply
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
