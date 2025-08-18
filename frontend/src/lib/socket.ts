import { io, Socket } from "socket.io-client"
import type { ChatMessage } from "@/state/chatStore"

export type ServerToClientEvents = {
  room_joined: (init: { messages: ChatMessage[] }) => void
  message_new: (m: ChatMessage) => void
  typing_update: (payload: { anonSessionId: string; typing: boolean }) => void
}

export type ClientToServerEvents = {
  join_room: (payload: { roomId: string; anonSessionId: string }) => void
  leave_room: (payload: { roomId: string }) => void
  message_send: (payload: Omit<ChatMessage, "id" | "createdAt">) => void
  typing: (payload: {
    roomId: string
    anonSessionId: string
    typing: boolean
  }) => void
}

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

const envWs = import.meta.env.VITE_WS_URL as string | undefined

export function getSocket() {
  if (socket) return socket

  socket = io(envWs, {
    transports: ["websocket"],
    withCredentials: false,
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 500,
    reconnectionDelayMax: 5000,
    timeout: 10000,
    path: "/socket.io",
  })

  if (import.meta.env.DEV) {
    socket.on("connect_error", (err) =>
      console.error("[socket] connect_error", err)
    )
    socket.on("disconnect", (reason) =>
      console.log("[socket] disconnected", reason)
    )
    ;(socket as Socket).on("reconnect_attempt", (n) =>
      console.log("[socket] reconnect_attempt", n)
    )
    ;(socket as Socket).on("reconnect", (n) =>
      console.log("[socket] reconnected", n)
    )
  }
  return socket
}

export function isConnected() {
  return !!(socket && socket.connected)
}

export function closeSocket() {
  if (socket) {
    socket.close()
    socket = null
  }
}

export function joinRoom(roomId: string, anonSessionId: string) {
  const s = getSocket()
  s.emit("join_room", { roomId, anonSessionId })
}

export function sendMessage(payload: Omit<ChatMessage, "id" | "createdAt">) {
  const s = getSocket()
  s.emit("message_send", payload)
}

export function leaveRoom(roomId: string) {
  const s = getSocket()
  s.emit("leave_room", { roomId })
}

export function sendTyping(
  roomId: string,
  anonSessionId: string,
  typing: boolean
) {
  const s = getSocket()
  s.emit("typing", { roomId, anonSessionId, typing })
}
