"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

export default function MariBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "👋 Hello! I'm MariBot, your friendly Santa Maria Municipality assistant! How can I help you today?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessageToGemini = async (userMessage: string): Promise<string> => {
    try {
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

      if (!apiKey) {
        return "I apologize, but I'm currently unable to connect to my knowledge base. Please contact the municipality directly for assistance.";
      }

      // Build conversation history for context
      // Filter out the welcome message and only include actual conversation
      const conversationHistory = messages
        .filter((msg) => msg.id !== "welcome")
        .map((msg) => ({
          role: msg.sender === "user" ? "user" : "model",
          parts: [{ text: msg.text }],
        }));

      // Add system instruction as the first message if this is the start of conversation
      const systemPrompt = {
        role: "user",
        parts: [
          {
            text: `You are MariBot, the friendly and witty virtual assistant for Santa Maria Municipality. You help citizens with municipal services, announcements, community information, and general inquiries about the municipality. 

Your personality:
- Friendly, helpful, and professional
- Witty but respectful
- Knowledgeable about municipal services
- Always prioritize citizen service
- Remember previous parts of the conversation and maintain context

Please provide helpful, concise responses (2-3 sentences maximum) in a friendly tone. If you don't know something specific about Santa Maria Municipality, politely suggest they contact the municipal office directly.`,
          },
        ],
      };

      const systemResponse = {
        role: "model",
        parts: [
          {
            text: "Understood! I'm MariBot, your friendly Santa Maria Municipality assistant. I'll help you with any questions about municipal services, keeping our conversation friendly and contextual. How can I assist you today?",
          },
        ],
      };

      // Build the full context: system prompt + history + new message
      const contents =
        conversationHistory.length === 0
          ? [
              systemPrompt,
              systemResponse,
              {
                role: "user",
                parts: [{ text: userMessage }],
              },
            ]
          : [
              systemPrompt,
              systemResponse,
              ...conversationHistory,
              {
                role: "user",
                parts: [{ text: userMessage }],
              },
            ];

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 200,
              topP: 0.95,
              topK: 40,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Gemini API Error:", errorData);
        throw new Error("Failed to get response from Gemini");
      }

      const data = await response.json();
      const botResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "I'm having trouble understanding that. Could you rephrase your question?";

      return botResponse;
    } catch (error) {
      console.error("Error calling Gemini API:", error);
      return "Oops! I seem to be having a moment. Please try again or contact our office directly for immediate assistance.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Get response from Gemini
    const botResponseText = await sendMessageToGemini(inputValue);

    setIsTyping(false);

    const botMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: botResponseText,
      sender: "bot",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, botMessage]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, duration: 0.3, ease: "easeOut" }}
      >
        <AnimatePresence mode="wait">
          {!isOpen && (
            <motion.div
              key="chat-button"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Button
                size="icon-lg"
                className="h-16 w-16 rounded-full shadow-2xl bg-primary hover:bg-primary-dark transition-all relative group"
                onClick={() => setIsOpen(true)}
                aria-label="Open MariBot chat"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <ChatBubbleLeftRightIcon className="w-7 h-7" />
                </motion.div>
                {/* Pulse effect */}
                <span className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-6 right-6 z-50 w-[420px] max-w-[calc(100vw-3rem)]"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <Card className="overflow-hidden flex flex-col h-[650px] max-h-[calc(100vh-6rem)] shadow-2xl border-2 p-0 gap-0">
              {/* Header with gradient */}
              <div className="bg-gradient-to-r from-primary via-primary to-primary-dark text-primary-foreground p-5 flex items-center justify-between border-b border-primary-foreground/10">
                <div className="flex items-center gap-3">
                  <motion.div
                    className="relative"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="w-12 h-12 rounded-full bg-primary-foreground/20 backdrop-blur-sm flex items-center justify-center ring-2 ring-primary-foreground/30">
                      <SparklesIcon className="w-6 h-6" />
                    </div>
                    <motion.div
                      className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-secondary rounded-full border-2 border-primary"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-lg tracking-tight">
                      MariBot
                    </h3>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-1.5 py-0 h-4 bg-secondary/20 text-primary-foreground border-primary-foreground/20"
                      >
                        AI Assistant
                      </Badge>
                      <span className="text-xs text-primary-foreground/70">
                        • Online
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  className="text-primary-foreground hover:bg-primary-foreground/20 rounded-lg"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close chat"
                >
                  <XMarkIcon className="w-5 h-5" />
                </Button>
              </div>

              {/* Messages Container with custom scrollbar */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-muted/30 backdrop-blur-sm scroll-smooth [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb:hover]:bg-muted-foreground/30">
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeOut",
                      delay: index === messages.length - 1 ? 0.1 : 0,
                    }}
                    className={cn(
                      "flex gap-2",
                      message.sender === "user"
                        ? "justify-end"
                        : "justify-start"
                    )}
                  >
                    {message.sender === "bot" && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                        <SparklesIcon className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-3 shadow-md backdrop-blur-sm transition-all",
                        message.sender === "user"
                          ? "bg-primary text-primary-foreground rounded-br-md border border-primary-dark/20"
                          : "bg-card text-card-foreground border-2 border-border rounded-bl-md"
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                      <p
                        className={cn(
                          "text-xs mt-1.5 font-medium",
                          message.sender === "user"
                            ? "text-primary-foreground/60"
                            : "text-muted-foreground"
                        )}
                      >
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </motion.div>
                  </motion.div>
                ))}

                {/* Enhanced Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-2 justify-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <SparklesIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="bg-card border-2 border-border rounded-2xl rounded-bl-md px-5 py-4 shadow-md backdrop-blur-sm">
                      <div className="flex gap-1.5">
                        {[0, 0.15, 0.3].map((delay, i) => (
                          <motion.div
                            key={i}
                            className="w-2.5 h-2.5 bg-primary rounded-full"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 1, 0.5],
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: delay,
                              ease: "easeInOut",
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              <Separator />

              {/* Enhanced Input Area */}
              <div className="p-4 bg-background/50 backdrop-blur-sm">
                <div className="flex gap-2 items-end">
                  <div className="flex-1 relative">
                    <Input
                      ref={inputRef}
                      type="text"
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      disabled={isTyping}
                      className="pr-12 h-11 rounded-xl border-2 focus-visible:ring-2 transition-all"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5 bg-muted/50"
                      >
                        Enter
                      </Badge>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="h-11 w-11 rounded-xl shadow-lg hover:shadow-xl transition-all"
                    aria-label="Send message"
                  >
                    <PaperAirplaneIcon className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <SparklesIcon className="w-3 h-3 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-medium">
                    Powered by{" "}
                    <span className="text-primary font-semibold">
                      Gemini 2.0 Flash
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
