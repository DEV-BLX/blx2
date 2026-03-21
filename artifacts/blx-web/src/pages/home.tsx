import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Building2, Users, Briefcase } from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-3.5rem)]">
      <section className="relative overflow-hidden bg-navy py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-br from-gold/30 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Blue Label <span className="text-gold">Exchange</span>
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Business consulting, a B2B marketplace, and consumer-to-business bidding — all in one platform.
          </p>
          {!user && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/sign-up">
                <Button size="lg" className="bg-gold text-charcoal hover:bg-gold/90 font-semibold">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sign-in">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl grid md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-navy/10">
              <Building2 className="h-7 w-7 text-navy" />
            </div>
            <h3 className="font-semibold text-lg text-charcoal mb-2">For Businesses</h3>
            <p className="text-coffee-brown text-sm">
              Claim your company profile, access tools, and grow with expert consulting.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-fox-orange/10">
              <Users className="h-7 w-7 text-fox-orange" />
            </div>
            <h3 className="font-semibold text-lg text-charcoal mb-2">For Consumers</h3>
            <p className="text-coffee-brown text-sm">
              Use Echo Pricing to get competitive bids from local businesses on your terms.
            </p>
          </div>
          <div className="text-center p-6">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-dusty-sage/10">
              <Briefcase className="h-7 w-7 text-dusty-sage" />
            </div>
            <h3 className="font-semibold text-lg text-charcoal mb-2">For Consultants</h3>
            <p className="text-coffee-brown text-sm">
              Connect with businesses, manage bookings, and earn through expert consulting.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
