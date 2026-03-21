import { Construction } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/services": "Services",
  "/tools": "Tools",
  "/assessment": "Assessment",
  "/kitchen": "Kitchen Access",
  "/book": "Book a Session",
  "/consultants": "Consultants",
  "/dashboard": "Dashboard",
  "/owner-exchange": "Owner Exchange",
  "/saved": "Saved",
  "/company-card": "Company Card",
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
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-gold/20">
          <Construction className="h-8 w-8 text-fox-orange" />
        </div>
        <h1 className="text-2xl font-bold text-charcoal mb-2">{title}</h1>
        <p className="text-coffee-brown">Coming Soon</p>
        <div className="mt-4 h-1 w-24 mx-auto bg-gold rounded-full" />
      </div>
    </div>
  );
}
