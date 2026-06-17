import { verifySession } from '@/lib/dal';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { getOrdersByUserId } from '@/lib/data-access/orders';
import { getUserById } from '@/lib/data-access/users';
import AccountContent from './account-content';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { userId } = await verifySession();
  const session = await auth();
  if (session?.user?.role === 'admin') redirect('/admin');
  const orders = await getOrdersByUserId(userId);
  const user = await getUserById(userId);

  return <AccountContent orders={orders} user={user} />;
}
