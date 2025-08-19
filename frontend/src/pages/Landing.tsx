import { useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Shield,
  LockKeyhole,
  Link as LinkIcon,
  Sparkles,
  MousePointerClick,
  AppWindow,
} from "lucide-react"
import Navbar from "@/components/site/Navbar"
import Footer from "@/components/site/Footer"
import { createRoom } from "@/lib/api"
import { normalizeRoomId, isValidRoomId } from "@/lib/roomId"

export default function Landing() {
  const nav = useNavigate()
  const inputsRef = useRef<{ [key: string]: HTMLInputElement | null }>({})

  // Create mode
  const [customId, setCustomId] = useState("")
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Join
  const [joinId, setJoinId] = useState("")

  const onCreateRandom = async () => {
    try {
      setError(null)
      setCreating(true)
      // Ask BE for a unique, short ID
      const { id } = await createRoom()
      nav(`/r/${id}`)
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not create room. Please try again."
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const onCreateCustom = async () => {
    const id = normalizeRoomId(customId)
    if (!isValidRoomId(id))
      return setError("Use 4–6 letters/numbers, e.g. CH4T")
    try {
      setError(null)
      setCreating(true)
      const res = await createRoom(id)
      nav(`/r/${res.id}`)
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : "Could not create room. Please try again."
      setError(message)
    } finally {
      setCreating(false)
    }
  }

  const onJoin = () => {
    const id = normalizeRoomId(joinId)
    if (!isValidRoomId(id)) return setError("Enter a valid 4–6 char room id")
    nav(`/r/${id}`)
  }

  const onFocusCustomInput = () => {
    inputsRef.current["custom"]?.focus()
  }

  const onFocusJoinInput = () => {
    inputsRef.current["join"]?.focus()
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-transparent via-purple-500/5 to-transparent dark:via-purple-500/10">
      <Navbar />
      <main className="flex-grow">
        {/* Hero */}
        <section className="pt-14 md:pt-20 pb-10">
          <div className="container mx-auto px-4 max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="rounded-full">
                No sign‑in required
              </Badge>
              <Badge variant="outline" className="rounded-full">
                Short room IDs
              </Badge>
            </div>
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight">
              Private chat rooms.{" "}
              <span className="text-purple-600 dark:text-purple-400">
                Zero friction.
              </span>
            </h1>
            <p className="mt-4 text-base md:text-lg text-neutral-600 dark:text-neutral-300 max-w-2xl mx-auto">
              Create a secret room in seconds and share a short link. No app
              installs. No logins. Just chat.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={onCreateRandom}
                disabled={creating}
                className="animate-float"
                style={{ cursor: "pointer" }}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {creating ? "Creating…" : "Instant room"}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onFocusCustomInput}
                className="animate-float"
                style={{ animationDelay: "200ms", cursor: "pointer" }}
              >
                <AppWindow className="h-4 w-4 mr-2" /> Custom Room
              </Button>
              <Button
                size="lg"
                onClick={onFocusJoinInput}
                className="animate-float"
                style={{ animationDelay: "400ms", cursor: "pointer" }}
              >
                <MousePointerClick className="h-4 w-4 mr-2" /> Join a room
              </Button>
            </div>
            {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
          </div>
        </section>

        {/* Feature highlights */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-3 gap-4 md:gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LockKeyhole className="h-5 w-5" /> Secret by default
                </CardTitle>
                <CardDescription>
                  No account, no phone number. Share an unlisted link and you’re
                  in.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <LinkIcon className="h-5 w-5" /> Short room IDs
                </CardTitle>
                <CardDescription>
                  Pick your own 4–6 character ID or let us generate one that’s
                  easy to share.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" /> Your device, your data
                </CardTitle>
                <CardDescription>
                  Web‑based and lightweight. Designed to run smoothly without
                  requiring heavy resources.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* Create & Join */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-5xl grid md:grid-cols-2 gap-6">
            {/* Create custom */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle>Create a custom room</CardTitle>
                <CardDescription>
                  Use 4–6 letters/numbers (a–z, 0–9)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    ref={(el) => {
                      inputsRef.current["custom"] = el
                    }}
                    placeholder="e.g. chat4"
                    value={customId}
                    onChange={(e) =>
                      setCustomId(normalizeRoomId(e.target.value))
                    }
                    maxLength={6}
                    className=" tracking-widest"
                  />
                  <Button
                    onClick={onCreateCustom}
                    disabled={
                      creating || !isValidRoomId(normalizeRoomId(customId))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    Create
                  </Button>
                </div>
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <p className="text-xs text-neutral-500">
                  We’ll check availability and create it if free.
                </p>
              </CardContent>
            </Card>

            {/* Join existing */}
            <Card id="join" className="rounded-2xl">
              <CardHeader>
                <CardTitle>Join a room</CardTitle>
                <CardDescription>
                  Enter an existing 4–6 character room ID
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    ref={(el) => {
                      inputsRef.current["join"] = el
                    }}
                    placeholder="paste ID (e.g. 7q4k)"
                    value={joinId}
                    onChange={(e) => setJoinId(normalizeRoomId(e.target.value))}
                    maxLength={6}
                    className=" tracking-widest"
                  />
                  <Button
                    onClick={onJoin}
                    disabled={
                      creating || !isValidRoomId(normalizeRoomId(joinId))
                    }
                    style={{ cursor: "pointer" }}
                  >
                    Join
                  </Button>
                </div>
                <p className="text-xs text-neutral-500">
                  Share the link{" "}
                  <code className="px-1 rounded bg-neutral-100 dark:bg-neutral-800">
                    {location.origin}/r/abcd
                  </code>{" "}
                  to invite.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How it works */}
        <section className="py-6">
          <div className="container mx-auto px-4 max-w-6xl grid md:grid-cols-3 gap-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" /> 1. Create
                </CardTitle>
                <CardDescription>
                  Pick a custom ID or let us generate a short one.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LinkIcon className="h-5 w-5" /> 2. Share
                </CardTitle>
                <CardDescription>
                  Send the link to your friend. Rooms are unlisted and easy to
                  remember.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LockKeyhole className="h-5 w-5" /> 3. Chat
                </CardTitle>
                <CardDescription>
                  Type away. Typing indicators, short history, and a clean UI.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
