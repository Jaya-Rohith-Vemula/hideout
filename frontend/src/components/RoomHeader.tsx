import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { DoorOpen, Clipboard } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoomHeader({ roomId }: { roomId: string }) {
  const nav = useNavigate()
  const handleShare = async () => {
    const url = `${location.origin}/r/${roomId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied", {
        description: "Room link copied to clipboard.",
        position: "top-center",
        closeButton: true,
      })
    } catch {
      prompt("Copy room link:", url)
    }
  }

  return (
    <div className="p-4 rounded-2xl border bg-white/70 dark:bg-black/40 backdrop-blur flex items-center justify-between">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Room</h1>
        <p className="text-xs text-neutral-500">ID: {roomId}</p>
      </div>
      <div>
        <div className="flex flex-row gap-3">
          <Button
            size="lg"
            style={{ cursor: "pointer" }}
            onClick={() => nav("/")}
          >
            Leave
            <DoorOpen />
          </Button>

          <Button size="lg" style={{ cursor: "pointer" }} onClick={handleShare}>
            Share
            <Clipboard />
          </Button>
        </div>
      </div>
    </div>
  )
}
