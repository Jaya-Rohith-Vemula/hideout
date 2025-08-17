import { Routes, Route, Navigate } from "react-router-dom"
import Landing from "./pages/Landing"
import RoomChat from "./pages/RoomChat"

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/r/:roomId" element={<RoomChat />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
