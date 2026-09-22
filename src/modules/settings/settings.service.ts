// Rule: only imports from own types/schema, src/lib/*, npm packages.
import { db } from '@/lib/db'
import type { UpdateSettingsInput } from './settings.types'

export async function getSettings() {
  return db.siteSetting.upsert({
    where:  { id: 1 },
    create: { id: 1 },
    update: {},
  })
}

export async function updateSettings(input: UpdateSettingsInput) {
  return db.siteSetting.upsert({
    where:  { id: 1 },
    create: { id: 1, ...input },
    update: input,
  })
}
