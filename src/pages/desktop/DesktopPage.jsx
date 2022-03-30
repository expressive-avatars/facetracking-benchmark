import { useEffect, useState } from "react"
import io from "socket.io-client"

export function DesktopPage() {
  const [socket] = useState(() => io())
  useEffect(() => {
    socket.send("mount")
    return () => socket.disconnect()
  }, [])
  const onClick = () => {
    socket.send("click")
  }
  return (
    <>
      <p>Hello world!</p>
      <button onClick={onClick}>Click</button>
    </>
  )
}
