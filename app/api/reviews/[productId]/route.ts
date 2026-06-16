import { getReviewsByProduct, getReviewStatsByProduct } from '@/lib/data-access/reviews';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ productId: string }> },
) {
  const { productId } = await params;
  const id = parseInt(productId, 10);
  if (isNaN(id)) {
    return Response.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const [reviews, stats] = await Promise.all([
    getReviewsByProduct(id),
    getReviewStatsByProduct(id),
  ]);

  return Response.json({ reviews, stats });
}
