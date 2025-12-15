"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "@/lib/motion";
import {
    HeartIcon,
    ChatBubbleLeftIcon,
    ShareIcon,
    EllipsisHorizontalIcon,
    BookmarkIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid } from "@heroicons/react/24/solid";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OptimizedImage from "@/components/OptimizedImage";
import { cn } from "@/lib/utils";

export interface CommunityPost {
    id: string;
    author: {
        name: string;
        avatar?: string;
        role?: string;
    };
    content: string;
    image?: string;
    likes: number;
    comments: number;
    createdAt: string;
    isLiked?: boolean;
}

export default function PostCard({ post }: { post: CommunityPost }) {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [isSaved, setIsSaved] = useState(false);
    const [likes, setLikes] = useState(post.likes);
    const [isLikeAnimating, setIsLikeAnimating] = useState(false);

    const handleLike = () => {
        setIsLikeAnimating(true);
        if (isLiked) {
            setLikes((prev) => prev - 1);
        } else {
            setLikes((prev) => prev + 1);
        }
        setIsLiked(!isLiked);
        setTimeout(() => setIsLikeAnimating(false), 300);
    };

    const initials = post.author.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();

    const isAdmin = post.author.role === "admin";

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={{ y: -2 }}
        >
            <Card className={cn(
                "group relative overflow-hidden transition-all duration-300",
                "bg-gradient-to-br from-card/80 to-card/60",
                "backdrop-blur-xl border-border/50",
                "hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20",
                "hover:border-border",
                isAdmin && "ring-1 ring-blue-500/20"
            )}>
                {/* Admin gradient accent */}
                {isAdmin && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                )}

                <CardContent className="p-0">
                    {/* Header */}
                    <div className="p-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <motion.div
                                className={cn(
                                    "w-11 h-11 rounded-full flex items-center justify-center font-bold shadow-md overflow-hidden relative",
                                    isAdmin
                                        ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 text-white ring-2 ring-blue-500/30"
                                        : "bg-gradient-to-br from-slate-600 to-slate-700 text-white"
                                )}
                                whileHover={{ scale: 1.05 }}
                            >
                                {post.author.avatar ? (
                                    <OptimizedImage
                                        src={post.author.avatar}
                                        alt={post.author.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-sm">{initials}</span>
                                )}
                            </motion.div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-foreground text-sm">
                                        {post.author.name}
                                    </h3>
                                    {isAdmin && (
                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold shadow-sm">
                                            Official
                                        </span>
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {post.createdAt}
                                </span>
                            </div>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground -mr-2 h-8 w-8"
                        >
                            <EllipsisHorizontalIcon className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="px-4 pb-4">
                        <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-[15px]">
                            {post.content}
                        </p>
                    </div>

                    {/* Image Attachment */}
                    {post.image && (
                        <motion.div
                            className="w-full aspect-video relative bg-muted/50 overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                            transition={{ duration: 0.3 }}
                        >
                            <OptimizedImage
                                src={post.image}
                                alt="Post attachment"
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                enableHover={false}
                            />
                        </motion.div>
                    )}

                    {/* Actions Bar */}
                    <div className="p-3 flex items-center justify-between border-t border-border/30 bg-muted/10">
                        <div className="flex items-center gap-1">
                            {/* Like Button with Animation */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className={cn(
                                        "gap-2 rounded-xl transition-all duration-200",
                                        isLiked
                                            ? "text-rose-500 bg-rose-500/10 hover:bg-rose-500/20 hover:text-rose-600"
                                            : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                                    )}
                                    onClick={handleLike}
                                >
                                    <AnimatePresence mode="wait">
                                        <motion.div
                                            key={isLiked ? "liked" : "unliked"}
                                            initial={{ scale: 0.5 }}
                                            animate={{
                                                scale: isLikeAnimating ? [1, 1.3, 1] : 1,
                                            }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            {isLiked ? (
                                                <HeartIconSolid className="w-5 h-5" />
                                            ) : (
                                                <HeartIcon className="w-5 h-5" />
                                            )}
                                        </motion.div>
                                    </AnimatePresence>
                                    <span className="text-xs font-medium">{likes}</span>
                                </Button>
                            </motion.div>

                            {/* Comment Button */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded-xl"
                                >
                                    <ChatBubbleLeftIcon className="w-5 h-5" />
                                    <span className="text-xs font-medium">{post.comments}</span>
                                </Button>
                            </motion.div>
                        </div>

                        <div className="flex items-center gap-1">
                            {/* Save Button */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className={cn(
                                        "h-8 w-8 rounded-xl transition-all",
                                        isSaved
                                            ? "text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                            : "text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                                    )}
                                    onClick={() => setIsSaved(!isSaved)}
                                >
                                    {isSaved ? (
                                        <BookmarkIconSolid className="w-5 h-5" />
                                    ) : (
                                        <BookmarkIcon className="w-5 h-5" />
                                    )}
                                </Button>
                            </motion.div>

                            {/* Share Button */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-green-500 hover:bg-green-500/10 h-8 w-8 rounded-xl"
                                >
                                    <ShareIcon className="w-5 h-5" />
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
