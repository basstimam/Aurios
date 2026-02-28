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
  title: "Smelt — DeFi Savings for DAO Treasuries",
  description: "Team-based DeFi savings on Base chain via YO Protocol",
};

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
