import { Navbar } from './Navbar'

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-page">
      <Navbar />
      <main className="max-w-[1440px] mx-auto w-full">
        {children}
      </main>
    </div>
  )
}
