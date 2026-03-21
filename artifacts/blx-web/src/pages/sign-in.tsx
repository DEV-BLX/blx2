import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getDashboardPath(role: string): string {
  if (["admin", "super_admin", "content_admin", "support_admin", "finance_admin"].includes(role)) {
    return "/admin/dashboard";
  }
  return "/dashboard";
}

export default function SignIn() {
  const { login } = useAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else if (result.user) {
      setLocation(getDashboardPath(result.user.role));
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gold to-[#d4b55c] shadow-lg shadow-gold/20 mb-4">
            <span className="text-navy font-black text-sm">BLX</span>
          </div>
          <h1 className="text-2xl font-bold text-charcoal">Welcome Back</h1>
          <p className="text-coffee-brown/60 text-sm mt-1 font-light">Sign in to your BLX account</p>
        </div>

        <div className="neu-card rounded-3xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-terracotta-red/10 text-terracotta-red text-sm font-medium border border-terracotta-red/20">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-charcoal/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 rounded-xl bg-[#eef0f5] border-0 shadow-inner shadow-black/5 focus:ring-2 focus:ring-navy/20 transition-all"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-charcoal/80">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-11 rounded-xl bg-[#eef0f5] border-0 shadow-inner shadow-black/5 focus:ring-2 focus:ring-navy/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl text-sm font-semibold bg-gradient-to-r from-navy to-[#2d5490] text-white shadow-lg shadow-navy/25 hover:shadow-xl hover:shadow-navy/30 hover:-translate-y-px transition-all duration-300 disabled:opacity-60 disabled:pointer-events-none"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
            <p className="text-center text-sm text-coffee-brown/50 pt-2">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-navy font-medium hover:underline">
                Sign Up
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
