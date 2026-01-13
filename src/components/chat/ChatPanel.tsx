import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatStore } from "@/stores/chatStore";
import { useAuthStore } from "@/stores/authStore";
import { ChatMessage } from "./ChatMessage";
import nutritionIcon from "@/assets/nutritionist-avatar.webp";

export function ChatPanel() {
  const {
    isOpen,
    closeChat,
    messages,
    isLoading,
    sendMessage,
    fetchHistory,
    clearChat,
  } = useChatStore();
  const { user } = useAuthStore();

  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch history when panel opens
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchHistory();
    }
  }, [isOpen, user?._id, fetchHistory]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue("");

    await sendMessage(message, {
      currentScreen: window.location.pathname,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeChat()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader 
          className="border-b px-4 py-3"
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.75rem)' }}
        >
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <span className="text-xl">Nutrition Assistant</span>
            </SheetTitle>
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => clearChat()}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                title="Clear chat"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            Ask me about nutrition, meals, or fitness
          </p>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea
          className="flex-1 px-4"
          ref={scrollRef as React.RefObject<HTMLDivElement>}
        >
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <div>
                <img
                  src={nutritionIcon}
                  alt="Chat Icon"
                  className="w-36 h-auto"
                />
              </div>
              <h3 className="mb-2 font-medium text-gray-900">
                Hi! I'm your nutrition assistant
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Ask me anything about your meal plan, nutrition tips, or how to
                reach your health goals. I can also suggest changes to your
                meals and workouts.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {[
                  "What should I eat today?",
                  "Help me hit my protein goal",
                  "Suggest a healthy snack",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => {
                      setInputValue(suggestion);
                      inputRef.current?.focus();
                    }}
                    className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="py-4">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
              {isLoading && (
                <div className="flex items-center gap-2 py-3 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
