import type { ChatMessage } from "../state/chatStore"

export default function ChatMessageBubble({
  m,
  selfId,
}: {
  m: ChatMessage
  selfId: string
}) {
  const mine = m.senderAnonSessionId === selfId
  return (
    <div
      className={`flex mb-3 gap-2 items-end ${
        mine ? "justify-end" : "justify-start"
      }`}
    >
      {!mine && (
        <div className="h-8 w-8 rounded-full grid place-items-center bg-neutral-200 dark:bg-neutral-700 text-xs">
          {(m.senderAnonSessionId || "U").slice(0, 2).toUpperCase()}
        </div>
      )}
      <div
        className={`${
          mine
            ? "bg-black text-white dark:bg-white dark:text-black rounded-br-none"
            : "bg-neutral-100 dark:bg-neutral-800 rounded-bl-none"
        } max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow`}
      >
        <p className="whitespace-pre-wrap break-words">{m.content}</p>
        <div className="text-[10px] opacity-70 mt-1 text-right">
          {new Date(m.createdAt).toLocaleTimeString()}
        </div>
      </div>
      {mine && (
        <div className="h-8 w-8 rounded-full grid place-items-center bg-neutral-200 dark:bg-neutral-700 text-xs">
          {(selfId || "U").slice(0, 2).toUpperCase()}
        </div>
      )}
    </div>
  )
}
