// Lifts functionality from ARButton.js example

export class ARManager {
  constructor(renderer, sessionInit = {}) {
    this.session = null
    this.renderer = renderer
    this.sessionInit = sessionInit
    this._makeDefaultOverlay()
  }

  _makeDefaultOverlay() {
    if (this.sessionInit.domOverlay === undefined) {
      const overlay = document.createElement("div")
      overlay.style.display = "none"
      document.body.appendChild(overlay)

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
      svg.setAttribute("width", 38)
      svg.setAttribute("height", 38)
      svg.style.position = "absolute"
      svg.style.right = "20px"
      svg.style.top = "20px"
      svg.addEventListener("click", () => {
        this.session.end()
      })
      overlay.appendChild(svg)

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
      path.setAttribute("d", "M 12,12 L 28,28 M 28,12 12,28")
      path.setAttribute("stroke", "#fff")
      path.setAttribute("stroke-width", 2)
      svg.appendChild(path)

      if (this.sessionInit.optionalFeatures === undefined) {
        this.sessionInit.optionalFeatures = []
      }

      this.sessionInit.optionalFeatures.push("dom-overlay")
      this.sessionInit.domOverlay = { root: overlay }
    }
  }

  start() {
    navigator.xr.requestSession("immersive-ar", this.sessionInit).then(this.onSessionStarted.bind(this))
  }

  end() {
    this.session.end()
  }

  get domOverlay() {
    return this.sessionInit.domOverlay
  }

  async onSessionStarted(session) {
    this.session = session

    session.addEventListener("end", this.onSessionEnded.bind(this))
    this.renderer.xr.setReferenceSpaceType("local")

    await this.renderer.xr.setSession(session)

    this.sessionInit.domOverlay.root.style.display = ""
  }

  onSessionEnded() {
    this.session = null
  }
}
