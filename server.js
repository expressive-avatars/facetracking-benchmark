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

  io.on("connection", (socket) => {
    console.log("a user connected")
    socket.on("message", (message) => console.log(`[${socket.id}]`, message))
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
