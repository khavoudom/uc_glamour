'use client';

import type { ReviewStats } from '@/lib/types';

interface ReviewSummaryProps {
  stats: ReviewStats | null;
  loading: boolean;
  error: boolean;
}

export default function ReviewSummary({ stats, loading, error }: ReviewSummaryProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-6 mb-5">
        <div className="w-20 h-20 rounded-full bg-border animate-pulse" />
        <div className="flex-1 space-y-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="h-2 bg-border rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-[13px] text-danger mb-4">
        Could not load reviews. Please try again later.
      </p>
    );
  }

  if (!stats || stats.total === 0) {
    return (
      <div className="text-center py-4 mb-4">
        <p className="text-[13px] text-muted">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-6 mb-5">
      <div className="text-center shrink-0">
        <div className="text-[32px] font-semibold text-text leading-none">{stats.average}</div>
        <div className="text-gold text-sm mt-1">
          {'★'.repeat(Math.floor(stats.average))}
          {stats.average % 1 >= 0.5 ? '½' : ''}
        </div>
        <div className="text-[11px] text-muted mt-1">
          {stats.total} review{stats.total !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = stats.distribution[star] ?? 0;
          const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
          return (
            <div key={star} className="flex items-center gap-2 text-xs">
              <span className="text-text w-3 text-right">{star}</span>
              <span className="text-gold">★</span>
              <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-muted w-5 text-right">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
