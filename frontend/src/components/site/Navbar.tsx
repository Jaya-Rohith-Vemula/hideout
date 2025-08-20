import { MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import ThemeToggle from "./ThemeToggle"

export default function Navbar() {
  return (
    <header className="bg-background/70 backdrop-blur border-b">
      <div className="container mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 grid place-items-center rounded-xl bg-black text-white dark:bg-white dark:text-black">
            <MessageSquare size={16} />
          </div>
          <span className="font-semibold tracking-tight">Hide Out</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a href="https://x.com/Rohith_Vemula99" target="_blank">
            <Button variant="ghost" size="sm" style={{ cursor: "pointer" }}>
              Connect
            </Button>
          </a>
          <a
            href="https://github.com/Jaya-Rohith-Vemula/hideout"
            target="_blank"
          >
            <Button variant="outline" size="sm" style={{ cursor: "pointer" }}>
              GitHub
            </Button>
          </a>
        </div>
      </div>
    </header>
  )
}
