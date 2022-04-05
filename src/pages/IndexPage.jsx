import { useState } from "react"
import "./style.css"

export function IndexPage() {
  const [room, setRoom] = useState("")
  const searchParams = new URLSearchParams({ room })
  const query = searchParams.toString()
  return (
    <div id="rows">
      <div class="center">
        <label>
          Room:
          <input value={room} onChange={(e) => setRoom(e.target.value)} />
        </label>
      </div>
      <a class="center" href={`/dashboard/?${query}`}>
        Dashboard
      </a>
      <a class="center" href={`/ios/?${query}`}>
        iOS
      </a>
      <a class="center" href="/hallway/">
        Hallway
      </a>
    </div>
  )
}
