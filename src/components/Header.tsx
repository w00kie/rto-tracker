import { Link } from "@tanstack/react-router";
import { useAuthActions } from "@convex-dev/auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

export default function Header() {
  const { signOut } = useAuthActions();

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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => void signOut()}
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </nav>
      </div>
    </header>
  );
}
