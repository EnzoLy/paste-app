import { Lock, Github } from "lucide-react";
import { ThemeSwitcher } from "./theme-switcher";
import { Button } from "./ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="w-full border-b border-b-foreground/10">
      <div className="mx-auto flex justify-between items-center p-4 px-5">
        <Link href="/" className="flex items-center gap-2 font-semibold text-lg">
          <Lock className="h-5 w-5" />
          Secure Paste
        </Link>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            asChild
          >
            <a
              href="https://github.com/EnzoLy/paste-app"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="h-5 w-5" />
            </a>
          </Button>
          <ThemeSwitcher />
        </div>
      </div>
    </nav>
  );
}