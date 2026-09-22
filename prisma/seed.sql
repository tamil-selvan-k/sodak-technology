-- SODAK Technology — seed data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query → Run)
-- Idempotent: uses ON CONFLICT DO NOTHING / DO UPDATE

-- ── 1. Super admin user ──────────────────────────────────────────────────────
INSERT INTO users (id, name, email, "passwordHash", role, "isActive", "createdAt", "updatedAt")
VALUES (
  'cm_admin_sodak_00001',
  'SODAK Admin',
  'admin@sodakedutech.in',
  '$argon2id$v=19$m=65536,t=3,p=4$Bd0zp0vxMYtpgBibuzKT0w$JavYRK3FbcEz//vi9R8tzkq4uvQBjGRvxZA5YPmLJJs',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  "passwordHash" = EXCLUDED."passwordHash",
  role = 'super_admin',
  "isActive" = true,
  "updatedAt" = NOW();

-- ── 2. Tech stacks ──────────────────────────────────────────────────────────
INSERT INTO stacks (id, name, slug, summary, "displayOrder")
VALUES
  ('stk_fullstack_001', 'Full Stack Web',       'full-stack-web',      'HTML, CSS, JS, React, Node.js, PostgreSQL',    1),
  ('stk_java_001',      'Java & Spring Boot',   'java-spring-boot',    'Core Java, Spring Boot, Microservices, Maven',  2),
  ('stk_python_001',    'Python & Data Science','python-data-science', 'Python, Pandas, NumPy, scikit-learn, ML',       3),
  ('stk_devops_001',    'DevOps & Cloud',        'devops-cloud',        'Docker, Kubernetes, CI/CD, AWS, Terraform',     4),
  ('stk_cyber_001',     'Cybersecurity',         'cybersecurity',       'Network security, ethical hacking, SOC, CTF',  5),
  ('stk_mobile_001',    'Mobile Development',   'mobile-development',  'React Native, Flutter, Android, iOS',          6)
ON CONFLICT (id) DO NOTHING;

-- ── 3. Technologies per stack ────────────────────────────────────────────────
INSERT INTO technologies (id, name, "stackId", "displayOrder")
VALUES
  -- Full Stack Web
  ('tech_fs_001', 'HTML & CSS',    'stk_fullstack_001', 1),
  ('tech_fs_002', 'JavaScript',    'stk_fullstack_001', 2),
  ('tech_fs_003', 'React',         'stk_fullstack_001', 3),
  ('tech_fs_004', 'Node.js',       'stk_fullstack_001', 4),
  ('tech_fs_005', 'PostgreSQL',    'stk_fullstack_001', 5),
  ('tech_fs_006', 'TypeScript',    'stk_fullstack_001', 6),
  -- Java
  ('tech_java_001', 'Core Java',      'stk_java_001', 1),
  ('tech_java_002', 'Spring Boot',    'stk_java_001', 2),
  ('tech_java_003', 'Microservices',  'stk_java_001', 3),
  ('tech_java_004', 'Maven / Gradle', 'stk_java_001', 4),
  -- Python
  ('tech_py_001', 'Python',       'stk_python_001', 1),
  ('tech_py_002', 'Pandas',       'stk_python_001', 2),
  ('tech_py_003', 'NumPy',        'stk_python_001', 3),
  ('tech_py_004', 'scikit-learn', 'stk_python_001', 4),
  -- DevOps
  ('tech_do_001', 'Docker',      'stk_devops_001', 1),
  ('tech_do_002', 'Kubernetes',  'stk_devops_001', 2),
  ('tech_do_003', 'Jenkins',     'stk_devops_001', 3),
  ('tech_do_004', 'AWS',         'stk_devops_001', 4),
  ('tech_do_005', 'Terraform',   'stk_devops_001', 5),
  -- Cybersecurity
  ('tech_cy_001', 'Kali Linux',       'stk_cyber_001', 1),
  ('tech_cy_002', 'Nmap / Metasploit','stk_cyber_001', 2),
  ('tech_cy_003', 'Wireshark',        'stk_cyber_001', 3),
  ('tech_cy_004', 'Burp Suite',       'stk_cyber_001', 4),
  -- Mobile
  ('tech_mb_001', 'React Native', 'stk_mobile_001', 1),
  ('tech_mb_002', 'Flutter',      'stk_mobile_001', 2),
  ('tech_mb_003', 'Android SDK',  'stk_mobile_001', 3),
  ('tech_mb_004', 'Xcode / iOS',  'stk_mobile_001', 4)
ON CONFLICT (name, "stackId") DO NOTHING;

-- ── 4. Site settings singleton ───────────────────────────────────────────────
INSERT INTO site_settings (
  id, "heroHeadline", "heroSubhead", stats, "socialLinks", "updatedAt"
)
VALUES (
  1,
  'Transforming Campus Placement Training',
  'Industry-aligned programs that bridge the gap between academia and careers',
  '{"placed": 2500, "companies": 120, "trainers": 40, "years": 8}'::jsonb,
  '{"linkedin": "", "youtube": "", "instagram": "", "whatsapp": ""}'::jsonb,
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- ── 5. Sample trainers (unpublished, consent = false) ────────────────────────
INSERT INTO trainers (
  id, name, slug, designation, "currentCompany", "bioHtml",
  "yearsExperience", "isMentor", "isFeatured", "isPublished", "consentOnFile",
  "expertiseTags", "sessionTypes", "displayOrder", "createdAt", "updatedAt"
)
VALUES
  (
    'tr_arjun_001',
    'Arjun Kumar',
    'arjun-kumar',
    'Senior Software Engineer',
    'Zoho Corporation',
    '<p>10+ years building scalable web applications. Specialises in React and Node.js.</p>',
    10, false, true, false, false,
    ARRAY['React','Node.js','PostgreSQL','TypeScript'],
    ARRAY[]::text[],
    1, NOW(), NOW()
  ),
  (
    'tr_priya_001',
    'Priya Venkatesh',
    'priya-venkatesh',
    'Data Scientist',
    'Freshworks',
    '<p>8 years in ML and data engineering. Passionate about teaching Python for AI.</p>',
    8, true, true, false, false,
    ARRAY['Python','Machine Learning','Data Science','Pandas'],
    ARRAY['1-on-1 Mentorship','Group Session'],
    2, NOW(), NOW()
  )
ON CONFLICT (slug) DO NOTHING;

-- ── 6. Trainer ↔ Stack links ──────────────────────────────────────────────────
INSERT INTO trainer_stacks ("trainerId", "stackId")
VALUES
  ('tr_arjun_001', 'stk_fullstack_001'),
  ('tr_arjun_001', 'stk_java_001'),
  ('tr_priya_001', 'stk_python_001'),
  ('tr_priya_001', 'stk_devops_001')
ON CONFLICT DO NOTHING;

-- ── 7. Sample programs ───────────────────────────────────────────────────────
INSERT INTO programs (
  id, title, slug, "trackCode", "tagline", "durationWeeks",
  "deliveryMode", "isPublished", "isFeatured", "displayOrder", "createdAt", "updatedAt"
)
VALUES
  ('prog_fs_001',   'Full Stack Bootcamp',   'full-stack-bootcamp',  'TRACK_A', 'React + Node.js + PostgreSQL end-to-end',  12, 'hybrid',    false, true,  1, NOW(), NOW()),
  ('prog_java_001', 'Java Backend Track',    'java-backend-track',   'TRACK_B', 'Enterprise Java with Spring Boot',         10, 'on_campus', false, false, 2, NOW(), NOW()),
  ('prog_py_001',   'Python & ML Track',     'python-ml-track',      'TRACK_C', 'Data science and machine learning',        10, 'hybrid',    false, false, 3, NOW(), NOW()),
  ('prog_do_001',   'DevOps & Cloud Track',  'devops-cloud-track',   'TRACK_D', 'Docker, Kubernetes, AWS in 10 weeks',       10, 'online',    false, false, 4, NOW(), NOW()),
  ('prog_cy_001',   'Ethical Hacking Track', 'ethical-hacking-track','TRACK_E', 'Cybersecurity from basics to CTF',          8, 'on_campus', false, false, 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ── 8. Program ↔ Stack links ──────────────────────────────────────────────────
INSERT INTO program_stacks ("programId", "stackId")
VALUES
  ('prog_fs_001',   'stk_fullstack_001'),
  ('prog_java_001', 'stk_java_001'),
  ('prog_py_001',   'stk_python_001'),
  ('prog_do_001',   'stk_devops_001'),
  ('prog_cy_001',   'stk_cyber_001')
ON CONFLICT DO NOTHING;

-- ── 9. Legacy redirects ──────────────────────────────────────────────────────
INSERT INTO redirects (id, source, destination, "isPermanent")
VALUES
  (gen_random_uuid()::text, '/#trainers',    '/trainers',    true),
  (gen_random_uuid()::text, '/#programs',    '/programs',    true),
  (gen_random_uuid()::text, '/#about',       '/about',       true),
  (gen_random_uuid()::text, '/#contact',     '/contact',     true),
  (gen_random_uuid()::text, '/#mentors',     '/mentors',     true),
  (gen_random_uuid()::text, '/#courses',     '/courses',     true),
  (gen_random_uuid()::text, '/#gallery',     '/gallery',     true),
  (gen_random_uuid()::text, '/#institutions','/institutions',true),
  (gen_random_uuid()::text, '/#webinars',    '/webinars',    true),
  (gen_random_uuid()::text, '/#internships', '/internships', true)
ON CONFLICT (source) DO NOTHING;

-- done
SELECT 'Seed complete.' AS status;
