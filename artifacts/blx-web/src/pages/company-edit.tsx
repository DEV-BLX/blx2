import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, X, Plus, Search, Trash2, Building2 } from "lucide-react";

const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC"];

interface Category { id: string; name: string; }
interface Community { id: string; name: string; displayName: string; state: string; }

export default function CompanyEdit() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [phone, setPhone] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [selectedCats, setSelectedCats] = useState<Category[]>([]);
  const [catSearch, setCatSearch] = useState("");

  const [myCommunities, setMyCommunities] = useState<Community[]>([]);
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityResults, setCommunityResults] = useState<Community[]>([]);
  const [addingCommunity, setAddingCommunity] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/company/profile", { credentials: "include" });
      if (!res.ok) {
        if (res.status === 404) {
          setLoading(false);
          return;
        }
        throw new Error("Failed to load profile");
      }
      const data = await res.json();
      const c = data.company;
      setCompanyId(c.id);
      setName(c.name || "");
      setDescription(c.description || "");
      setWebsite(c.website || "");
      setPhone(c.phone || "");
      setStreet(c.street || "");
      setCity(c.city || "");
      setState(c.state || "");
      setZip(c.zip || "");
      setSelectedCats(data.categories || []);
      setMyCommunities(data.communities || []);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  useEffect(() => {
    fetch("/api/categories?taxonomy=company").then(r => r.json()).then(d => setAllCategories(d.categories || []));
  }, []);

  useEffect(() => {
    if (communitySearch.length < 2) { setCommunityResults([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/communities/search?q=${encodeURIComponent(communitySearch)}&limit=8`)
        .then(r => r.json()).then(d => setCommunityResults(d.communities || []));
    }, 300);
    return () => clearTimeout(t);
  }, [communitySearch]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/company/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, description, website, phone, street, city, state, zip }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error);
      }

      await fetch("/api/company/profile/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ categoryIds: selectedCats.map(c => c.id) }),
      });

      setSuccess("Profile saved!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message);
    }
    setSaving(false);
  };

  const toggleCategory = (cat: Category) => {
    if (selectedCats.find(c => c.id === cat.id)) {
      setSelectedCats(selectedCats.filter(c => c.id !== cat.id));
    } else if (selectedCats.length < 5) {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleAddCommunity = async (communityId: string) => {
    setAddingCommunity(true);
    try {
      const res = await fetch("/api/company/communities/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ communityId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      if (data.added) {
        await loadProfile();
        setCommunitySearch("");
        setCommunityResults([]);
      }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (err: any) {
      setError(err.message);
    }
    setAddingCommunity(false);
  };

  const handleRemoveCommunity = async (communityId: string) => {
    try {
      const res = await fetch(`/api/company/communities/${communityId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMyCommunities(myCommunities.filter(c => c.id !== communityId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center"><p className="text-coffee-brown/40 dark:text-white/30">Loading...</p></div>;
  }

  if (!companyId) {
    return (
      <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Building2 className="h-12 w-12 mx-auto text-coffee-brown/20 dark:text-white/15 mb-3" />
          <h1 className="text-xl font-bold text-charcoal dark:text-white mb-2">No Company Found</h1>
          <p className="text-coffee-brown/50 dark:text-white/40 text-sm mb-4">You haven't claimed a business yet. Browse companies to find and claim yours.</p>
          <Link href="/companies">
            <button className="px-5 py-2.5 rounded-2xl text-sm font-semibold bg-gradient-to-r from-navy to-[#2d5490] text-white shadow-lg">Browse Companies</button>
          </Link>
        </div>
      </div>
    );
  }

  const filteredCats = catSearch
    ? allCategories.filter(c => c.name.toLowerCase().includes(catSearch.toLowerCase()))
    : allCategories;

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-charcoal dark:text-white">Edit Company Profile</h1>
          <Link href="/dashboard">
            <button className="text-sm text-coffee-brown/50 dark:text-white/40 hover:text-charcoal dark:hover:text-white">← Dashboard</button>
          </Link>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-terracotta-red/10 text-terracotta-red text-sm font-medium border border-terracotta-red/20 mb-4">{error}</div>
        )}
        {success && (
          <div className="p-3 rounded-xl bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium border border-green-500/20 mb-4">{success}</div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="neu-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-4">Business Info</h2>
            <div className="flex items-center gap-4 mb-5">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-navy to-[#2d5490] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-2xl">{name.charAt(0) || "?"}</span>
              </div>
              <p className="text-xs text-coffee-brown/40 dark:text-white/30">Image upload coming soon</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Business Name *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} required className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
              </div>
              <div>
                <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Description</Label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} maxLength={500} rows={3} className="mt-1 w-full rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 p-3 text-sm dark:text-white resize-none focus:ring-2 focus:ring-navy/20 dark:focus:ring-gold/20" />
                <p className="text-xs text-coffee-brown/40 dark:text-white/25 mt-1">{description.length}/500</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Website</Label>
                  <Input value={website} onChange={e => setWebsite(e.target.value)} type="url" placeholder="https://" className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Phone</Label>
                  <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="(555) 123-4567" className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="neu-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-4">Address</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">Street</Label>
                <Input value={street} onChange={e => setStreet(e.target.value)} className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">City</Label>
                  <Input value={city} onChange={e => setCity(e.target.value)} className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
                </div>
                <div>
                  <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">State</Label>
                  <select value={state} onChange={e => setState(e.target.value)} className="mt-1 w-full h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 px-3 text-sm dark:text-white">
                    <option value="">Select</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-sm font-medium text-charcoal/80 dark:text-white/70">ZIP</Label>
                  <Input value={zip} onChange={e => setZip(e.target.value)} className="mt-1 h-11 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white" />
                </div>
              </div>
            </div>
          </div>

          <div className="neu-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-2">Categories</h2>
            <p className="text-xs text-coffee-brown/40 dark:text-white/25 mb-3">Select up to 5 categories ({selectedCats.length}/5)</p>

            {selectedCats.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {selectedCats.map(c => (
                  <span key={c.id} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-navy/10 dark:bg-gold/10 text-sm text-navy dark:text-gold font-medium">
                    {c.name}
                    <button type="button" onClick={() => toggleCategory(c)} className="hover:text-terracotta-red"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
            )}

            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-brown/30 dark:text-white/20" />
              <Input value={catSearch} onChange={e => setCatSearch(e.target.value)} placeholder="Search categories..." className="pl-10 h-10 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white text-sm" />
            </div>
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredCats.map(c => {
                const isSelected = selectedCats.some(s => s.id === c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCategory(c)}
                    disabled={!isSelected && selectedCats.length >= 5}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${isSelected ? "bg-navy/10 dark:bg-gold/10 text-navy dark:text-gold font-medium" : "hover:bg-black/5 dark:hover:bg-white/5 text-charcoal/70 dark:text-white/50"} disabled:opacity-30`}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="neu-card rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-charcoal dark:text-white mb-2">Communities</h2>
            <p className="text-xs text-coffee-brown/40 dark:text-white/25 mb-3">
              First community is free. Additional communities cost $2 each (one-time).
            </p>

            {myCommunities.length > 0 && (
              <div className="space-y-2 mb-4">
                {myCommunities.map(c => (
                  <div key={c.id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#eef0f5] dark:bg-[#151515]">
                    <span className="text-sm text-charcoal dark:text-white">{c.displayName}</span>
                    {myCommunities.length > 1 && (
                      <button type="button" onClick={() => handleRemoveCommunity(c.id)} className="text-coffee-brown/40 hover:text-terracotta-red dark:text-white/30">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-coffee-brown/30 dark:text-white/20" />
              <Input
                value={communitySearch}
                onChange={e => setCommunitySearch(e.target.value)}
                placeholder="Search counties to add..."
                className="pl-10 h-10 rounded-xl bg-[#eef0f5] dark:bg-[#151515] border-0 shadow-inner shadow-black/5 dark:text-white text-sm"
              />
              {communityResults.length > 0 && (
                <div className="absolute z-10 top-11 left-0 right-0 neu-card rounded-xl p-2 max-h-48 overflow-y-auto">
                  {communityResults.filter(c => !myCommunities.some(m => m.id === c.id)).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      disabled={addingCommunity}
                      onClick={() => handleAddCommunity(c.id)}
                      className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-navy/10 dark:hover:bg-white/10 text-charcoal dark:text-white flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" /> {c.displayName}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-12 rounded-2xl text-sm font-semibold bg-gradient-to-r from-navy to-[#2d5490] text-white shadow-lg shadow-navy/25 hover:shadow-xl hover:-translate-y-px transition-all duration-300 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
