import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun } from "lucide-react"

const THEME_KEY = "cc-theme" // 'light' | 'dark'

function applyTheme(dark: boolean) {
  const root = document.documentElement
  root.classList.toggle("dark", dark)
  // helps native form controls pick the right palette
  root.style.colorScheme = dark ? "dark" : "light"
  try {
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light")
  } catch {
    console.log("Failed to save theme preference to localStorage")
  }
}

export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean>(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false
  )

  useEffect(() => {
    applyTheme(dark)
  }, [dark])

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Toggle dark mode"
      onClick={() => setDark((v) => !v)}
      className="relative rounded-full"
      style={{ cursor: "pointer" }}
    >
      {/* Sun (light) */}
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0" />
      {/* Moon (dark) */}
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
