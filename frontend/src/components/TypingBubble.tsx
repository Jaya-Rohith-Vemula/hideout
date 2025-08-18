// src/components/TypingBubble.tsx
export default function TypingBubble({ names }: { names: string[] }) {
  const label =
    names.length === 1
      ? `${names[0]} is typing`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are typing`
      : `${names[0]}, ${names[1]} and ${names.length - 2} others are typing`

  return (
    <div className="flex mb-3 gap-2 items-end justify-start">
      <div className="max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow bg-neutral-100 dark:bg-neutral-800 rounded-bl-none">
        <div className="flex items-center gap-2">
          <span className="text-neutral-600 dark:text-neutral-300">
            {label}
          </span>
          <span className="cc-typing-dot" />
          <span className="cc-typing-dot" />
          <span className="cc-typing-dot" />
        </div>
      </div>
    </div>
  )
}
