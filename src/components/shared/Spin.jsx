export function Spin({ children }) {
  const ref = useRef()
  useFrame((_, delta) => {
    ref.current.rotation.y += delta
  })
  return <group ref={ref}>{children}</group>
}
