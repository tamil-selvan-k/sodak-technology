'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface Mentor {
  name: string
  slug: string
  photoUrl?: string | null
  designation?: string | null
  currentCompany?: string | null
  expertiseTags?: string[]
  yearsExperience?: number | null
}

export default function MentorCard({ mentor: m }: { mentor: Mentor }) {
  const [imgError, setImgError] = useState(false)
  const showPhoto = !!m.photoUrl && !imgError

  return (
    <article className="group bg-white border border-[#e0ebff] rounded-[22px] shadow-[0_10px_28px_rgba(5,25,80,0.12)] overflow-hidden flex flex-col transition-[transform,box-shadow] duration-[250ms] ease-out hover:-translate-y-[5px] hover:shadow-[0_18px_38px_rgba(5,25,80,0.20)]">
      {/* Photo banner */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-[#dce8ff] to-[#b9ccf0] overflow-hidden">
        {showPhoto ? (
          <Image
            src={m.photoUrl!}
            alt={m.name}
            fill
            className="object-cover transition-transform duration-[450ms] ease-out group-hover:scale-[1.045]"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#7799d9] to-[#294e9c] text-white text-5xl font-bold">
            {m.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/95 text-[#236044] px-2.5 py-1.5 rounded-full text-[10px] font-[800] shadow-[0_3px_12px_rgba(0,0,0,0.08)]">
          Industry mentor
        </span>
      </div>

      {/* Card body */}
      <div className="p-[19px] flex flex-col flex-1">
        <h2 className="text-[20px] font-bold tracking-[-0.4px] leading-tight">{m.name}</h2>
        <p className="mt-1.5 text-[13px] text-[#53647e] leading-[1.45]">{m.designation ?? ''}</p>

        {m.currentCompany && (
          <p className="mt-2.5 flex items-center gap-1.5 text-[12px] font-[800] text-[#2454ae]">
            <span className="w-2 h-2 rounded-sm bg-[#3974ee] flex-none" />
            {m.currentCompany}
          </p>
        )}

        {m.expertiseTags && m.expertiseTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {m.expertiseTags.slice(0, 4).map(tag => (
              <span key={tag} className="rounded-full bg-[#f0f5ff] text-[#405a87] px-2.5 py-1.5 text-[10px] font-[700]">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto pt-3 border-t border-[#edf1f8] flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#8390a5]">Industry professional</span>
          <Link href={`/mentors/${m.slug}`} className="group/link inline-flex items-center gap-1 text-[12px] font-[800] text-[#2454c6] whitespace-nowrap transition-colors duration-200 hover:text-[#173da8]">
            View profile
            <span className="inline-block transition-transform duration-200 group-hover/link:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
