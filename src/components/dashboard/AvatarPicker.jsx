import style from "./AvatarPicker.module.css"

const exclude = [37, 19, 24, 7]

const options = Array(40)
  .fill()
  .map((_, i) => i + 1)
  .filter((i) => !exclude.includes(i))
  .map((i) => `avatar-${i}`)

export function AvatarPicker({ onInput = () => {} }) {
  return (
    <div className={style.container}>
      <ul className={style.grid}>
        {options.map((name, i) => (
          <button onClick={() => onInput(name)}>
            <img className={style.thumbnail} key={i} src={`/thumbnails/${name}.png`} width="150px" height="150px" />
          </button>
        ))}
      </ul>
    </div>
  )
}
