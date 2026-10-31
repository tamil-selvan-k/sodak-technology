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
export default function Avatar({ src, alt, size = 'md', className = '' }: Props) {
  const px = SIZE_PX[size]
  const style = { width: px, height: px }

  if (src) {
    return (
      <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`} style={style}>
        <Image src={src} alt={alt} width={px} height={px} className="object-cover w-full h-full" />
      </div>
    )
  }

  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${className}`} style={style}>
      <Image src="/images/default-avatar.svg" alt={alt} width={px} height={px} className="object-cover w-full h-full" />
    </div>
  )
}
