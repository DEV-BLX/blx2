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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-navy text-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-gold">BLX</span>
          <span className="hidden sm:inline text-sm font-normal text-white/80">Blue Label Exchange</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.path} href={item.path}>
              <span
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                  location === item.path
                    ? "bg-white/15 text-gold"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                {item.label}
              </span>
            </Link>
          ))}

          {!user ? (
            <div className="flex items-center gap-2 ml-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button size="sm" className="bg-gold text-charcoal hover:bg-gold/90 font-semibold">
                  Sign Up
                </Button>
              </Link>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-white/80 hover:text-white hover:bg-white/10 ml-3"
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-1" />
              Logout
            </Button>
          )}
        </nav>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="sm" className="text-white">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72 bg-navy border-navy text-white p-0">
            <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
              <span className="font-bold text-lg">
                <span className="text-gold">BLX</span> Menu
              </span>
            </div>
            <nav className="flex flex-col p-4 gap-1">
              {navItems.map((item) => (
                <Link key={item.path} href={item.path} onClick={() => setMobileOpen(false)}>
                  <span
                    className={`block px-3 py-2.5 rounded-md text-sm font-medium cursor-pointer ${
                      location === item.path
                        ? "bg-white/15 text-gold"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
              <div className="border-t border-white/10 mt-3 pt-3">
                {!user ? (
                  <>
                    <Link href="/sign-in" onClick={() => setMobileOpen(false)}>
                      <span className="block px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 cursor-pointer">
                        Sign In
                      </span>
                    </Link>
                    <Link href="/sign-up" onClick={() => setMobileOpen(false)}>
                      <span className="block px-3 py-2.5 rounded-md text-sm font-semibold bg-gold text-charcoal hover:bg-gold/90 mt-1 text-center cursor-pointer">
                        Sign Up
                      </span>
                    </Link>
                  </>
                ) : (
                  <button
                    onClick={() => { logout(); setMobileOpen(false); }}
                    className="w-full text-left px-3 py-2.5 rounded-md text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
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
