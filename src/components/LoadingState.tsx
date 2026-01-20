import { cn } from '@/lib/utils';

interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
    return (
        <div className={cn("animate-pulse rounded-md bg-slate-200", className)} />
    );
}

export function DashboardSkeleton() {
    return (
        <div className="p-8 space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <Skeleton className="w-12 h-12 rounded-lg" />
                            <Skeleton className="w-10 h-4 rounded" />
                        </div>
                        <Skeleton className="w-24 h-4 mb-2 rounded" />
                        <Skeleton className="w-32 h-8 rounded" />
                    </div>
                ))}
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Vouchers */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-10 h-10 rounded-lg" />
                                    <div className="space-y-2">
                                        <Skeleton className="w-24 h-4" />
                                        <Skeleton className="w-16 h-3" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Skeleton className="w-20 h-4" />
                                    <Skeleton className="w-16 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Insights */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm h-[400px]">
                    <div className="flex justify-between items-center mb-6">
                        <Skeleton className="w-32 h-6" />
                        <Skeleton className="w-20 h-4" />
                    </div>
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="w-3/4 h-4" />
                                    <Skeleton className="w-full h-3" />
                                    <Skeleton className="w-1/2 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
