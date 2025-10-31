'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { LogOut, User, Settings } from 'lucide-react';
import { useState } from 'react';

export function AdminHeader() {
  const { data: session } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 bg-secondary border-b border-secondary-light flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold">Welcome back, {session?.user?.name}</h2>
        <p className="text-sm text-text-secondary">Manage your content</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 text-sm hover:bg-secondary-light px-3 py-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-accent-cyan/20 flex items-center justify-center">
              <User size={16} className="text-accent-cyan" />
            </div>
            <div className="text-left">
              <p className="font-medium">{session?.user?.name}</p>
              <p className="text-xs text-text-secondary">{session?.user?.role}</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-secondary border border-secondary-light rounded-lg shadow-lg z-20">
                <button
                  onClick={() => {
                    router.push('/admin/profile');
                    setShowDropdown(false);
                  }}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary-light transition-colors text-left"
                >
                  <Settings size={16} />
                  Profile Settings
                </button>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-secondary-light transition-colors text-left border-t border-secondary-light text-status-error"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
