import { verifyAdminSession } from '@/lib/admin-dal';
import { getAllUsers } from '@/lib/data-access/users';
import UsersContent from './users-content';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await verifyAdminSession();
  const allUsers = await getAllUsers();

  return <UsersContent users={allUsers} />;
}
