import { NextResponse } from 'next/server'
import * as stacksService from '@/modules/stacks/stacks.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const stacks = await stacksService.listStacks()
    return NextResponse.json({ data: stacks })
  } catch {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stacks' } },
      { status: 500 }
    )
  }
}
