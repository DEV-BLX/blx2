import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignUp() {
  const { register } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!role) {
      setError("Please select an account type");
      return;
    }
    setLoading(true);
    const result = await register(email, password, role, referralCode || undefined);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setLocation("/dashboard");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-[#d4b55c] shadow-lg shadow-gold/20 mb-4">
            <span className="text-navy font-black text-sm">BLX</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">Create Account</h1>
          <p className="text-coffee-brown/60 dark:text-white/45 text-sm mt-1 font-light">Join Blue Label Exchange</p>
        </div>

        <div className="neu-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-terracotta-red/10 text-terracotta-red text-sm font-medium border border-terracotta-red/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-charcoal/80 dark:text-white/70">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-navy/20 dark:focus:ring-gold/20 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-charcoal/80 dark:text-white/70">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="At least 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-navy/20 dark:focus:ring-gold/20 dark:text-white transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Account Type</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-navy/20 dark:focus:ring-gold/20 dark:text-white">
                  <SelectValue placeholder="Select your account type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl dark:bg-[#2a2a2a] dark:border-white/10">
                  <SelectItem value="company">Business / Company</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="consultant">Consultant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="referral" className="text-sm font-medium text-charcoal/80 dark:text-white/70">
                Referral Code <span className="text-coffee-brown/40 dark:text-white/30 font-normal">(optional)</span>
              </Label>
              <Input
                id="referral"
                type="text"
                placeholder="e.g. BLX-J4K7M"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:shadow-black/20 focus:ring-2 focus:ring-navy/20 dark:focus:ring-gold/20 dark:text-white transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-sm font-semibold bg-gradient-to-r from-navy to-[#2d5490] text-white shadow-lg shadow-navy/25 hover:shadow-xl hover:shadow-navy/30 hover:-translate-y-px transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
            <p className="text-center text-sm text-coffee-brown/50 dark:text-white/40 pt-2">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-navy dark:text-gold font-medium hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
