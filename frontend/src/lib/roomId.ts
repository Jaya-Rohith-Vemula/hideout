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
