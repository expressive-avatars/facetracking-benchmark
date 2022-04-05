const express = require("express")
const { createServer: createViteServer } = require("vite")
const { Server: SocketIoServer } = require("socket.io")

const PORT = process.env.PORT || 3000

async function createServer() {
  const app = express()
  const http = require("http")
  const server = http.createServer(app)
  const io = new SocketIoServer(server)

  app.get("/custom", (req, res) => {
    res.send("Hey express")
  })

  io.of("/dashboard").on("connection", (socket) => {
    const { room } = socket.handshake.query
    socket.join(room)
    console.log("dashboard connected to room", room)
  })

  io.on("connection", (socket) => {
    const { room } = socket.handshake.query
    socket.join(room)

    console.log("ios device connected to room", room)
    socket.on("message", (message) => console.log(`[${socket.id}]`, message))

    // Received iOS tracking results
    socket.on("results", (results) => {
      io.of("/dashboard").in(room).volatile.emit("iosResults", results)
    })
  })

  if (process.env.NODE_ENV === "development") {
    const vite = await createViteServer({
      server: { middlewareMode: "html", hmr: { server } },
    })
    app.use(vite.middlewares)
  } else {
    app.use(express.static("dist"))
  }

  server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
  })
}

createServer()
