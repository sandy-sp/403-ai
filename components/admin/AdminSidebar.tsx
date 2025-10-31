'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  FolderOpen,
  Tags,
  Image as ImageIcon,
  Mail,
  MessageSquare,
  BarChart3,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const menuItems = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Posts',
    href: '/admin/posts',
    icon: FileText,
  },
  {
    name: 'Categories',
    href: '/admin/categories',
    icon: FolderOpen,
  },
  {
    name: 'Tags',
    href: '/admin/tags',
    icon: Tags,
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: ImageIcon,
  },
  {
    name: 'Comments',
    href: '/admin/comments',
    icon: MessageSquare,
  },
  {
    name: 'Subscribers',
    href: '/admin/subscribers',
    icon: Mail,
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-secondary border-r border-secondary-light">
      <div className="p-6">
        <Link href="/admin" className="flex items-center gap-2">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
            403 AI
          </h1>
        </Link>
        <p className="text-xs text-text-secondary mt-1">Admin Dashboard</p>
      </div>

      <nav className="px-3">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors',
                isActive
                  ? 'bg-accent-cyan/10 text-accent-cyan'
                  : 'text-text-secondary hover:bg-secondary-light hover:text-text-primary'
              )}
            >
              <Icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
