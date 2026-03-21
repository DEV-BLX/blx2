import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-navy mb-2">404</h1>
        <p className="text-lg text-coffee-brown mb-6">Page not found</p>
        <Link href="/">
          <Button className="bg-navy hover:bg-navy/90">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
