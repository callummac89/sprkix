// /app/api/events/route.ts
import { prisma } from '@lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
    const events = await prisma.event.findMany({
        orderBy: { date: 'desc' },
        select: {
            id: true,
            title: true,
            date: true,
        },
    })

    return NextResponse.json(events)
}