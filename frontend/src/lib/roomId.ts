// src/lib/roomId.ts
export function normalizeRoomId(input: string): string {
  return (input || "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 6)
    .toLowerCase()
}

export function isValidRoomId(id: string): boolean {
  return /^[a-z0-9]{4,6}$/.test(id)
}

export function generateRoomId(len?: number): string {
  const length = len ?? 4 + Math.floor(Math.random() * 3) // 4–6
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
  let roomId = ""
  for (let i = 0; i < length; i++)
    roomId += chars[Math.floor(Math.random() * chars.length)]
  return roomId
}
