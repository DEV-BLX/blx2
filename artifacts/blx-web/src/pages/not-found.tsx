import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] neu-page-bg flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-7xl font-bold bg-gradient-to-b from-navy to-navy/40 bg-clip-text text-transparent mb-3">404</h1>
        <p className="text-lg text-coffee-brown/60 font-light mb-8">Page not found</p>
        <Link href="/">
          <span className="inline-flex px-8 py-3 rounded-2xl text-sm font-semibold bg-gradient-to-r from-gold to-[#d4b55c] text-navy shadow-lg shadow-gold/25 hover:shadow-xl hover:shadow-gold/30 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
            Back to Home
          </span>
        </Link>
      </div>
    </div>
  );
}
