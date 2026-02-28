import Link from "next/link";

// ──────────────────────────────────────────────
// Section 1 — Landing Navbar (inline, NOT shared)
// ──────────────────────────────────────────────
function LandingNavbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-bg-page">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-accent-amber text-xl leading-none">⬡</span>
          <span className="font-space-grotesk text-lg font-bold text-text-primary tracking-tight">
            Smelt
          </span>
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-8">
          {[
            { label: "Features", href: "#features" },
            { label: "Vaults", href: "#vaults" },
            { label: "Docs", href: "#" },
          ].map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="font-inter text-sm text-text-secondary hover:text-accent-amber transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <Link
          href="/dashboard"
          className="rounded-lg bg-accent-amber px-4 py-2 font-space-grotesk text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          style={{ backgroundColor: '#F59E0B', color: '#000000' }}
        >
          Launch App →
        </Link>
      </nav>
    </header>
  );
}

// ──────────────────────────────────────────────
// Section 2 — Hero
// ──────────────────────────────────────────────
function HeroSection() {
  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-16 px-6 py-24 md:grid-cols-2 md:py-32">
      {/* Left column */}
      <div className="flex flex-col gap-6">
        {/* Eyebrow */}
        <span className="font-roboto-mono text-xs font-medium uppercase tracking-widest text-accent-amber">
          DAO Treasury Management
        </span>

        {/* H1 */}
        <h1 className="font-space-grotesk text-[2.75rem] font-bold leading-[1.1] tracking-tight text-text-primary md:text-[3.25rem]">
          Smart DeFi Savings<br />for DAO Treasuries
        </h1>

        {/* Subtitle */}
        <p className="font-inter text-base leading-relaxed text-text-secondary max-w-md">
          Put your idle treasury to work. Earn yield on USDC, ETH, and BTC
          through battle-tested DeFi protocols — with institutional-grade
          controls.
        </p>

        {/* CTAs */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            href="/dashboard"
            className="rounded-lg bg-accent-amber px-6 py-3 font-space-grotesk text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
            style={{ backgroundColor: '#F59E0B', color: '#000000' }}
          >
            Start Saving →
          </Link>
          <a
            href="#vaults"
            className="rounded-lg border border-border-default px-6 py-3 font-space-grotesk text-sm font-semibold text-text-primary hover:border-border-default hover:text-accent-amber transition-colors"
          >
            View Vaults
          </a>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          {[
            "🔒 Non-Custodial",
            "✓ Audited",
            "◆ Base Chain",
          ].map((badge) => (
            <span
              key={badge}
              className="font-inter text-xs text-text-tertiary"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      {/* Right column — Vault preview card */}
      <div className="flex justify-center md:justify-end">
        <div className="w-full max-w-sm rounded-xl border border-border-default bg-bg-card p-6 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <span className="font-space-grotesk text-sm font-semibold text-text-secondary uppercase tracking-wide">
              Top Vault
            </span>
            <span className="rounded-full border border-border-subtle px-2 py-0.5 font-roboto-mono text-xs text-text-tertiary">
              Live
            </span>
          </div>

          <div>
            <p className="font-space-grotesk text-xl font-bold text-text-primary">
              yoUSD Vault
            </p>
            <p className="font-inter text-sm text-text-secondary mt-1">
              Stablecoin yield on Base
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border-subtle pt-4">
            <div>
              <p className="font-inter text-xs text-text-tertiary">APY</p>
              <p className="font-roboto-mono text-2xl font-medium text-accent-amber mt-0.5">
                8.4%
              </p>
            </div>
            <div>
              <p className="font-inter text-xs text-text-tertiary">TVL</p>
              <p className="font-roboto-mono text-2xl font-medium text-text-primary mt-0.5">
                $4.2M
              </p>
            </div>
          </div>

          <Link
            href="/deposit/choose"
            className="mt-2 w-full rounded-lg bg-accent-amber py-2.5 text-center font-space-grotesk text-sm font-semibold text-black hover:bg-amber-400 transition-colors"
          >
            Deposit →
          </Link>
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 3 — StatsStrip
// ──────────────────────────────────────────────
function StatsStrip() {
  const stats = [
    { value: "$14.7M", label: "TVL Protected" },
    { value: "8.4%", label: "Avg APY" },
    { value: "52", label: "Active DAOs" },
    { value: "$1.2M", label: "Total Earned" },
  ];

  return (
    <section className="border-y border-border-subtle bg-bg-card">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="grid grid-cols-2 divide-x divide-border-default md:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-1 px-6 py-4 first:pl-0 last:pr-0"
            >
              <span className="font-roboto-mono text-3xl font-medium text-text-primary">
                {stat.value}
              </span>
              <span className="font-inter text-sm text-text-secondary">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 4 — OpportunitySection
// ──────────────────────────────────────────────
function OpportunitySection() {
  const benefits = [
    {
      icon: "🏦",
      title: "Institutional Controls",
      desc: "Multi-sig approval flows, spending limits, and audit trails built in.",
    },
    {
      icon: "⚡",
      title: "Instant Liquidity",
      desc: "Redeem your position anytime. No lockups, no waiting periods.",
    },
    {
      icon: "📊",
      title: "Transparent Yield",
      desc: "All yield sources are onchain and verifiable. No black boxes.",
    },
  ];

  return (
    <section className="mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-6 py-24 md:grid-cols-2">
      {/* Left */}
      <div className="flex flex-col gap-6">
        <h2 className="font-space-grotesk text-3xl font-bold leading-tight text-text-primary md:text-4xl">
          Why DAOs choose Smelt
        </h2>
        <p className="font-inter text-base leading-relaxed text-text-secondary">
          Most DAO treasuries sit idle in multisigs, earning nothing. Smelt
          connects your treasury to the highest-yielding DeFi protocols on
          Base — with the controls your governance requires.
        </p>
        <p className="font-inter text-base leading-relaxed text-text-secondary">
          From stablecoin yield to ETH staking, choose the risk profile that
          fits your DAO&apos;s mandate.
        </p>
      </div>

      {/* Right — Benefit cards */}
      <div className="flex flex-col gap-4">
        {benefits.map((b) => (
          <div
            key={b.title}
            className="rounded-lg border border-border-subtle bg-bg-card p-4 flex items-start gap-4"
          >
            <span className="text-xl leading-none mt-0.5">{b.icon}</span>
            <div>
              <p className="font-space-grotesk text-sm font-semibold text-text-primary">
                {b.title}
              </p>
              <p className="font-inter text-sm text-text-secondary mt-1">
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 5 — FeaturesSection
// ──────────────────────────────────────────────
function FeaturesSection() {
  const features = [
    {
      icon: "🔐",
      title: "Non-Custodial",
      desc: "Your funds never leave your control. Smart contracts, not intermediaries.",
    },
    {
      icon: "🌐",
      title: "Multi-Vault",
      desc: "Diversify across USDC, ETH, and BTC vaults in a single interface.",
    },
    {
      icon: "👥",
      title: "Team Management",
      desc: "Role-based access with approval workflows for every transaction.",
    },
    {
      icon: "📈",
      title: "Live Analytics",
      desc: "Real-time APY, TVL, and position tracking from the blockchain.",
    },
  ];

  return (
    <section id="features" className="bg-bg-card border-y border-border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-24">
        <h2 className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl mb-12 text-center">
          Everything your treasury needs
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border-subtle bg-bg-page p-6 flex flex-col gap-3"
            >
              <span className="text-2xl leading-none">{f.icon}</span>
              <p className="font-space-grotesk text-base font-semibold text-text-primary">
                {f.title}
              </p>
              <p className="font-inter text-sm leading-relaxed text-text-secondary">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 6 — VaultSection
// ──────────────────────────────────────────────
function VaultSection() {
  const vaults = [
    { name: "yoUSD", asset: "USDC", apy: "8.4%", tvl: "$4.2M" },
    { name: "yoETH", asset: "WETH", apy: "5.2%", tvl: "$6.8M" },
    { name: "yoBTC", asset: "cbBTC", apy: "3.8%", tvl: "$3.7M" },
  ];

  return (
    <section id="vaults" className="mx-auto max-w-7xl px-6 py-24">
      <h2 className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl mb-10">
        Available Vaults
      </h2>
      <div className="overflow-hidden rounded-xl border border-border-subtle bg-bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border-subtle">
              {["Vault", "Asset", "APY", "TVL", "Action"].map((col) => (
                <th
                  key={col}
                  className="px-6 py-4 text-left font-inter text-xs font-medium uppercase tracking-wider text-text-tertiary"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {vaults.map((v) => (
              <tr
                key={v.name}
                className="hover:bg-bg-page transition-colors"
              >
                <td className="px-6 py-5">
                  <span className="font-space-grotesk text-sm font-semibold text-text-primary">
                    {v.name}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-roboto-mono text-sm text-text-secondary">
                    {v.asset}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-roboto-mono text-sm font-medium text-accent-amber">
                    {v.apy}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <span className="font-roboto-mono text-sm text-text-secondary">
                    {v.tvl}
                  </span>
                </td>
                <td className="px-6 py-5">
                  <Link
                    href="/deposit/choose"
                    className="rounded-md border border-border-default px-4 py-1.5 font-inter text-xs font-medium text-text-primary hover:border-accent-amber hover:text-accent-amber transition-colors"
                  >
                    Deposit →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 7 — FinalCTA
// ──────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="bg-bg-card border-y border-border-subtle">
      <div className="mx-auto max-w-7xl px-6 py-24 flex flex-col items-center text-center gap-6">
        <h2 className="font-space-grotesk text-3xl font-bold text-text-primary md:text-4xl max-w-lg">
          Ready to put your treasury to work?
        </h2>
        <p className="font-inter text-base text-text-secondary max-w-sm">
          Join 52 DAOs already earning yield with Smelt.
        </p>
        <Link
          href="/dashboard"
          className="mt-2 rounded-lg bg-accent-amber px-8 py-3.5 font-space-grotesk text-base font-semibold text-black hover:bg-amber-400 transition-colors"
        >
          Start Saving →
        </Link>
        <p className="font-inter text-xs text-text-tertiary">
          Non-custodial · Audited · Base Chain
        </p>
      </div>
    </section>
  );
}

// ──────────────────────────────────────────────
// Section 8 — Footer
// ──────────────────────────────────────────────
function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-page">
      <div className="mx-auto max-w-7xl px-6 py-12 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-0">
        {/* Left — Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="text-accent-amber text-xl leading-none">⬡</span>
            <span className="font-space-grotesk text-base font-bold text-text-primary">
              Smelt
            </span>
          </div>
          <p className="font-inter text-sm text-text-secondary max-w-[200px]">
            Smart DeFi savings for DAO treasuries.
          </p>
        </div>

        {/* Center — Links */}
        <div className="flex flex-col gap-3 md:items-center">
          <p className="font-inter text-xs font-medium uppercase tracking-wider text-text-tertiary">
            Navigate
          </p>
          <ul className="flex flex-col gap-2">
            {[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Vaults", href: "#vaults" },
              { label: "Team", href: "/team" },
              { label: "Docs", href: "#" },
            ].map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className="font-inter text-sm text-text-secondary hover:text-accent-amber transition-colors"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — Protocol info */}
        <div className="flex flex-col gap-3 md:items-end">
          <p className="font-inter text-sm text-text-secondary">
            Powered by{" "}
            <span className="text-accent-amber font-medium">YO Protocol</span>
          </p>
          <p className="font-inter text-xs text-text-tertiary">
            © 2026 Smelt. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ──────────────────────────────────────────────
// Page — Root export (Server Component, no 'use client')
// ──────────────────────────────────────────────
export default function LandingPage() {
  return (
    <main className="min-h-screen bg-bg-page text-text-primary">
      <LandingNavbar />
      <HeroSection />
      <StatsStrip />
      <OpportunitySection />
      <FeaturesSection />
      <VaultSection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
