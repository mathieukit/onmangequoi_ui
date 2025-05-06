import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="card max-w-lg w-full p-8">
        <h2 className="text-2xl font-bold mb-4 text-[var(--primary)]">Page Not Found</h2>
        <p className="mb-6">
          We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/" className="btn btn-primary flex-1 text-center">
            Go to Home
          </Link>
          <Link href="/recipes" className="btn btn-secondary flex-1 text-center">
            View Recipes
          </Link>
        </div>
      </div>
    </div>
  );
}
