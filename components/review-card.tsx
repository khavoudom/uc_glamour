'use client';

import type { Review } from '@/lib/types';

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const formattedDate = new Date(review.date + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="border-b border-border pb-4 mb-4 last:border-b-0 last:mb-0 last:pb-0">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[13px] font-medium text-text">{review.reviewerName}</span>
        {review.isVerified && (
          <span className="text-[10px] text-success bg-success-lt px-2 py-[1px] rounded-full">
            Verified Purchase
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-gold text-xs">
          {'★'.repeat(review.rating)}
          {'☆'.repeat(5 - review.rating)}
        </span>
        <span className="text-[11px] text-muted">{formattedDate}</span>
      </div>

      <p className="text-[13px] text-text leading-[1.6] m-0">{review.body}</p>

      {review.helpful + review.notHelpful > 0 && (
        <div className="flex items-center gap-3 mt-2 text-[11px] text-muted">
          {review.helpful > 0 && <span>{review.helpful} found helpful</span>}
          {review.notHelpful > 0 && <span>{review.notHelpful} found not helpful</span>}
        </div>
      )}
    </div>
  );
}
