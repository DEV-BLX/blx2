import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { getNavForRole } from "@/lib/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogOut } from "lucide-react";

export function Header() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navItems = getNavForRole(user?.role);

  return (
    <header className="sticky top-0 z-50 w-full glass-header">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-[#d4b55c] shadow-lg shadow-gold/20 transition-transform group-hover:scale-105">
            <span className="text-navy font-black text-sm tracking-tight">BLX</span>
          </div>
          <span className="hidden sm:block text-sm font-medium text-white/70 tracking-wide">
            Blue Label Exchange
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span
                className={`px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer ${
                  location === item.path
                    ? "bg-white/12 text-white shadow-inner shadow-white/5 backdrop-blur-sm"
                    : "text-white/60 hover:text-white/90 hover:bg-white/6"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          <div className="w-px h-6 bg-white/10 mx-3" />

          {!user ? (
            <div className="flex items-center gap-2">
              <Link href="/sign-in">
                <span className="px-4 py-2 rounded-xl text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/6 transition-all cursor-pointer">
                  Sign In
                </span>
              </Link>
              <Link href="/sign-up">
                <span className="px-5 py-2 rounded-xl text-[13px] font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-md shadow-gold/25 hover:shadow-lg hover:shadow-gold/30 hover:-translate-y-px transition-all cursor-pointer">
                  Get Started
                </span>
              </Link>
            </div>
          ) : (
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/60 hover:text-white/90 hover:bg-white/8 transition-all"
              onClick={logout}
            >
              <LogOut className="h-3.5 w-3.5" />
              Logout
            </button>
          )}
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button className="flex h-10 w-10 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/8 transition-all">
              <Menu className="h-5 w-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 border-0 p-0 depth-gradient text-white">
            <div className="px-6 pt-6 pb-4 border-b border-white/8">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gold to-[#d4b55c] shadow-lg shadow-gold/20">
                  <span className="text-navy font-black text-sm">BLX</span>
                </div>
                <span className="text-sm font-medium text-white/70">Menu</span>
              </div>
            </div>
            <nav className="flex flex-col p-4 gap-0.5">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                  <span
                    className={`block px-4 py-3 rounded-xl text-sm font-medium cursor-pointer transition-all ${
                      location === item.path
                        ? "bg-white/12 text-white shadow-inner shadow-white/5"
                        : "text-white/60 hover:text-white/90 hover:bg-white/6"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="border-t border-white/8 mt-4 pt-4">
                {!user ? (
                  <>
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                      <span className="block px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/6 cursor-pointer">
                        Sign In
                      </span>
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                      <span className="block mt-2 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy text-center shadow-md shadow-gold/25 cursor-pointer">
                        Get Started
                      </span>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:text-white/90 hover:bg-white/6 transition-all"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
