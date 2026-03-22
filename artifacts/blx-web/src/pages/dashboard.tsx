import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Building2, Eye, CreditCard, MessageSquare, Pencil, ExternalLink, MapPin, Plus, Clock } from "lucide-react";

interface DashboardData {
  company: { id: string; name: string; imageUrl: string | null; status: string } | null;
  communities: { id: string; name: string; displayName: string; state: string }[];
  stats: { bids: number; views: number; credits: number };
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "company") {
      setLoading(false);
      return;
    }
    fetch("/api/company/dashboard", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user]);

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center"><p className="text-coffee-brown/40 dark:text-white/30">Loading...</p></div>;
  }

  if (user?.role !== "company") {
    return (
      <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 mx-auto text-coffee-brown/20 dark:text-white/15 mb-3" />
          <h1 className="text-xl font-bold text-charcoal dark:text-white mb-2">Dashboard</h1>
          <p className="text-coffee-brown/50 dark:text-white/40 text-sm">Dashboard for your role is coming soon.</p>
        </div>
      </div>
    );
  }

  if (!data?.company) {
    return (
      <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 mx-auto text-coffee-brown/20 dark:text-white/15 mb-3" />
          <h1 className="text-xl font-bold text-charcoal dark:text-white mb-2">Welcome to BLX</h1>
          <p className="text-coffee-brown/50 dark:text-white/40 text-sm mb-4">You haven't claimed a business yet. Browse our company directory to find and claim yours.</p>
          <Link href="/companies">
            <button className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-lg shadow-gold/20">Browse Companies</button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-navy to-[#2d5490] flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">{data.company.name.charAt(0)}</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-charcoal dark:text-white">Welcome back, {data.company.name}</h1>
            <p className="text-sm text-coffee-brown/50 dark:text-white/35">Company Dashboard</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="neu-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-navy/8 dark:bg-navy/20 flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal dark:text-white">{data.stats.bids}</p>
                <p className="text-xs text-coffee-brown/40 dark:text-white/30">Echo Pricing Bids</p>
              </div>
            </div>
          </div>
          <div className="neu-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-navy/8 dark:bg-navy/20 flex items-center justify-center">
                <Eye className="h-5 w-5 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal dark:text-white">{data.stats.views}</p>
                <p className="text-xs text-coffee-brown/40 dark:text-white/30">Profile Views</p>
              </div>
            </div>
          </div>
          <div className="neu-card rounded-2xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-navy/8 dark:bg-navy/20 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-navy dark:text-gold" />
              </div>
              <div>
                <p className="text-2xl font-bold text-charcoal dark:text-white">{data.stats.credits}</p>
                <p className="text-xs text-coffee-brown/40 dark:text-white/30">Credits Earned</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Link href="/company/edit">
            <div className="neu-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <Pencil className="h-5 w-5 text-navy dark:text-gold mb-2" />
              <h3 className="font-semibold text-charcoal dark:text-white text-sm">Edit Profile</h3>
              <p className="text-xs text-coffee-brown/40 dark:text-white/25 mt-1">Update your business info</p>
            </div>
          </Link>
          <Link href={`/company/${data.company.id}`}>
            <div className="neu-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <ExternalLink className="h-5 w-5 text-navy dark:text-gold mb-2" />
              <h3 className="font-semibold text-charcoal dark:text-white text-sm">View Company Card</h3>
              <p className="text-xs text-coffee-brown/40 dark:text-white/25 mt-1">See your public page</p>
            </div>
          </Link>
          <Link href="/echo-pricing">
            <div className="neu-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
              <MessageSquare className="h-5 w-5 text-navy dark:text-gold mb-2" />
              <h3 className="font-semibold text-charcoal dark:text-white text-sm">Echo Pricing</h3>
              <p className="text-xs text-coffee-brown/40 dark:text-white/25 mt-1">Browse pricing requests</p>
            </div>
          </Link>
        </div>

        <div className="neu-card rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white">Communities</h2>
            <Link href="/company/edit">
              <button className="text-xs text-navy dark:text-gold font-medium flex items-center gap-1 hover:underline">
                <Plus className="h-3 w-3" /> Add Community
              </button>
            </Link>
          </div>
          {data.communities.length === 0 ? (
            <p className="text-sm text-coffee-brown/40 dark:text-white/25">No communities yet. Add one from your profile.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.communities.map(c => (
                <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sage/15 dark:bg-sage/10 text-sm text-sage-dark dark:text-sage font-medium">
                  <MapPin className="h-3 w-3" /> {c.displayName}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="neu-card rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-4">Recent Activity</h2>
          <div className="text-center py-6">
            <Clock className="h-8 w-8 mx-auto text-coffee-brown/15 dark:text-white/10 mb-2" />
            <p className="text-sm text-coffee-brown/40 dark:text-white/25">No recent activity yet</p>
          </div>
        </div>
      </div>
    </div>
  );
}
