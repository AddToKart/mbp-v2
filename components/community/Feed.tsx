"use client";

import { useState, useEffect } from "react";
import PostCard, { CommunityPost } from "./PostCard";
import { Skeleton } from "@/components/ui/skeleton";

// Mock Data
const MOCK_POSTS: CommunityPost[] = [
    {
        id: "1",
        author: {
            name: "Maria Cruz",
            role: "citizen",
        },
        content: "Just finished visiting the new Santa Maria public market. It looks amazing! Great job to the LGU for this improvement. #SantaMariaProgress",
        image: "https://images.unsplash.com/photo-1577401239170-897941296695?q=80&w=1000&auto=format&fit=crop",
        likes: 42,
        comments: 12,
        createdAt: "2 hours ago",
        isLiked: true,
    },
    {
        id: "2",
        author: {
            name: "Juan Dela Cruz",
            role: "citizen",
        },
        content: "Looking for recommendations: Where is the best place to get Pancit Malabon here in Santa Maria? Planning for a small family gathering this weekend.",
        likes: 15,
        comments: 24,
        createdAt: "4 hours ago",
        isLiked: false,
    },
    {
        id: "3",
        author: {
            name: "Barangay San Gabriel Updates",
            role: "admin", // Simulating an official/admin post
            avatar: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=1000&auto=format&fit=crop",
        },
        content: "ANNOUNCEMENT: Free Rabies Vaccination scheduled for tomorrow, December 17, at the Barangay Hall. Please bring your pets early. 8:00 AM to 3:00 PM.",
        image: "https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?q=80&w=1000&auto=format&fit=crop",
        likes: 156,
        comments: 8,
        createdAt: "5 hours ago",
        isLiked: false,
    },
    {
        id: "4",
        author: {
            name: "Elena Santos",
            role: "citizen",
        },
        content: "Beautiful sunset view from the Santa Maria bridge today. Adding this one to my collection!",
        image: "https://images.unsplash.com/photo-1472214103451-9374bd1c7dd1?q=80&w=1000&auto=format&fit=crop",
        likes: 89,
        comments: 5,
        createdAt: "1 day ago",
        isLiked: true,
    }
];

export default function Feed() {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate API fetch delay
        const timer = setTimeout(() => {
            setPosts(MOCK_POSTS);
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-4">
                        <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        </div>
                        <Skeleton className="h-24 w-full rounded-xl" />
                        <Skeleton className="h-8 w-full rounded-lg" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6 pb-20">
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
        </div>
    );
}
