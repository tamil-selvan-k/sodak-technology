'use client'

interface Company {
  name: string
  logo: string
  fallback: string
}

interface CompanyLogosProps {
  companies: Company[]
}

export default function CompanyLogos({ companies }: CompanyLogosProps) {
  const companiesRow2 = [...companies].reverse()

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, fallback: string) => {
    const target = e.currentTarget
    target.src = fallback
  }

  return (
    <>
      <div className="companies-marquee-wrap" style={{ marginBottom: 16 }}>
        <div className="company-track">
          {companies.map((company, i) => (
            <div key={`c1a-${i}`} className="company-logo-item">
              <img
                src={company.logo}
                alt={company.name}
                onError={(e) => handleImageError(e, company.fallback)}
              />
            </div>
          ))}
          {companies.map((company, i) => (
            <div key={`c1b-${i}`} className="company-logo-item">
              <img
                src={company.logo}
                alt={company.name}
                onError={(e) => handleImageError(e, company.fallback)}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="companies-marquee-wrap">
        <div className="company-track-reverse">
          {companiesRow2.map((company, i) => (
            <div key={`c2a-${i}`} className="company-logo-item">
              <img
                src={company.logo}
                alt={company.name}
                onError={(e) => handleImageError(e, company.fallback)}
              />
            </div>
          ))}
          {companiesRow2.map((company, i) => (
            <div key={`c2b-${i}`} className="company-logo-item">
              <img
                src={company.logo}
                alt={company.name}
                onError={(e) => handleImageError(e, company.fallback)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
