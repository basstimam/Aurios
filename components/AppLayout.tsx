import { Navbar } from './Navbar'
import { TrustBar } from './TrustBar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-page">
      <Navbar />
      <TrustBar />
      <main className="max-w-[1440px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
