import { toast } from "sonner"

export default function RoomHeader({ roomId }: { roomId: string }) {
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
      <button
        onClick={handleShare}
        className="px-3 py-2 text-sm rounded-2xl bg-black text-white dark:bg-white dark:text-black"
      >
        Share
      </button>
    </div>
  )
}
