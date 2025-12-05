import { Skeleton } from "@/components/ui/skeleton";

export function BlogGridSkeleton() {
    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-background">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12 space-y-4">
                    <Skeleton className="h-10 w-64 mx-auto" />
                    <Skeleton className="h-6 w-96 mx-auto" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-full border border-border rounded-xl overflow-hidden bg-card">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-6 space-y-4">
                                <Skeleton className="h-8 w-3/4" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-2/3" />
                                <div className="pt-4 flex justify-between items-center">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-5 w-5 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
