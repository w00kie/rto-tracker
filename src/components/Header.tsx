import { Link } from "@tanstack/react-router";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold">🏢 RTO Tracker</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium hover:underline">
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}
