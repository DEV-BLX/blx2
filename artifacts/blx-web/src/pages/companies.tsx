import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Search, Building2, MapPin } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string | null;
  city: string | null;
  state: string | null;
  imageUrl: string | null;
  isClaimed: boolean;
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

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityResults, setCommunityResults] = useState<Community[]>([]);
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);

  useEffect(() => {
    fetch("/api/categories?taxonomy=company").then(r => r.json()).then(d => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (categoryId) params.set("category_id", categoryId);
    if (selectedCommunity) params.set("community_id", selectedCommunity.id);

    fetch(`/api/companies?${params}`).then(r => r.json()).then(d => {
      setCompanies(d.companies || []);
      setLoading(false);
    });
  }, [search, categoryId, selectedCommunity]);

  useEffect(() => {
    if (communitySearch.length < 2) {
      setCommunityResults([]);
      return;
    }
    const t = setTimeout(() => {
      fetch(`/api/communities/search?q=${encodeURIComponent(communitySearch)}&limit=8`)
        .then(r => r.json()).then(d => setCommunityResults(d.communities || []));
    }, 300);
    return () => clearTimeout(t);
  }, [communitySearch]);

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-charcoal dark:text-white">Browse Companies</h1>
          <p className="text-coffee-brown/60 dark:text-white/40 mt-2 font-light">Discover local businesses in your community</p>
        </div>

        <div className="neu-card rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-brown/40 dark:text-white/30" />
              <Input
                placeholder="Search companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white"
              />
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 px-3 text-sm text-charcoal dark:text-white min-w-[180px]"
            >
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="relative min-w-[200px]">
              <Input
                placeholder="Filter by county..."
                value={selectedCommunity ? selectedCommunity.displayName : communitySearch}
                onChange={(e) => {
                  setCommunitySearch(e.target.value);
                  setSelectedCommunity(null);
                }}
                className="h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white"
              />
              {communityResults.length > 0 && !selectedCommunity && (
                <div className="absolute z-10 top-12 left-0 right-0 neu-card rounded-xl p-2 max-h-48 overflow-y-auto">
                  {communityResults.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setSelectedCommunity(c); setCommunitySearch(""); setCommunityResults([]); }}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-navy/10 dark:hover:bg-white/10 text-charcoal dark:text-white"
                    >
                      {c.displayName}
                    </button>
                  ))}
                </div>
              )}
              {selectedCommunity && (
                <button
                  onClick={() => { setSelectedCommunity(null); setCommunitySearch(""); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-coffee-brown/50 hover:text-coffee-brown dark:text-white/40"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12 text-coffee-brown/40 dark:text-white/30">Loading...</div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 mx-auto text-coffee-brown/20 dark:text-white/15 mb-3" />
            <p className="text-coffee-brown/50 dark:text-white/40">No companies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(company => (
              <Link key={company.id} href={`/company/${company.id}`}>
                <div className="neu-card rounded-2xl p-5 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 cursor-pointer h-full">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-navy to-[#2d5490] flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">{company.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal dark:text-white truncate">{company.name}</h3>
                      {(company.city || company.state) && (
                        <div className="flex items-center gap-1 text-xs text-coffee-brown/50 dark:text-white/35 mt-0.5">
                          <MapPin className="h-3 w-3" />
                          {[company.city, company.state].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                  {company.description && (
                    <p className="text-sm text-coffee-brown/60 dark:text-white/45 line-clamp-2">{company.description}</p>
                  )}
                  <div className="mt-3 flex items-center justify-between">
                    {!company.isClaimed && (
                      <span className="text-xs px-2 py-1 rounded-full bg-gold/15 text-gold font-medium">Unclaimed</span>
                    )}
                    {company.isClaimed && (
                      <span className="text-xs px-2 py-1 rounded-full bg-green-500/15 text-green-600 dark:text-green-400 font-medium">Verified</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
