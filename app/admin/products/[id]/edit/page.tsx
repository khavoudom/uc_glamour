import { verifyAdminSession } from '@/lib/admin-dal';
import { getProductAdminById } from '@/lib/data-access/products-admin';
import { notFound } from 'next/navigation';
import EditProductForm from './edit-form';

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  await verifyAdminSession();
  const { id } = await params;
  const productId = parseInt(id, 10);

  const product = await getProductAdminById(productId);
  if (!product) notFound();

  return <EditProductForm product={product} />;
}
