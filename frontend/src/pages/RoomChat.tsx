// src/pages/RoomChat.tsx
import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { getSocket, joinRoom, leaveRoom, sendMessage } from "@/lib/socket"
import { getAnonSessionId } from "@/lib/session"
import { useChatStore, type ChatMessage } from "@/state/chatStore"
import ChatMessageBubble from "@/components/ChatMessage"
import RoomHeader from "@/components/RoomHeader"

export default function RoomChat() {
  const { roomId = "" } = useParams()
  const selfId = useMemo(() => getAnonSessionId(), [])
  const { messages, addMessage, setMessages, clear } = useChatStore()
  const [joined, setJoined] = useState(false)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const socket = getSocket()

    // reflect socket-level connectivity immediately on route change
    setJoined(false)

    // join this room
    joinRoom(roomId, selfId)

    // initial history signals "joined" when it arrives
    socket.on("room_joined", (init: { messages: ChatMessage[] }) => {
      clear()
      setMessages(init?.messages || [])
      setJoined(true)
    })

    // live messages
    socket.on("message_new", (m: ChatMessage) => addMessage(m))

    return () => {
      // leave previous room before navigating away
      leaveRoom(roomId)
      socket.off("room_joined")
      socket.off("message_new")
    }
  }, [roomId, selfId, addMessage, setMessages, clear])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages.length])

  const send = () => {
    const t = text.trim()
    if (!t) return
    const msg: Omit<ChatMessage, "id" | "createdAt"> = {
      roomId,
      senderAnonSessionId: selfId,
      content: t,
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

      <div className="flex-1 rounded-2xl border p-4 bg-white/70 dark:bg-black/40 backdrop-blur flex flex-col min-h-0">
        <div className="text-xs text-neutral-500 flex gap-4">
          <span>Status: {joined ? "Joined" : "Joining…"}</span>
        </div>

        <div
          className="flex-1 overflow-y-auto rounded-2xl p-2 bg-neutral-50 dark:bg-neutral-900/60"
          id="chat-messages"
        >
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
