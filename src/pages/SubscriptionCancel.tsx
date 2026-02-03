import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";

const SubscriptionCancel = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-md text-center">
          <XCircle className="mx-auto mb-4 h-16 w-16 text-orange-500" />
          <h1 className="mb-2 text-2xl font-bold">Subscription Cancelled</h1>
          <p className="mb-6 text-muted-foreground">
            You cancelled the subscription process. You can try again anytime.
          </p>
          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/subscription")} size="lg">
              View Plans
            </Button>
            <Button
              onClick={() => navigate("/daily-tracker")}
              variant="outline"
              size="lg"
            >
              Go to Dashboard
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default SubscriptionCancel;
