import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07080B] flex items-center justify-center px-6">
      <div className="max-w-[480px] w-full text-center">
        <p className="font-roboto-mono text-[#F59E0B] text-6xl font-bold mb-4">404</p>
        <h1 className="font-space-grotesk text-[#F4EFE8] text-2xl font-bold mb-2">
          Page not found
        </h1>
        <p className="text-[#9B9081] text-sm font-inter mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-[#F59E0B] text-black font-semibold px-6 py-2.5 rounded-lg hover:bg-[#D97706] transition-colors font-inter"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
