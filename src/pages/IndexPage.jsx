import { useState } from "react"
import "./style.css"

export function IndexPage() {
  const [room, setRoom] = useState("")
  const searchParams = new URLSearchParams({ room })
  const query = searchParams.toString()
  return (
    <>
      <label>
        Room:
        <input value={room} onChange={(e) => setRoom(e.target.value)} />
      </label>
      <ul>
        <li>
          <a href={`/dashboard/?${query}`}>Dashboard</a>
        </li>
        <li>
          <a href={`/ios/?${query}`}>iOS</a>
        </li>
        <li>
          <a href="/hallway/">Hallway</a>
        </li>
      </ul>
    </>
  )
}
