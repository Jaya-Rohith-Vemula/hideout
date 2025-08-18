import express from "express"
import cors from "cors"
import { createServer } from "http"
import { Server as IOServer } from "socket.io"
import { env, getCorsOrigins } from "./env"
import { prisma } from "./db"
import { generateRoomId, isValidRoomId, normalizeRoomId } from "./roomId"

const app = express()
app.use(express.json({ limit: "64kb" }))

const corsOrigins = getCorsOrigins()
app.use(cors({ origin: corsOrigins, credentials: false }))

app.get("/health", (_req, res) => res.json({ ok: true }))

// ---- HTTP + Socket.IO ----
const httpServer = createServer(app)
const io = new IOServer(httpServer, {
  path: "/socket.io",
  cors: { origin: corsOrigins.length ? corsOrigins : true },
  transports: ["websocket"],
})

type ChatMessage = {
  id: string
  roomId: string
  senderAnonSessionId?: string
  senderUserId?: string
  content: string
  createdAt: string
}

io.on("connection", (socket) => {
  // join_room: create room if missing, send last messages, join socket.io room
  socket.on("join_room", async ({ roomId }: { roomId: string }) => {
    const id = normalizeRoomId(roomId)
    if (!isValidRoomId(id)) return

    // Ensure room exists
    await prisma.room.upsert({ where: { id }, update: {}, create: { id } })

    // Join socket room
    socket.join(id)

    // Load last 50 messages
    const recent = await prisma.message.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "asc" },
      take: 50,
    })
    const payload = recent.map(
      (message): ChatMessage => ({
        id: message.id,
        roomId: message.roomId,
        senderAnonSessionId: message.senderAnonSessionId || undefined,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })
    )

    socket.emit("room_joined", { messages: payload })
  })

  // leave_room: remove this socket from the given room
  socket.on("leave_room", ({ roomId }: { roomId: string }) => {
    const id = normalizeRoomId(roomId)
    if (!isValidRoomId(id)) return
    socket.leave(id)
    console.log(`Socket left room ${id}`)
  })

  // message_send: validate, persist, broadcast
  socket.on(
    "message_send",
    async (payload: Omit<ChatMessage, "id" | "createdAt">) => {
      const id = normalizeRoomId(payload.roomId)
      if (!isValidRoomId(id)) return

      const text = (payload.content || "").toString().slice(0, 4000)
      if (!text.trim()) return

      const saved = await prisma.message.create({
        data: {
          roomId: id,
          senderAnonSessionId: payload.senderAnonSessionId,
          content: text,
        },
      })

      const outgoingMessage: ChatMessage = {
        id: saved.id,
        roomId: id,
        senderAnonSessionId: saved.senderAnonSessionId || undefined,
        content: saved.content,
        createdAt: saved.createdAt.toISOString(),
      }

      io.to(id).emit("message_new", outgoingMessage)
    }
  )
})

httpServer.listen(env.PORT, () => {
  console.log(`API + WS listening on http://localhost:${env.PORT}`)
})
