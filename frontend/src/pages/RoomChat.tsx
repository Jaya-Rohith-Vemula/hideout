import { useEffect, useMemo, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getSocket, joinRoom, sendMessage } from "../lib/socket"
import { getAnonSessionId } from "../lib/session"
import { useChatStore, type ChatMessage } from "../state/chatStore"
import ChatMessageBubble from "../components/ChatMessage"
import RoomHeader from "../components/RoomHeader"
import { normalizeRoomId, isValidRoomId } from "../lib/roomId"

export default function RoomChat() {
  const { roomId = "" } = useParams()
  const selfId = useMemo(() => getAnonSessionId(), [])
  const { messages, addMessage, setMessages, clear } = useChatStore()
  const [connected, setConnected] = useState(false)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  const nav = useNavigate()
  useEffect(() => {
    const normalized = normalizeRoomId(roomId || "")
    if (!isValidRoomId(normalized)) {
      nav("/", { replace: true })
    }
  }, [roomId, nav])

  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => setConnected(true)
    const onDisconnect = () => setConnected(false)

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    joinRoom(roomId, selfId)

    socket.on("room_joined", (init: { messages: ChatMessage[] }) => {
      clear()
      setMessages(init?.messages || [])
    })

    socket.on("message_new", (m: ChatMessage) => addMessage(m))

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("room_joined")
      socket.off("message_new")
    }
  }, [roomId, selfId, addMessage, setMessages, clear])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const send = () => {
    const trimmedText = text.trim()
    if (!trimmedText) return
    const msg: Omit<ChatMessage, "id" | "createdAt"> = {
      roomId,
      senderAnonSessionId: selfId,
      content: trimmedText,
    }
    sendMessage(msg)
    setText("")
  }

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="h-[100dvh] p-4 sm:p-6 flex flex-col gap-4">
      <RoomHeader roomId={roomId} />
      <div className="flex-1 rounded-2xl border p-4 bg-white/70 dark:bg-black/40 backdrop-blur flex flex-col">
        <div className="text-xs text-neutral-500">
          Status: {connected ? "Connected" : "Disconnected"}
        </div>

        <div className="flex-1 overflow-y-auto rounded-2xl p-2 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="px-2">
            {messages.map((m) => (
              <ChatMessageBubble
                key={m.id + m.createdAt}
                m={m}
                selfId={selfId}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="flex gap-2 pt-2 pb-[env(safe-area-inset-bottom)]">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onEnter}
            placeholder="Type a message…"
            className="flex-1 rounded-2xl border px-3 py-2 bg-transparent"
          />
          <button
            onClick={send}
            className="rounded-2xl px-4 py-2 bg-black text-white dark:bg-white dark:text-black"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
