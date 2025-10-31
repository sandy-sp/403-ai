'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export function AdminHeader() {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-secondary border-b border-secondary-light flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, {session?.user?.name}</h2>
        <p className="text-sm text-text-secondary">Manage your content</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
            <User size={16} className="text-accent-cyan" />
          </div>
          <div>
            <p className="font-medium">{session?.user?.name}</p>
            <p className="text-xs text-text-secondary">{session?.user?.role}</p>
          </div>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="btn-ghost flex items-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </header>
  );
}
