import { useEffect, useMemo, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import {
  getSocket,
  joinRoom,
  leaveRoom,
  sendMessage,
  sendTyping,
} from "@/lib/socket"
import { getAnonSessionId } from "@/lib/session"
import { useChatStore, type ChatMessage } from "@/state/chatStore"
import ChatMessageBubble from "@/components/ChatMessage"
import RoomHeader from "@/components/RoomHeader"
import TypingBubble from "@/components/TypingBubble"

function displayName(id: string | undefined) {
  if (!id) return "User"
  return id.slice(0, 2).toUpperCase()
}

export default function RoomChat() {
  const { roomId = "" } = useParams()
  const selfId = useMemo(() => getAnonSessionId(), [])
  const { messages, addMessage, setMessages, clear } = useChatStore()
  const [joined, setJoined] = useState(false)
  const [text, setText] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null)

  // map of other users currently typing -> expiry timestamp
  const [typers, setTypers] = useState<Record<string, number>>({})
  const typingTimer = useRef<number | undefined>(undefined)
  const lastStartSent = useRef(0)

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

    // typing presence from others in the room
    socket.on(
      "typing_update",
      ({
        anonSessionId,
        typing,
      }: {
        anonSessionId: string
        typing: boolean
      }) => {
        if (anonSessionId === selfId) return
        setTypers((prev) => {
          const copy = { ...prev }
          if (typing)
            copy[anonSessionId] = Date.now() + 1500 // 1.5s expiry window
          else delete copy[anonSessionId]
          return copy
        })
      }
    )

    return () => {
      // leave previous room before navigating away
      leaveRoom(roomId)
      if (typingTimer.current) window.clearTimeout(typingTimer.current)
      // send stop-typing on exit (best-effort)
      sendTyping(roomId, selfId, false)

      socket.off("room_joined")
      socket.off("message_new")
      socket.off("typing_update")
    }
  }, [roomId, selfId, addMessage, setMessages, clear])

  // Periodically prune stale typers
  useEffect(() => {
    const iv = setInterval(() => {
      setTypers((prev) => {
        const now = Date.now()
        const out: Record<string, number> = {}
        for (const [k, exp] of Object.entries(prev)) if (exp > now) out[k] = exp
        return out
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [])

  const pingTyping = () => {
    const now = Date.now()
    // rate-limit start typing signal
    if (now - lastStartSent.current > 1500) {
      sendTyping(roomId, selfId, true)
      lastStartSent.current = now
    }
    if (typingTimer.current) window.clearTimeout(typingTimer.current)
    typingTimer.current = window.setTimeout(() => {
      sendTyping(roomId, selfId, false)
    }, 2000)
  }

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
    sendTyping(roomId, selfId, false)
  }

  const onEnter = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Build a friendly label: e.g., "AB is typing…", "AB and CD are typing…", "AB, CD and 1 other are typing…"
  const typingIds = Object.keys(typers).filter((id) => id !== selfId)
  const typingNames = typingIds.map(displayName)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (textarea) {
      // Reset height so scrollHeight is correct
      textarea.style.height = "auto"

      // Calculate line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10)

      // Calculate max height (4 rows max)
      const maxHeight = lineHeight * 4

      // Clamp height between 2.5rem and 4 rows
      textarea.style.height = Math.min(textarea.scrollHeight, maxHeight) + "px"
    }
  }, [text])

  return (
    <div className="h-[100dvh] p-4 sm:p-6 flex flex-col gap-4">
      <RoomHeader roomId={roomId} />

      <div className="flex-1 rounded-2xl border p-4 bg-white/70 dark:bg-black/40 backdrop-blur flex flex-col min-h-0">
        <div className="text-xs text-neutral-500 flex gap-4">
          <span>Status: {joined ? "Joined" : "Joining…"}</span>
        </div>

        <div className="flex flex-col flex-1 justify-end min-h-0 relative">
          <div
            className="flex-1 overflow-y-auto rounded-2xl p-2 bg-neutral-50 dark:bg-neutral-900/60 scroll-pb-12"
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
          {typingNames.length > 0 && (
            <div className="absolute left-0 right-0 bottom-0 px-4 pb-2 z-10">
              <TypingBubble names={typingNames} />
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2 pb-[env(safe-area-inset-bottom)]">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              pingTyping()
            }}
            onKeyDown={(e) => {
              onEnter(e)
              pingTyping()
            }}
            placeholder="Type a message…"
            className="flex-1 rounded-2xl border px-3 py-2 bg-transparent"
            rows={1}
            style={{ minHeight: "2.5rem" }}
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
