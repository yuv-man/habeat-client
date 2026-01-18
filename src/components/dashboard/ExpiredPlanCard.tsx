import { CalendarDays, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ExpiredPlanCardProps {
  expiredDate?: string | null;
  className?: string;
}

export function ExpiredPlanCard({
  expiredDate,
  className,
}: ExpiredPlanCardProps) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen flex items-center justify-center flex-col gap-6 p-6 ${className || ""}`}>
      <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full">
        <CalendarDays className="w-8 h-8 text-amber-600" />
      </div>
      <div className="text-center">
        <p className="text-xl font-semibold text-gray-800">
          Your meal plan has expired
        </p>
        {expiredDate && (
          <p className="text-gray-500 mt-2">
            Your previous plan ended on {expiredDate}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          Generate a new plan to continue tracking your meals
        </p>
      </div>
      <Button
        onClick={() => navigate("/weekly-overview")}
        className="flex items-center gap-2 bg-green-500 text-white hover:bg-green-600"
        size="lg"
      >
        <Sparkles className="h-5 w-5" />
        <span>Generate New Plan</span>
      </Button>
    </div>
  );
}
