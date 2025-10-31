import Link from 'next/link';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold mb-4 bg-gradient-to-r from-accent-cyan to-accent-purple bg-clip-text text-transparent">
          403
        </h1>
        <h2 className="text-3xl font-bold mb-4">Access Forbidden</h2>
        <p className="text-text-secondary mb-8 max-w-md">
          You don't have permission to access this resource. Admin access is
          required.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/" className="btn-primary">
            Go Home
          </Link>
          <Link href="/signin" className="btn-outline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
