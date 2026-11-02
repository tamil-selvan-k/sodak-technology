import { PrismaClient, UserRole } from '@prisma/client'

const db = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database…')

  // ── Super admin user ────────────────────────────────────────────────────────
  // Pre-computed argon2id hash for 'Admin@SoDak2024' (argon2 native binding requires
  // compilation — hash was generated separately to avoid the build dependency in CI)
  const passwordHash = '$argon2id$v=19$m=65536,t=3,p=4$Bd0zp0vxMYtpgBibuzKT0w$JavYRK3FbcEz//vi9R8tzkq4uvQBjGRvxZA5YPmLJJs'

  const admin = await db.user.upsert({
    where: { email: 'admin@sodakedutech.in' },
    update: {},
    create: {
      name:         'Site Admin',
      email:        'admin@sodakedutech.in',
      passwordHash,
      role:         UserRole.super_admin,
      isActive:     true,
    },
  })
  console.log(`  ✓ Admin user: ${admin.email}`)

  // ── Technology stacks ───────────────────────────────────────────────────────
  const stacksData = [
    {
      name:         'Full Stack Web',
      slug:         'full-stack-web',
      icon:         null,
      summary:      'React, Node.js, TypeScript and modern web development',
      colorToken:   '#3b82f6',
      displayOrder: 1,
      technologies: [
        { name: 'HTML & CSS',   logoUrl: null, displayOrder: 1 },
        { name: 'JavaScript',   logoUrl: null, displayOrder: 2 },
        { name: 'TypeScript',   logoUrl: null, displayOrder: 3 },
        { name: 'React',        logoUrl: null, displayOrder: 4 },
        { name: 'Node.js',      logoUrl: null, displayOrder: 5 },
        { name: 'PostgreSQL',   logoUrl: null, displayOrder: 6 },
      ],
    },
    {
      name:         'Java & Spring Boot',
      slug:         'java-spring-boot',
      icon:         null,
      summary:      'Core Java, OOP, Spring Boot microservices',
      colorToken:   '#f97316',
      displayOrder: 2,
      technologies: [
        { name: 'Core Java',    logoUrl: null, displayOrder: 1 },
        { name: 'Spring Boot',  logoUrl: null, displayOrder: 2 },
        { name: 'Hibernate',    logoUrl: null, displayOrder: 3 },
        { name: 'Maven',        logoUrl: null, displayOrder: 4 },
        { name: 'MySQL',        logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'Python & Data Science',
      slug:         'python-data-science',
      icon:         null,
      summary:      'Python, ML fundamentals, pandas, scikit-learn',
      colorToken:   '#eab308',
      displayOrder: 3,
      technologies: [
        { name: 'Python',       logoUrl: null, displayOrder: 1 },
        { name: 'NumPy',        logoUrl: null, displayOrder: 2 },
        { name: 'Pandas',       logoUrl: null, displayOrder: 3 },
        { name: 'Scikit-learn', logoUrl: null, displayOrder: 4 },
        { name: 'Matplotlib',   logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'DevOps & Cloud',
      slug:         'devops-cloud',
      icon:         null,
      summary:      'Linux, Docker, Kubernetes, AWS fundamentals',
      colorToken:   '#6366f1',
      displayOrder: 4,
      technologies: [
        { name: 'Linux',        logoUrl: null, displayOrder: 1 },
        { name: 'Docker',       logoUrl: null, displayOrder: 2 },
        { name: 'Kubernetes',   logoUrl: null, displayOrder: 3 },
        { name: 'AWS',          logoUrl: null, displayOrder: 4 },
        { name: 'CI/CD',        logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'Cybersecurity',
      slug:         'cybersecurity',
      icon:         null,
      summary:      'Ethical hacking, network security, VAPT, CEH prep',
      colorToken:   '#ef4444',
      displayOrder: 5,
      technologies: [
        { name: 'Networking',   logoUrl: null, displayOrder: 1 },
        { name: 'Kali Linux',   logoUrl: null, displayOrder: 2 },
        { name: 'Metasploit',   logoUrl: null, displayOrder: 3 },
        { name: 'Wireshark',    logoUrl: null, displayOrder: 4 },
        { name: 'OWASP',        logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'Mobile Development',
      slug:         'mobile-development',
      icon:         null,
      summary:      'React Native and Flutter cross-platform apps',
      colorToken:   '#22c55e',
      displayOrder: 6,
      technologies: [
        { name: 'React Native', logoUrl: null, displayOrder: 1 },
        { name: 'Flutter',      logoUrl: null, displayOrder: 2 },
        { name: 'Dart',         logoUrl: null, displayOrder: 3 },
        { name: 'Firebase',     logoUrl: null, displayOrder: 4 },
      ],
    },
    {
      name:         'DSA & Problem Solving',
      slug:         'dsa',
      icon:         null,
      summary:      'Data structures, algorithms and coding interview preparation',
      colorToken:   '#7C3AED',
      displayOrder: 7,
      technologies: [
        { name: 'Arrays & Strings',    logoUrl: null, displayOrder: 1 },
        { name: 'Trees & Graphs',      logoUrl: null, displayOrder: 2 },
        { name: 'Dynamic Programming', logoUrl: null, displayOrder: 3 },
        { name: 'Sorting & Searching', logoUrl: null, displayOrder: 4 },
        { name: 'System Complexity',   logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'System Design',
      slug:         'system-design',
      icon:         null,
      summary:      'Scalable architecture, distributed systems, design interviews',
      colorToken:   '#0EA5E9',
      displayOrder: 8,
      technologies: [
        { name: 'Load Balancing',      logoUrl: null, displayOrder: 1 },
        { name: 'Databases & Caching', logoUrl: null, displayOrder: 2 },
        { name: 'Microservices',       logoUrl: null, displayOrder: 3 },
        { name: 'CAP Theorem',         logoUrl: null, displayOrder: 4 },
        { name: 'Message Queues',      logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'Amazon Interview Prep',
      slug:         'amazon-training',
      icon:         null,
      summary:      'Amazon Leadership Principles, coding rounds and system design for AMZN',
      colorToken:   '#FF9900',
      displayOrder: 9,
      technologies: [
        { name: 'Leadership Principles', logoUrl: null, displayOrder: 1 },
        { name: 'Online Assessment',     logoUrl: null, displayOrder: 2 },
        { name: 'Coding Interviews',     logoUrl: null, displayOrder: 3 },
        { name: 'System Design',         logoUrl: null, displayOrder: 4 },
        { name: 'Behavioral Rounds',     logoUrl: null, displayOrder: 5 },
      ],
    },
    {
      name:         'Zoho Interview Prep',
      slug:         'zoho-training',
      icon:         null,
      summary:      'Zoho-specific coding patterns, aptitude and technical rounds',
      colorToken:   '#E8442E',
      displayOrder: 10,
      technologies: [
        { name: 'Aptitude & Reasoning', logoUrl: null, displayOrder: 1 },
        { name: 'Core Programming',     logoUrl: null, displayOrder: 2 },
        { name: 'SQL & Databases',      logoUrl: null, displayOrder: 3 },
        { name: 'Technical Interview',  logoUrl: null, displayOrder: 4 },
        { name: 'HR Round Prep',        logoUrl: null, displayOrder: 5 },
      ],
    },
  ]

  const stacks: Record<string, string> = {}

  for (const { technologies, ...stackInput } of stacksData) {
    const stack = await db.stack.upsert({
      where:  { slug: stackInput.slug },
      update: {},
      create: stackInput,
    })
    stacks[stackInput.slug] = stack.id

    for (const tech of technologies) {
      await db.technology.upsert({
        where:  { name_stackId: { name: tech.name, stackId: stack.id } },
        update: {},
        create: { ...tech, stackId: stack.id },
      })
    }

    console.log(`  ✓ Stack: ${stack.name} (${technologies.length} technologies)`)
  }

  // ── Site settings (singleton row) ──────────────────────────────────────────
  await db.siteSetting.upsert({
    where:  { id: 1 },
    update: {},
    create: {
      id:                1,
      heroHeadline:      'Launch Your Tech Career',
      heroSubhead:       'Expert-led campus placement training trusted by colleges across Tamil Nadu',
      notificationEmail: 'tamildeveloper2007@gmail.com',
      stats: {
        placements: 5000,
        colleges:   500,
        trainers:   50,
        years:      8,
      },
      socialLinks: {
        linkedin:  'https://linkedin.com/company/sodakedutech',
        instagram: 'https://instagram.com/sodakedutech',
        youtube:   'https://youtube.com/@sodakedutech',
        twitter:   'https://twitter.com/sodakedutech',
      },
    },
  })
  console.log('  ✓ SiteSetting singleton')

  // ── Remove dummy trainers/mentors ───────────────────────────────────────────
  const dummySlugs = ['arjun-kumar', 'priya-venkatesh']
  for (const slug of dummySlugs) {
    const existing = await db.trainer.findUnique({ where: { slug } })
    if (existing) {
      await db.trainerStack.deleteMany({ where: { trainerId: existing.id } })
      await db.trainer.delete({ where: { slug } })
      console.log(`  ✗ Removed dummy: ${existing.name}`)
    }
  }

  // ── Mentors ─────────────────────────────────────────────────────────────────
  const mentorsData = [
    { name: 'Nithesh R',           slug: 'nithesh-r',           company: 'Amazon',      order: 2 },
    { name: 'Harish Raj B',        slug: 'harish-raj-b',        company: 'Northern Arc', order: 3 },
    { name: 'Sai Varun',           slug: 'sai-varun',           company: 'Zoho',         order: 4 },
    { name: 'Neeharika',           slug: 'neeharika',           company: 'TCS',          order: 5 },
    { name: 'Vinothini',           slug: 'vinothini',           company: 'Deloitte',     order: 6 },
    { name: 'Rajendhira Prasath',  slug: 'rajendhira-prasath',  company: 'Accenture',    order: 7 },
    { name: 'Vishab',              slug: 'vishab',              company: 'Cognizant',    order: 8 },
    { name: 'Rahul',               slug: 'rahul',               company: 'PayPal',       order: 9 },
    { name: 'Sarasuraman',         slug: 'sarasuraman',         company: 'Zoho',         order: 10 },
  ]

  for (const m of mentorsData) {
    const mentor = await db.trainer.upsert({
      where:  { slug: m.slug },
      update: { currentCompany: m.company, isMentor: true, isPublished: true, consentOnFile: true },
      create: {
        name:           m.name,
        slug:           m.slug,
        currentCompany: m.company,
        expertiseTags:  [],
        isMentor:       true,
        isPublished:    true,
        consentOnFile:  true,
        displayOrder:   m.order,
      },
    })
    console.log(`  ✓ Mentor: ${mentor.name} (${m.company})`)
  }

  // ── Sample programs (one per track, unpublished) ────────────────────────────
  const programsData = [
    {
      title:          'Full Stack Development Bootcamp',
      slug:           'full-stack-development-bootcamp',
      trackCode:      'A',
      summary:        'End-to-end web development from HTML/CSS to deploying production apps with React and Node.js.',
      duration:       '90 days',
      deliveryMode:   'on_campus',
      targetAudience: 'Final year CS/IT students',
      prerequisites:  'Basic programming knowledge',
      outcomes:       [
        'Build and deploy full-stack web applications',
        'Crack placement interviews at product companies',
        'Hands-on with React, Node.js, and PostgreSQL',
      ],
      isFeatured:  true,
      isPublished: false,
      stackSlug:   'full-stack-web',
    },
    {
      title:          'Core Java & Backend Development',
      slug:           'core-java-backend-development',
      trackCode:      'B',
      summary:        'Solid Java fundamentals, OOP, collections, Spring Boot REST APIs, and database integration.',
      duration:       '75 days',
      deliveryMode:   'on_campus',
      targetAudience: 'CS/IT students with basic C knowledge',
      prerequisites:  'Familiarity with any programming language',
      outcomes:       [
        'Master Core Java and OOP principles',
        'Build REST APIs with Spring Boot',
        'Integrate MySQL with Hibernate/JPA',
      ],
      isFeatured:  false,
      isPublished: false,
      stackSlug:   'java-spring-boot',
    },
    {
      title:          'Python & ML Essentials',
      slug:           'python-ml-essentials',
      trackCode:      'C',
      summary:        'Python programming, data analysis with pandas/NumPy, and an introduction to machine learning.',
      duration:       '60 days',
      deliveryMode:   'hybrid',
      targetAudience: 'CS/IT/ECE students',
      prerequisites:  'None',
      outcomes:       [
        'Write clean Python for automation and data tasks',
        'Analyse datasets with pandas and NumPy',
        'Build and evaluate simple ML models',
      ],
      isFeatured:  false,
      isPublished: false,
      stackSlug:   'python-data-science',
    },
    {
      title:          'DevOps & Cloud Fundamentals',
      slug:           'devops-cloud-fundamentals',
      trackCode:      'D',
      summary:        'Linux, Docker, Kubernetes, AWS core services, and CI/CD pipelines — built for campus placements.',
      duration:       '45 days',
      deliveryMode:   'hybrid',
      targetAudience: 'CS/IT students targeting MNC placements',
      prerequisites:  'Basic Linux/CLI experience',
      outcomes:       [
        'Containerise and deploy apps with Docker & Kubernetes',
        'Set up CI/CD pipelines',
        'Configure and manage AWS core services',
      ],
      isFeatured:  false,
      isPublished: false,
      stackSlug:   'devops-cloud',
    },
    {
      title:          'Ethical Hacking & Cybersecurity',
      slug:           'ethical-hacking-cybersecurity',
      trackCode:      'E',
      summary:        'Offensive and defensive security — networking, VAPT, Metasploit, OWASP Top 10, CEH preparation.',
      duration:       '60 days',
      deliveryMode:   'on_campus',
      targetAudience: 'CS/IT/ECE students and working professionals',
      prerequisites:  'Basic networking knowledge',
      outcomes:       [
        'Conduct network reconnaissance and VAPT',
        'Identify and exploit OWASP Top 10 vulnerabilities',
        'Prepare for CEH / CompTIA Security+ certifications',
      ],
      isFeatured:  false,
      isPublished: false,
      stackSlug:   'cybersecurity',
    },
  ]

  for (const { stackSlug, ...programInput } of programsData) {
    const program = await db.program.upsert({
      where:  { slug: programInput.slug },
      update: {},
      create: programInput,
    })

    if (stacks[stackSlug]) {
      await db.programStack.upsert({
        where:  { programId_stackId: { programId: program.id, stackId: stacks[stackSlug]! } },
        update: {},
        create: { programId: program.id, stackId: stacks[stackSlug]! },
      })
    }

    console.log(`  ✓ Program [${program.trackCode}]: ${program.title}`)
  }

  // ── Legacy URL redirects ────────────────────────────────────────────────────
  const redirectsData = [
    { source: '/#trainers',   destination: '/trainers',    isPermanent: true },
    { source: '/#programs',   destination: '/programs',    isPermanent: true },
    { source: '/#contact',    destination: '/contact',     isPermanent: true },
    { source: '/#gallery',    destination: '/gallery',     isPermanent: true },
    { source: '/#about',      destination: '/about',       isPermanent: true },
    { source: '/#mentors',    destination: '/mentors',     isPermanent: true },
    { source: '/#courses',    destination: '/courses',     isPermanent: true },
    { source: '/#webinars',   destination: '/webinars',    isPermanent: true },
    { source: '/#internships',destination: '/internships', isPermanent: true },
    { source: '/#insights',   destination: '/insights',    isPermanent: true },
  ]

  for (const redirect of redirectsData) {
    await db.redirect.upsert({
      where:  { source: redirect.source },
      update: {},
      create: redirect,
    })
  }
  console.log(`  ✓ ${redirectsData.length} legacy redirects`)

  console.log('\n✅ Seed complete.')
  console.log('\n⚠️  IMPORTANT: Change the admin password after first login!')
  console.log('   Email:    admin@sodakedutech.in')
  console.log('   Password: Admin@SoDak2024')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
