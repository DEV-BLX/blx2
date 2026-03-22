import { useState, useEffect } from "react";
import { useParams, useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth";
import { Building2, Globe, Phone, MapPin, Tag, Users, ExternalLink, Shield } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  imageUrl: string | null;
  city: string | null;
  state: string | null;
  isClaimed: boolean;
  claimedByUserId: string | null;
  status: string;
}

interface Category {
  id: string;
  name: string;
}

interface Community {
  id: string;
  name: string;
  displayName: string;
  state: string;
}

export default function CompanyCard() {
  const params = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [cats, setCats] = useState<Category[]>([]);
  const [comms, setComms] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimError, setClaimError] = useState("");
  const [justClaimed, setJustClaimed] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("claimed") === "true") setJustClaimed(true);
  }, []);

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/companies/${params.id}`).then(r => r.json()).then(d => {
      setCompany(d.company || null);
      setCats(d.categories || []);
      setComms(d.communities || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [params.id]);

  const handleClaim = async () => {
    if (!user) {
      setLocation(`/sign-up?role=company&returnUrl=/company/${params.id}`);
      return;
    }
    if (user.role !== "company") {
      setClaimError("Only company accounts can claim businesses.");
      return;
    }

    setClaiming(true);
    setClaimError("");
    try {
      const res = await fetch(`/api/companies/${params.id}/claim`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setClaimError(data.error);
        return;
      }
      if (data.claimed) {
        setJustClaimed(true);
        setCompany(prev => prev ? { ...prev, isClaimed: true, claimedByUserId: user.id } : null);
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch {
      setClaimError("Something went wrong. Please try again.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center">
        <p className="text-coffee-brown/40 dark:text-white/30">Loading...</p>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
        <div className="text-center">
          <Building2 className="h-12 w-12 mx-auto text-coffee-brown/20 dark:text-white/15 mb-3" />
          <h1 className="text-xl font-bold text-charcoal dark:text-white mb-2">Company Not Found</h1>
          <Link href="/companies" className="text-navy dark:text-gold text-sm hover:underline">Browse Companies</Link>
        </div>
      </div>
    );
  }

  const isOwner = user && company.claimedByUserId === user.id;

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {justClaimed && (
          <div className="neu-card rounded-2xl p-4 mb-6 border border-green-500/30 bg-green-500/5">
            <p className="text-green-700 dark:text-green-400 text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Business successfully claimed! You can now manage your company profile.
            </p>
          </div>
        )}

        <div className="neu-card rounded-3xl p-6 sm:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-navy to-[#2d5490] flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-2xl">{company.name.charAt(0)}</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-charcoal dark:text-white">{company.name}</h1>
              {(company.city || company.state) && (
                <div className="flex items-center gap-1.5 text-sm text-coffee-brown/50 dark:text-white/40 mt-1">
                  <MapPin className="h-4 w-4" />
                  {[company.city, company.state].filter(Boolean).join(", ")}
                </div>
              )}
              {company.isClaimed && (
                <span className="inline-flex items-center gap-1 mt-2 text-xs px-2.5 py-1 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">
                  <Shield className="h-3 w-3" /> Verified Business
                </span>
              )}
            </div>
          </div>

          {company.description && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-charcoal/70 dark:text-white/60 uppercase tracking-wide mb-2">About</h2>
              <p className="text-coffee-brown/70 dark:text-white/55 leading-relaxed">{company.description}</p>
            </div>
          )}

          {cats.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-charcoal/70 dark:text-white/60 uppercase tracking-wide mb-2">Categories</h2>
              <div className="flex flex-wrap gap-2">
                {cats.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-navy/8 dark:bg-white/8 text-sm text-navy dark:text-gold font-medium">
                    <Tag className="h-3 w-3" /> {c.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {comms.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-charcoal/70 dark:text-white/60 uppercase tracking-wide mb-2">Communities Served</h2>
              <div className="flex flex-wrap gap-2">
                {comms.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-sage/15 dark:bg-sage/10 text-sm text-sage-dark dark:text-sage font-medium">
                    <Users className="h-3 w-3" /> {c.displayName}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {company.website && (
              <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-navy dark:text-gold hover:underline">
                <Globe className="h-4 w-4" /> {company.website} <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {company.phone && company.isClaimed && (
              <div className="flex items-center gap-2 text-sm text-coffee-brown/70 dark:text-white/55">
                <Phone className="h-4 w-4" /> {company.phone}
              </div>
            )}
          </div>

          {claimError && (
            <div className="p-3 rounded-xl bg-terracotta-red/10 text-terracotta-red text-sm font-medium border border-terracotta-red/20 mb-4">
              {claimError}
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {!company.isClaimed && !isOwner && (
              <button
                onClick={handleClaim}
                disabled={claiming}
                className="px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-lg shadow-gold/20 hover:shadow-xl hover:-translate-y-px transition-all duration-300 disabled:opacity-60"
              >
                {claiming ? "Processing..." : "Claim this Business"}
              </button>
            )}
            {isOwner && (
              <Link href="/company/edit">
                <button className="px-6 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-navy to-[#2d5490] text-white shadow-lg shadow-navy/25 hover:shadow-xl hover:-translate-y-px transition-all duration-300">
                  Edit Profile
                </button>
              </Link>
            )}
            {company.isClaimed && !isOwner && (
              <button className="px-6 py-3 rounded-2xl text-sm font-semibold neu-btn text-charcoal dark:text-white">
                Contact
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
