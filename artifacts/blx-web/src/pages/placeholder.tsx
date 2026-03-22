import { Construction } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/services": "Services",
  "/tools": "Tools",
  "/assessment": "Assessment",
  "/kitchen": "Kitchen Access",
  "/book": "Book a Session",
  "/consultants": "Consultants",
  "/owner-exchange": "Owner Exchange",
  "/saved": "Saved",
  "/notifications": "Notifications",
  "/account": "Account",
  "/echo-pricing": "Echo Pricing",
  "/credits": "Credits",
  "/challenges": "Challenges",
  "/bookings": "Bookings",
  "/posts": "Posts",
  "/profile": "Profile",
  "/compensation": "Compensation",
  "/admin/dashboard": "Admin Dashboard",
  "/admin/companies": "Companies",
  "/admin/consumers": "Consumers",
  "/admin/consultants": "Consultants",
  "/admin/bookings": "Bookings",
  "/admin/owner-exchange": "Owner Exchange",
  "/admin/echo-pricing": "Echo Pricing",
  "/admin/credits": "Credits",
  "/admin/finance": "Finance",
  "/admin/notifications": "Notifications",
  "/admin/joe": "Joe's Playbook",
  "/admin/audit-logs": "Audit Logs",
  "/admin/settings": "Settings",
};

export default function Placeholder({ path }: { path: string }) {
  const title = pageTitles[path] || "Page";

  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="neu-icon mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl">
          <Construction className="h-9 w-9 text-fox-orange" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal dark:text-white mb-2">{title}</h1>
        <p className="text-coffee-brown/60 dark:text-white/40 font-light">Coming Soon</p>
        <div className="mt-5 h-1 w-16 mx-auto rounded-full bg-gradient-to-r from-gold to-[#d4b55c]" />
      </div>
    </div>
  );
}
