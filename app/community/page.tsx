"use client";

import CreatePost from "@/components/community/CreatePost";
import Feed from "@/components/community/Feed";
import { motion } from "@/lib/motion";
import {
    FireIcon,
    HashtagIcon,
    InformationCircleIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
    ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const trendingTopics = [
    { topic: "SantaMariaFiesta2025", posts: "1.2k", trend: "+24%" },
    { topic: "TrafficUpdate", posts: "856", trend: "+12%" },
    { topic: "BarangayPoblacion", posts: "420", trend: "+8%" },
    { topic: "NewPublicMarket", posts: "300", trend: "+5%" },
];

export default function CommunityPage() {
    return (
        <div className="w-full px-4 lg:px-8 py-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Feed Area */}
                <div className="xl:col-span-3 space-y-6">
                    <CreatePost />
                    <Feed />
                </div>

                {/* Right Sidebar (Desktop Only) */}
                <aside className="hidden xl:block space-y-6 sticky top-24 h-fit">
                    {/* Trending Topics */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.1 }}
                    >
                        <Card className={cn(
                            "relative overflow-hidden",
                            "bg-gradient-to-br from-card/80 to-card/60",
                            "backdrop-blur-xl border-border/50 shadow-lg"
                        )}>
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500" />

                            <CardHeader className="pb-3 border-b border-border/30">
                                <CardTitle className="text-base font-semibold flex items-center gap-2">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-md shadow-orange-500/20">
                                        <FireIcon className="w-4 h-4 text-white" />
                                    </div>
                                    Trending in Santa Maria
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-4 space-y-1">
                                {trendingTopics.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className={cn(
                                            "group flex items-center justify-between p-3 rounded-xl cursor-pointer",
                                            "hover:bg-gradient-to-r hover:from-orange-500/10 hover:to-pink-500/10",
                                            "transition-all duration-200"
                                        )}
                                        whileHover={{ x: 4 }}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2 + i * 0.1 }}
                                    >
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-foreground group-hover:text-orange-500 transition-colors flex items-center gap-1.5">
                                                <HashtagIcon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-orange-500/70 transition-colors" />
                                                {item.topic}
                                            </span>
                                            <span className="text-xs text-muted-foreground pl-5">
                                                {item.posts} posts
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium text-green-500 flex items-center gap-0.5">
                                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                                {item.trend}
                                            </span>
                                            <ChevronRightIcon className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-muted-foreground hover:text-orange-500 mt-2 rounded-xl"
                                    >
                                        View all topics
                                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Guidelines / Info */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: 0.3 }}
                    >
                        <Card className={cn(
                            "relative overflow-hidden",
                            "bg-gradient-to-br from-blue-500/5 to-indigo-500/5",
                            "backdrop-blur-xl border-blue-500/20 shadow-lg"
                        )}>
                            {/* Gradient accent */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                    <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-md shadow-blue-500/20">
                                        <ShieldCheckIcon className="w-4 h-4 text-white" />
                                    </div>
                                    Community Guidelines
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {[
                                    "Be respectful to fellow citizens",
                                    "Verify before sharing—no fake news",
                                    "Keep topics relevant to Santa Maria"
                                ].map((rule, i) => (
                                    <motion.div
                                        key={i}
                                        className="flex items-start gap-2 text-xs text-muted-foreground"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 + i * 0.1 }}
                                    >
                                        <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="leading-relaxed pt-0.5">{rule}</span>
                                    </motion.div>
                                ))}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full text-blue-500 hover:text-blue-600 hover:bg-blue-500/10 mt-2 rounded-xl font-medium"
                                    >
                                        Read full guidelines
                                        <ChevronRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </motion.div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </aside>
            </div>
        </div>
    );
}
