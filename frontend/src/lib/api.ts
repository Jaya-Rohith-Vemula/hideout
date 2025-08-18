const BASE = import.meta.env.VITE_API_BASE_URL as string

export async function createRoom(roomId?: string): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/rooms`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(roomId ? { roomId } : {}),
  })

  if (res.ok) return res.json()

  if (res.status === 409) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || "Room id already exists")
  }

  const text = await res.text().catch(() => "")
  throw new Error(`Failed to create room (${res.status}): ${text}`)
}
