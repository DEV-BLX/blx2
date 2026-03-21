export interface NavItem {
  label: string;
  path: string;
}

export const visitorNav: NavItem[] = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Tools", path: "/tools" },
  { label: "Assessment", path: "/assessment" },
  { label: "Kitchen Access", path: "/kitchen" },
  { label: "Book", path: "/book" },
  { label: "Consultants", path: "/consultants" },
];

export const companyNav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Owner Exchange", path: "/owner-exchange" },
  { label: "Saved", path: "/saved" },
  { label: "Kitchen Access", path: "/kitchen" },
  { label: "Book", path: "/book" },
  { label: "Company Card", path: "/company-card" },
  { label: "Notifications", path: "/notifications" },
  { label: "Account", path: "/account" },
];

export const consumerNav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Echo Pricing", path: "/echo-pricing" },
  { label: "Saved", path: "/saved" },
  { label: "Credits", path: "/credits" },
  { label: "Challenges", path: "/challenges" },
  { label: "Notifications", path: "/notifications" },
  { label: "Account", path: "/account" },
];

export const consultantNav: NavItem[] = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Bookings", path: "/bookings" },
  { label: "Posts", path: "/posts" },
  { label: "Profile", path: "/profile" },
  { label: "Compensation", path: "/compensation" },
  { label: "Notifications", path: "/notifications" },
  { label: "Account", path: "/account" },
];

export const adminNav: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Companies", path: "/admin/companies" },
  { label: "Consumers", path: "/admin/consumers" },
  { label: "Consultants", path: "/admin/consultants" },
  { label: "Bookings", path: "/admin/bookings" },
  { label: "Owner Exchange", path: "/admin/owner-exchange" },
  { label: "Echo Pricing", path: "/admin/echo-pricing" },
  { label: "Credits", path: "/admin/credits" },
  { label: "Finance", path: "/admin/finance" },
  { label: "Notifications", path: "/admin/notifications" },
  { label: "Joe's Playbook", path: "/admin/joe" },
  { label: "Audit Logs", path: "/admin/audit-logs" },
  { label: "Settings", path: "/admin/settings" },
];

export function getNavForRole(role: string | undefined): NavItem[] {
  switch (role) {
    case "company": return companyNav;
    case "consumer": return consumerNav;
    case "consultant": return consultantNav;
    case "admin":
    case "super_admin":
    case "content_admin":
    case "support_admin":
    case "finance_admin":
      return adminNav;
    default: return visitorNav;
  }
}
