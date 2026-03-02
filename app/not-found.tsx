import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg-page flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center">
        <p className="font-roboto-mono text-accent-amber text-6xl font-bold mb-4">404</p>
        <h1 className="font-space-grotesk text-text-primary text-2xl font-bold mb-2">
          Page not found
        </h1>
        <p className="text-text-secondary text-sm font-inter mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-lg px-6 py-2.5 font-inter text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--accent-amber)', color: '#000' }}
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
