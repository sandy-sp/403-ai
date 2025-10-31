import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProfileEditor } from '@/components/admin/ProfileEditor';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Profile - Admin',
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/signin');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      bio: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect('/signin');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
        <p className="text-text-secondary">
          Manage your account settings and preferences
        </p>
      </div>

      <ProfileEditor user={user} />
    </div>
  );
}
