import Image from 'next/image'

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface Props {
  src?: string | null
  alt: string
  initials?: string
  size?: Size
  className?: string
}

const SIZE_PX: Record<Size, number> = { xs: 28, sm: 36, md: 48, lg: 72, xl: 100, xxl: 120 }
const TEXT_SIZE: Record<Size, string> = { xs: 'text-[10px]', sm: 'text-[13px]', md: 'text-base', lg: 'text-[22px]', xl: 'text-[28px]', xxl: 'text-[34px]' }

export default function Avatar({ src, alt, initials, size = 'md', className = '' }: Props) {
  const px = SIZE_PX[size]
  const style = { width: px, height: px }

  if (src) {
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`} style={style}>
        <Image src={src} alt={alt} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }

  const letter = initials ?? alt.charAt(0).toUpperCase()
  return (
    <div
      className={`rounded-full flex-shrink-0 flex items-center justify-center font-bold bg-[var(--navy-700)] text-[var(--gold-500)] ${TEXT_SIZE[size]} ${className}`}
      style={style}
      aria-label={alt}
    >
      {letter}
    </div>
  )
}
