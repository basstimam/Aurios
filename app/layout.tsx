import type { Metadata } from "next";
import { Space_Grotesk, Roboto_Mono, Inter } from 'next/font/google'
import "./globals.css";
import { Providers } from './providers'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-roboto-mono',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: "Aurios | DeFi Savings for DAO Treasuries",
  description: "Institutional-grade savings for DAO treasuries. Deploy treasury funds into audited YO Protocol vaults. Earn real yield. Stay in control.",
  metadataBase: new URL('https://aurios.finance'),
  openGraph: {
    title: 'Aurios | DeFi Savings for DAO Treasuries',
    description: 'Institutional-grade savings for DAO treasuries. Earn real yield on YO Protocol vaults.',
    type: 'website',
    siteName: 'Aurios',
    images: [{ url: '/og-image.svg', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Aurios | DeFi Savings for DAO Treasuries',
    description: 'Institutional-grade savings for DAO treasuries. Earn real yield on YO Protocol vaults.',
    images: ['/og-image.svg'],
  },
  keywords: ['DeFi', 'DAO', 'treasury', 'savings', 'YO Protocol', 'Base', 'yield'],
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${robotoMono.variable} ${inter.variable}`}
    >
      <body className="antialiased bg-bg-page text-text-primary">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
