import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/stores/chatStore";
import { cn } from "@/lib/utils";

export function ChatButton() {
  const { toggleChat, hasPendingAction, isOpen } = useChatStore();

  return (
    <Button
      onClick={toggleChat}
      className={cn(
        "fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full shadow-lg",
        "bg-emerald-600 hover:bg-emerald-700",
        "md:bottom-6",
        isOpen && "bg-emerald-700"
      )}
      size="icon"
      aria-label="Open nutrition chat"
    >
      <MessageCircle className="h-6 w-6" />
      {hasPendingAction && (
        <span className="absolute -right-1 -top-1 flex h-4 w-4">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-4 w-4 rounded-full bg-amber-500" />
        </span>
      )}
    </Button>
  );
}
