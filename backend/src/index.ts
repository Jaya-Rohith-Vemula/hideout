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

app.post("/api/rooms", async (req, res) => {
  let { roomId } = req.body || {}

  // If client didn't provide an ID, we'll allocate a unique short ID
  if (!roomId) {
    const MAX_TRIES = 10
    for (let i = 0; i < MAX_TRIES; i++) {
      const newRoomID = normalizeRoomId(generateRoomId())
      const exists = await prisma.room.findUnique({ where: { id: newRoomID } })
      if (!exists) {
        const room = await prisma.room.create({ data: { id: newRoomID } })
        return res.status(201).json({ id: room.id })
      }
    }
    return res
      .status(503)
      .json({ error: "Could not allocate a unique room id, please try again." })
  }

  // Custom ID path: validate & ensure it is not already taken
  roomId = normalizeRoomId(roomId)
  if (!isValidRoomId(roomId))
    return res
      .status(400)
      .json({ error: "Invalid roomId (use 4–6 characters with a–z, 0–9)" })

  try {
    const exists = await prisma.room.findUnique({ where: { id: roomId } })
    if (exists)
      return res.status(409).json({
        error:
          "A room with same ID already exists, please provide a different ID",
        id: roomId,
      })

    const room = await prisma.room.create({ data: { id: roomId } })
    return res.status(201).json({ id: room.id })
  } catch (e) {
    return res.status(500).json({ error: "Failed to create room" })
  }
})

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

    const recent = await prisma.message.findMany({
      where: { roomId: id },
      orderBy: { createdAt: "asc" },
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
  })

  socket.on(
    "typing",
    ({
      roomId,
      anonSessionId,
      typing,
    }: {
      roomId: string
      anonSessionId: string
      typing: boolean
    }) => {
      const id = normalizeRoomId(roomId)
      if (!isValidRoomId(id)) return
      socket.to(id).emit("typing_update", { anonSessionId, typing })
    }
  )

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
