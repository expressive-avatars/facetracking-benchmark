const https = require("https") // or 'https' for https:// URLs
const fs = require("fs")
const path = require("path")

const avatarJsonPath = path.resolve(__dirname, "avatars-0.json")
const avatarJson = JSON.parse(fs.readFileSync(avatarJsonPath, "utf-8"))

function downloadImage(url, destination) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination)
    https.get(url, (response) => {
      response.pipe(file)
      file.on("finish", () => {
        file.close()
        resolve(destination)
      })
      file.on("error", (e) => {
        reject(e)
      })
    })
  })
}

avatarJson.entries.forEach((entry) => {
  const url = entry.images.preview.url
  const destination = path.resolve(__dirname, "../public/thumbnails", `${entry.name}.png`)
  downloadImage(url, destination).then(() => console.log("downloaded file", destination))
})
