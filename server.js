const express = require("express")
const { createServer: createViteServer } = require("vite")

const PORT = process.env.PORT || 3000

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: "html" },
  })

  app.get("/custom", (req, res) => {
    res.send("Hey express")
  })

  app.use(vite.middlewares)

  app.listen(PORT)

  console.log(`server running at http://localhost:${PORT}`)
}

createServer()
