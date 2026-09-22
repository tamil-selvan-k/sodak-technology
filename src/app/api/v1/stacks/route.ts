import { NextResponse } from 'next/server'
import * as stacksService from '@/modules/stacks/stacks.service'

export async function GET() {
  const stacks = await stacksService.listStacks()
  return NextResponse.json({ data: stacks })
}
