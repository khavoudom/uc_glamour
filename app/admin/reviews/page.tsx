import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllReviews } from '@/lib/data-access/reviews';
import ReviewToggleButton from './review-toggle-button';
import ReviewDeleteButton from './review-delete-button';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage() {
  await verifyAdminSession();
  const allReviews = await getAllReviews();

  return (
    <div>
      <div className="mb-6 flex items-center">
        <h1 className="font-heading text-2xl font-medium text-text">Reviews</h1>
      </div>

      {allReviews.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No reviews yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Product</Th>
                <Th align="left">Reviewer</Th>
                <Th align="left">Rating</Th>
                <Th align="left">Date</Th>
                <Th align="left">Body</Th>
                <Th align="left">Verified</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {allReviews.map((r) => (
                <tr key={r.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 text-text">
                    {r.productEmoji} {r.productName}
                  </td>
                  <td className="px-3.5 py-2.5 text-text">{r.reviewerName}</td>
                  <td className="px-3.5 py-2.5 text-gold">
                    {'★'.repeat(r.rating)}
                    {'☆'.repeat(5 - r.rating)}
                  </td>
                  <td className="px-3.5 py-2.5 text-muted">{r.date}</td>
                  <td className="max-w-50 truncate px-3.5 py-2.5 text-muted">{r.body}</td>
                  <td className="px-3.5 py-2.5">
                    <ReviewToggleButton id={r.id} isVerified={r.isVerified} />
                  </td>
                  <td className="px-3.5 py-2.5 text-right">
                    <ReviewDeleteButton id={r.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th
      className={`px-3.5 py-2.5 font-medium text-muted ${align === 'right' ? 'text-right' : 'text-left'}`}
    >
      {children}
    </th>
  );
}
