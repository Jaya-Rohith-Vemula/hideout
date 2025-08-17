import { create } from "zustand"

export type ChatMessage = {
  id: string
  roomId: string
  senderAnonSessionId?: string
  senderUserId?: string
  content: string
  createdAt: string // ISO string
}

type State = {
  messages: ChatMessage[]
  status: "disconnected" | "connecting" | "connected"
}

type Actions = {
  setStatus: (s: State["status"]) => void
  addMessage: (m: ChatMessage) => void
  setMessages: (ms: ChatMessage[]) => void
  clear: () => void
}

export const useChatStore = create<State & Actions>((set) => ({
  messages: [],
  status: "disconnected",
  setStatus: (s) => set({ status: s }),
  addMessage: (m) => set((st) => ({ messages: [...st.messages, m] })),
  setMessages: (ms) => set({ messages: ms }),
  clear: () => set({ messages: [] }),
}))
