import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
    onRefresh: () => Promise<void>;
    children: React.ReactNode;
    className?: string;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, className }) => {
    const [startY, setStartY] = useState<number | null>(null);
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const PULL_THRESHOLD = 80;
    const MAX_PULL_DISTANCE = 120;

    const handleTouchStart = (e: React.TouchEvent) => {
        // Only enable pull-to-refresh if we are at the top of the page
        if (window.scrollY === 0 && !isRefreshing) {
            setStartY(e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startY === null || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        // Only allow pulling down
        if (diff > 0) {
            // Add resistance as we pull further
            const dampedDiff = Math.min(diff * 0.5, MAX_PULL_DISTANCE);
            setPullDistance(dampedDiff);

            // Prevent default scrolling behavior if we are pulling
            if (e.cancelable && window.scrollY === 0) {
                // We don't prevent default here to allow scrolling if the user changes direction,
                // but in a real native-feel implementation we might need more complex logic.
                // For web, we rely on the condition that scrollY is 0.
            }
        }
    };

    const handleTouchEnd = async () => {
        if (startY === null || isRefreshing) return;

        if (pullDistance >= PULL_THRESHOLD) {
            setIsRefreshing(true);
            setPullDistance(PULL_THRESHOLD); // Snap to threshold
            try {
                await onRefresh();
            } finally {
                setIsRefreshing(false);
                setPullDistance(0);
            }
        } else {
            setPullDistance(0); // Snap back
        }

        setStartY(null);
    };

    return (
        <div
            className={cn("relative min-h-screen", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Refresh Indicator */}
            <div
                className="absolute left-0 right-0 flex justify-center items-center pointer-events-none z-10"
                style={{
                    top: -40, // Start hidden above
                    transform: `translateY(${pullDistance}px)`,
                    transition: isRefreshing ? 'transform 0.2s' : 'none',
                    opacity: pullDistance > 0 ? 1 : 0
                }}
            >
                <div className="bg-background/80 backdrop-blur-sm rounded-full p-2 shadow-md border border-border">
                    <Loader2
                        className={cn(
                            "w-5 h-5 text-primary",
                            (isRefreshing || pullDistance > PULL_THRESHOLD) && "animate-spin"
                        )}
                        style={{
                            transform: !isRefreshing ? `rotate(${pullDistance * 2}deg)` : undefined
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div
                ref={contentRef}
                style={{
                    transform: `translateY(${pullDistance}px)`,
                    transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease-out' : 'none'
                }}
            >
                {children}
            </div>
        </div>
    );
};

export default PullToRefresh;
