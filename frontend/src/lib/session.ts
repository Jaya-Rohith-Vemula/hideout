export function getAnonSessionId() {
  let id = localStorage.getItem("anonSessionId")
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem("anonSessionId", id)
  }
  return id
}
