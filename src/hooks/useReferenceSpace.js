import { useEffect, useState } from "react"
import { useXRSession } from "./useXRSession"

export function useReferenceSpace(referenceSpaceType) {
  const session = useXRSession()
  const [referenceSpace, setReferenceSpace] = useState()
  useEffect(() => {
    if (session) {
      session.requestReferenceSpace(referenceSpaceType).then((value) => setReferenceSpace(value))
    }
  }, [session])
  return referenceSpace
}
