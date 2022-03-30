const express = require("express")
const { createServer: createViteServer } = require("vite")
const { Server: SocketIoServer } = require("socket.io")

const PORT = process.env.PORT || 3000

async function createServer() {
  const app = express()
  const http = require("http")
  const server = http.createServer(app)
  const io = new SocketIoServer(server)

  const vite = await createViteServer({
    server: { middlewareMode: "html" },
  })

  app.get("/custom", (req, res) => {
    res.send("Hey express")
  })

  io.on("connection", (socket) => {
    console.log("a user connected")
    socket.on("message", (message) => console.log(`[${socket.id}]`, message))
  })

  app.use(vite.middlewares)

  server.listen(PORT, () => {
    console.log(`listening on http://localhost:${PORT}`)
  })
}

createServer()
