"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
    PhotoIcon,
    FaceSmileIcon,
    PaperAirplaneIcon,
    SparklesIcon,
    MapPinIcon,
} from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

export default function CreatePost() {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);
    const [content, setContent] = useState("");

    const initials = user?.name
        ? user.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase()
        : "ME";

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement post creation
        console.log("Posting:", content);
        setContent("");
        setIsExpanded(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <Card className={cn(
                "relative overflow-hidden mb-6 transition-all duration-300",
                "bg-gradient-to-br from-card/80 to-card/60",
                "backdrop-blur-xl border-border/50 shadow-lg",
                isExpanded && "ring-2 ring-primary/20 shadow-primary/10"
            )}>
                {/* Animated gradient border on focus */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 -z-10 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10"
                        />
                    )}
                </AnimatePresence>

                <div className="p-5">
                    <div className="flex gap-4">
                        {/* Animated avatar */}
                        <motion.div
                            className={cn(
                                "w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center",
                                "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500",
                                "text-white font-bold shadow-lg shadow-purple-500/25",
                                "ring-2 ring-white/20"
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {initials}
                        </motion.div>

                        <div className="flex-1">
                            <form onSubmit={handleSubmit} className="relative">
                                {/* Enhanced textarea */}
                                <div className="relative">
                                    <textarea
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        onFocus={() => setIsExpanded(true)}
                                        placeholder={`Share something with your community, ${user?.name?.split(" ")[0] || "Citizen"}...`}
                                        className={cn(
                                            "w-full bg-muted/40 hover:bg-muted/60 rounded-2xl px-5 py-4",
                                            "text-sm focus:outline-none transition-all resize-none",
                                            "border border-border/30 focus:border-primary/30",
                                            "placeholder:text-muted-foreground/60",
                                            isExpanded ? "h-32" : "h-14 overflow-hidden"
                                        )}
                                    />

                                    {/* Character hint */}
                                    {isExpanded && content.length > 0 && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="absolute bottom-3 right-4 text-xs text-muted-foreground"
                                        >
                                            {content.length} characters
                                        </motion.span>
                                    )}
                                </div>

                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                            animate={{ opacity: 1, height: "auto", y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -10 }}
                                            transition={{ duration: 0.25, ease: "easeOut" }}
                                        >
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
                                                {/* Action buttons with icons */}
                                                <div className="flex gap-1">
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded-xl gap-2"
                                                        >
                                                            <PhotoIcon className="w-5 h-5" />
                                                            <span className="hidden sm:inline">Photo</span>
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl gap-2"
                                                        >
                                                            <FaceSmileIcon className="w-5 h-5" />
                                                            <span className="hidden sm:inline">Feeling</span>
                                                        </Button>
                                                    </motion.div>
                                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl gap-2"
                                                        >
                                                            <MapPinIcon className="w-5 h-5" />
                                                            <span className="hidden sm:inline">Location</span>
                                                        </Button>
                                                    </motion.div>
                                                </div>

                                                {/* Post button with gradient */}
                                                <motion.div
                                                    whileHover={{ scale: 1.03 }}
                                                    whileTap={{ scale: 0.97 }}
                                                >
                                                    <Button
                                                        type="submit"
                                                        disabled={!content.trim()}
                                                        className={cn(
                                                            "rounded-xl px-6 font-semibold gap-2",
                                                            "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
                                                            "hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600",
                                                            "shadow-lg shadow-purple-500/25 border-0",
                                                            "disabled:opacity-50 disabled:shadow-none"
                                                        )}
                                                    >
                                                        <SparklesIcon className="w-4 h-4" />
                                                        Post
                                                        <PaperAirplaneIcon className="w-4 h-4" />
                                                    </Button>
                                                </motion.div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </div>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
