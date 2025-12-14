"use client";

import { ArrowRight, Bot, Paperclip, User } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { Textarea } from "~/components/ui/textarea";
import { useAutoResizeTextarea } from "../../hooks/use-auto-resize-textarea";
import { cn } from "~/lib/utils";
import { useChatbot } from "~/contexts/ChatbotContext";

export default function AI_Prompt() {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 72,
    maxHeight: 300,
  });
  const { messages, sendMessage, loading } = useChatbot();
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const handleSend = async () => {
    if (!value.trim() || loading) return;
    const messageToSend = value.trim();
    setValue("");
    adjustHeight(true);
    await sendMessage(messageToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      {/* Zone des messages - GARDE VOTRE STRUCTURE */}
      <div 
        className="overflow-y-auto px-4 py-3 space-y-3" 
        style={{ height: 'calc(100% - 180px)' }}
      >
        {messages.map((msg, idx) => (
          <div
            key={msg.id || idx}
            className={cn(
              "flex gap-2 animate-in fade-in-0 slide-in-from-bottom-2 duration-300",
              msg.role === "user" ? "justify-end" : "justify-start"
            )}
          >
            {/* Avatar assistant à gauche */}
            {msg.role === "assistant" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}

            {/* Bulle de message */}
            <div
              className={cn(
                "max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm",
                msg.role === "user"
                  ? "bg-blue-500 text-white rounded-tr-md"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-tl-md"
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium opacity-70">
                  {msg.role === "user" ? "Vous" : "Assistant"}
                </span>
                <span className="text-xs opacity-50">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {msg.content}
              </div>
            </div>

            {/* Avatar user à droite */}
            {msg.role === "user" && (
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {/* Indicateur de chargement */}
        {loading && (
          <div className="flex gap-2 justify-start animate-in fade-in-0">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-md px-4 py-3 border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce"></div>
                <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="h-2 w-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Zone de saisie - EXACTEMENT VOTRE CODE ORIGINAL */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="rounded-2xl bg-black/5 p-1.5 dark:bg-white/5">
          <div className="relative">
            <div className="relative flex flex-col">
              <Textarea
                className={cn(
                  "w-full resize-none rounded-xl rounded-b-none border-none bg-black/5 px-4 py-3 placeholder:text-black/70 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-white/5 dark:text-white dark:placeholder:text-white/70",
                  "min-h-[72px]",
                  loading && "opacity-50 cursor-not-allowed"
                )}
                id="ai-input-15"
                onChange={(e) => {
                  setValue(e.target.value);
                  adjustHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={loading ? "L'assistant répond..." : "Posez votre question..."}
                ref={textareaRef}
                value={value}
                disabled={loading}
              />
              
              <div className="flex h-14 items-center rounded-b-xl bg-black/5 dark:bg-white/5">
                <div className="absolute right-3 bottom-3 left-3 flex w-[calc(100%-24px)] items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="mx-0.5 h-4 w-px bg-black/10 dark:bg-white/10" />
                    <label
                      aria-label="Attach file"
                      className={cn(
                        "cursor-pointer rounded-lg bg-black/5 p-2 dark:bg-white/5",
                        "hover:bg-black/10 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 dark:hover:bg-white/10",
                        "text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors",
                        loading && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <input className="hidden" type="file" disabled={loading} />
                      <Paperclip className="h-4 w-4 transition-colors" />
                    </label>
                  </div>
                  <button
                    aria-label="Send message"
                    className={cn(
                      "rounded-lg p-2 transition-all duration-200",
                      value.trim() && !loading
                        ? "bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/30 hover:scale-105"
                        : "bg-black/5 dark:bg-white/5 text-black/30 dark:text-white/30 cursor-not-allowed"
                    )}
                    onClick={handleSend}
                    disabled={!value.trim() || loading}
                    type="button"
                  >
                    {loading ? (
                      <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <ArrowRight className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}