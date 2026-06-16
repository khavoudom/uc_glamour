'use client';

import { useActionState, useState } from 'react';
import { createReviewAction, type CreateReviewState } from '@/app/actions/reviews';

interface ReviewFormProps {
  productId: number;
  orderId: number;
  onSuccess?: () => void;
}

const INITIAL_STATE: CreateReviewState = undefined;

export default function ReviewForm({ productId, orderId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  async function wrappedAction(prevState: CreateReviewState, formData: FormData): Promise<CreateReviewState> {
    formData.set('rating', String(rating));
    const result = await createReviewAction(prevState, formData);
    if (result?.success && onSuccess) {
      onSuccess();
    }
    return result;
  }

  const [state, formAction, pending] = useActionState(wrappedAction, INITIAL_STATE);

  return (
    <form action={formAction} className="border border-border rounded-lg p-4 bg-bg">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="orderId" value={orderId} />

      <div className="mb-3">
        <label className="text-[12px] font-medium text-text block mb-1.5">Your Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="bg-none border-none cursor-pointer p-0 text-[20px] leading-none"
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              <span className={star <= (hoveredStar || rating) ? 'text-gold' : 'text-border'}>
                ★
              </span>
            </button>
          ))}
        </div>
        {state?.errors?.rating && (
          <p className="text-[11px] text-danger mt-1">{state.errors.rating[0]}</p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="review-body" className="text-[12px] font-medium text-text block mb-1.5">
          Your Review
        </label>
        <textarea
          id="review-body"
          name="body"
          rows={3}
          maxLength={2000}
          placeholder="Share your experience with this product..."
          className="w-full resize-none rounded-lg border border-border-md bg-white p-3 text-[13px] text-text outline-none focus:border-pink"
          disabled={pending}
        />
        <div className="flex justify-between mt-1">
          {state?.errors?.body && (
            <p className="text-[11px] text-danger">{state.errors.body[0]}</p>
          )}
          {state?.message && !state.success && (
            <p className="text-[11px] text-danger">{state.message}</p>
          )}
          {state?.success && (
            <p className="text-[11px] text-success">{state.message}</p>
          )}
        </div>
      </div>

      {!state?.success && (
        <button
          type="submit"
          disabled={pending || rating === 0}
          className="bg-pink text-white border-none rounded-[20px] px-5 py-2 text-[12px] font-medium tracking-[0.5px] uppercase cursor-pointer font-sans disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Submitting...' : 'Submit Review'}
        </button>
      )}
    </form>
  );
}
