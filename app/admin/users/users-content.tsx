'use client';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  loyaltyPoints: number;
  loyaltyTier: string;
  createdAt: Date;
}

export default function UsersContent({ users }: { users: User[] }) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-medium text-text">Users</h1>
      </div>

      {users.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-10 text-center">
          <p className="text-[13px] text-muted">No users yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr className="border-b border-border">
                <Th align="left">Name</Th>
                <Th align="left">Email</Th>
                <Th align="left">Role</Th>
                <Th align="left">Tier</Th>
                <Th align="left">Points</Th>
                <Th align="right">Joined</Th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 font-medium text-text">{u.name}</td>
                  <td className="px-3.5 py-2.5 text-muted">{u.email}</td>
                  <td className="px-3.5 py-2.5">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-medium ${
                        u.role === 'admin'
                          ? 'bg-pink-lt text-pink-dk'
                          : 'bg-border text-muted'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-3.5 py-2.5 text-text">{u.loyaltyTier}</td>
                  <td className="px-3.5 py-2.5 text-text">{u.loyaltyPoints}</td>
                  <td className="px-3.5 py-2.5 text-right text-muted">
                    {new Date(u.createdAt).toLocaleDateString('en-US')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
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
