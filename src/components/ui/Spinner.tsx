interface Props {
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
}

export function Spinner({ size = 'md', full = false }: Props) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-10 h-10' : 'w-7 h-7'
  const el = <div className={`spinner ${s}`} />
  if (full) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        {el}
      </div>
    )
  }
  return el
}