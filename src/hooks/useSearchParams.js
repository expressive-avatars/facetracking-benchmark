import { useState } from "react"

export function useSearchParams() {
  const [url] = useState(() => new URL(location.href))
  return url.searchParams
}
