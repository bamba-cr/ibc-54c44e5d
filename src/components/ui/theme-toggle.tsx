import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="relative">
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden rounded-full bg-secondary/20 hover:bg-secondary/30 transition-all duration-300"
      aria-label={theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
    >
      <Sun className={`h-5 w-5 transition-all duration-500 ${
        theme === "dark" 
          ? "rotate-90 scale-0 opacity-0" 
          : "rotate-0 scale-100 opacity-100"
      }`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-500 ${
        theme === "dark" 
          ? "rotate-0 scale-100 opacity-100" 
          : "-rotate-90 scale-0 opacity-0"
      }`} />
    </Button>
  );
}
