import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { normalizeRoomId, isValidRoomId } from "@/lib/roomId"
import { createRoom } from "@/lib/api"

export default function Landing() {
  const nav = useNavigate()

  // Creation mode: "random" vs "custom"
  const [mode, setMode] = useState<"random" | "custom">("random")
  const [customId, setCustomId] = useState("")
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Join input
  const [joinId, setJoinId] = useState("")

  const onCreateRandom = async () => {
    setCreateError(null)
    setCreating(true)
    try {
      // Let BE allocate a unique ID so user never sees "ID taken"
      const { id } = await createRoom()
      nav(`/r/${id}`)
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not create room. Please try again."
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const onCreateCustom = async () => {
    setCreateError(null)
    const id = normalizeRoomId(customId)
    if (!isValidRoomId(id)) return
    setCreating(true)
    try {
      const res = await createRoom(id) // BE checks uniqueness
      nav(`/r/${res.id}`)
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not create room. Please try again."
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const onJoin = () => {
    const id = normalizeRoomId(joinId)
    if (isValidRoomId(id)) nav(`/r/${id}`)
  }

  const onJoinEnter: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") onJoin()
  }

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md p-6 rounded-2xl border bg-white/70 dark:bg-black/40 backdrop-blur space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Hide Out</h1>
        <p className="text-sm text-neutral-500">
          Create an unlisted room or join one by ID. Room IDs are 4–6 characters
          (a–z, 0–9).
        </p>

        <div className="space-y-3">
          <div className="inline-flex rounded-2xl border overflow-hidden">
            <button
              className={`px-4 py-2 text-sm ${
                mode === "random"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-transparent"
              }`}
              onClick={() => setMode("random")}
            >
              Random
            </button>
            <button
              className={`px-4 py-2 text-sm ${
                mode === "custom"
                  ? "bg-black text-white dark:bg-white dark:text-black"
                  : "bg-transparent"
              }`}
              onClick={() => setMode("custom")}
            >
              Custom
            </button>
          </div>

          {mode === "random" ? (
            <div className="grid gap-2">
              <button
                onClick={onCreateRandom}
                disabled={creating}
                className="rounded-2xl px-4 py-2 bg-black text-white dark:bg-white dark:text-black disabled:opacity-60"
              >
                {creating ? "Creating…" : "Create random room"}
              </button>
              <p className="text-xs text-neutral-500">
                We’ll generate a unique 4–6 character ID like <code>7q4k</code>{" "}
                or <code>n2x8c1</code>.
              </p>
            </div>
          ) : (
            <div className="grid gap-2">
              <label className="text-sm">Choose your room ID</label>
              <div className="flex gap-2 items-center">
                <input
                  value={customId}
                  onChange={(e) => setCustomId(normalizeRoomId(e.target.value))}
                  placeholder="e.g. chat4"
                  className="flex-1 rounded-2xl border px-3 py-2 bg-transparent tracking-wider"
                  maxLength={6}
                />
                <button
                  onClick={onCreateCustom}
                  disabled={
                    !isValidRoomId(normalizeRoomId(customId)) || creating
                  }
                  className="rounded-2xl px-4 py-2 border disabled:opacity-50"
                >
                  {creating ? "Creating…" : "Create"}
                </button>
              </div>
              <p className="text-xs text-neutral-500">
                Must be 4–6 alphanumeric characters (a–z, 0–9).
              </p>
            </div>
          )}

          {createError && <p className="text-xs text-red-500">{createError}</p>}
        </div>

        <div className="grid gap-2">
          <label className="text-sm">Join room by ID</label>
          <div className="flex gap-2">
            <input
              value={joinId}
              onChange={(e) => setJoinId(normalizeRoomId(e.target.value))}
              onKeyDown={onJoinEnter}
              placeholder="Room ID"
              className="flex-1 rounded-2xl border px-3 py-2 bg-transparent tracking-wider"
              maxLength={6}
            />
            <button onClick={onJoin} className="rounded-2xl px-4 py-2 border">
              Join
            </button>
          </div>
        </div>

        <p className="text-xs text-neutral-500">
          No login needed. Share the room link with your friend to start
          chatting.
        </p>
      </div>
    </div>
  )
}
