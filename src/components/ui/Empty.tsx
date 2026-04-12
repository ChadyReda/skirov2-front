import type { ReactNode } from 'react'

interface Props {
  icon?: ReactNode
  title: string
  desc?: string
  action?: ReactNode
}

export function Empty({ icon, title, desc, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {icon && (
        <div className="text-stone-200 mb-4">{icon}</div>
      )}
      <h3
        className="text-2xl text-stone-800 mb-2"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        {title}
      </h3>
      {desc && (
        <p className="text-stone-500 text-sm mb-6 max-w-xs">{desc}</p>
      )}
      {action}
    </div>
  )
}