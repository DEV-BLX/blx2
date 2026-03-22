import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  ArrowRight,
  Building2,
  Users,
  Briefcase,
  Zap,
  Shield,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="relative overflow-hidden depth-gradient texture-grain">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gold/8 blur-3xl float-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-fox-orange/6 blur-3xl float-medium" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-3xl" />
        </div>

        <div className="absolute inset-0 shimmer" />

        <div className="relative z-10 mx-auto max-w-5xl px-5 py-24 md:py-32">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/8 backdrop-blur-sm border border-white/10 mb-8">
              <div className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span className="text-xs font-medium text-white/70 tracking-wide uppercase">
                B2B Marketplace & Consulting
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="text-white">Blue Label</span>
              <br />
              <span className="bg-gradient-to-r from-gold via-[#f0d57a] to-gold bg-clip-text text-transparent">
                Exchange
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-white/55 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              Connect with expert consultants, access a B2B marketplace, and leverage
              consumer-to-business bidding — all in one premium platform.
            </p>

            {!user && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/sign-up">
                  <span className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-xl shadow-gold/25 hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                    Get Started Free
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
                <Link href="/sign-in">
                  <span className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-medium text-white/70 bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:text-white hover:border-white/20 transition-all duration-300 cursor-pointer">
                    Sign In
                  </span>
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="hero-fade-bottom absolute bottom-0 left-0 right-0 h-24" />
      </section>

      <section className="relative neu-page-bg py-20 md:py-28 px-5">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-fox-orange tracking-widest uppercase mb-3">
              Who We Serve
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
              Built for Every Side of Business
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="neu-card rounded-3xl p-8 transition-all duration-300 group">
              <div className="neu-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-none transition-shadow duration-300">
                <Building2 className="h-6 w-6 text-navy dark:text-gold" />
              </div>
              <h3 className="text-lg font-bold text-charcoal dark:text-white mb-3">For Businesses</h3>
              <p className="text-coffee-brown/80 dark:text-white/50 text-sm leading-relaxed mb-5">
                Claim your company profile, access powerful tools, and grow with
                expert consulting tailored to your needs.
              </p>
              <Link href="/services">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-navy/70 dark:text-gold/70 hover:text-navy dark:hover:text-gold group-hover:gap-2 transition-all cursor-pointer">
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>

            <div className="neu-card rounded-3xl p-8 transition-all duration-300 group">
              <div className="neu-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-none transition-shadow duration-300">
                <Users className="h-6 w-6 text-fox-orange" />
              </div>
              <h3 className="text-lg font-bold text-charcoal dark:text-white mb-3">For Consumers</h3>
              <p className="text-coffee-brown/80 dark:text-white/50 text-sm leading-relaxed mb-5">
                Use Echo Pricing to get competitive bids from local businesses
                on your terms. Save money, your way.
              </p>
              <Link href="/echo-pricing">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-fox-orange/70 hover:text-fox-orange group-hover:gap-2 transition-all cursor-pointer">
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>

            <div className="neu-card rounded-3xl p-8 transition-all duration-300 group">
              <div className="neu-icon w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:shadow-none transition-shadow duration-300">
                <Briefcase className="h-6 w-6 text-dusty-sage" />
              </div>
              <h3 className="text-lg font-bold text-charcoal dark:text-white mb-3">For Consultants</h3>
              <p className="text-coffee-brown/80 dark:text-white/50 text-sm leading-relaxed mb-5">
                Connect with businesses, manage bookings, and earn through
                your expertise with industry-leading payouts.
              </p>
              <Link href="/consultants">
                <span className="inline-flex items-center gap-1 text-sm font-medium text-dusty-sage/70 hover:text-dusty-sage group-hover:gap-2 transition-all cursor-pointer">
                  Learn more <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-20 md:py-28 px-5 neu-page-bg">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <span className="inline-block text-xs font-semibold text-gold tracking-widest uppercase mb-3">
              Why BLX
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-charcoal dark:text-white tracking-tight">
              The Platform Advantage
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="neu-raised rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="neu-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-5 w-5 text-gold" />
              </div>
              <h4 className="font-semibold text-charcoal dark:text-white mb-2">Echo Pricing</h4>
              <p className="text-coffee-brown/70 dark:text-white/45 text-sm">
                Consumers set the terms. Businesses compete. Everyone wins.
              </p>
            </div>

            <div className="neu-raised rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="neu-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-5 w-5 text-navy dark:text-gold" />
              </div>
              <h4 className="font-semibold text-charcoal dark:text-white mb-2">Verified Profiles</h4>
              <p className="text-coffee-brown/70 dark:text-white/45 text-sm">
                Identity-verified businesses and consultants you can trust.
              </p>
            </div>

            <div className="neu-raised rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1">
              <div className="neu-icon w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-5 w-5 text-fox-orange" />
              </div>
              <h4 className="font-semibold text-charcoal dark:text-white mb-2">92.5% Payouts</h4>
              <p className="text-coffee-brown/70 dark:text-white/45 text-sm">
                Industry-leading consultant payouts. Keep more of what you earn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {!user && (
        <section className="relative overflow-hidden depth-gradient texture-grain py-20 px-5">
          <div className="absolute inset-0">
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-gold/8 blur-3xl" />
          </div>
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-white/50 mb-8 text-lg font-light">
              Join the platform where businesses, consumers, and consultants thrive together.
            </p>
            <Link href="/sign-up">
              <span className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-xl shadow-gold/25 hover:shadow-2xl hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                Create Your Account
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </div>
        </section>
      )}

      <footer className="bg-[#1a3a66] dark:bg-[#0f1f35] text-white/40 py-10 px-5">
        <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-gold to-[#d4b55c]">
              <span className="text-navy font-black text-[10px]">BLX</span>
            </div>
            <span className="text-xs">Blue Label Exchange</span>
          </div>
          <p className="text-xs">&copy; {new Date().getFullYear()} Blue Label Exchange. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
