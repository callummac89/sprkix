import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
    const user = await getUserFromServerCookie()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { eventId } = await req.json()

    try {
        const item = await prisma.watchListItem.create({
            data: {
                userId: user.id,
                eventId,
            },
        })
        return NextResponse.json(item)
    } catch {
        return NextResponse.json({ error: 'Already in watchlist?' }, { status: 400 })
    }
}

export async function DELETE(req: Request) {
    const user = await getUserFromServerCookie()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { eventId } = await req.json()

    await prisma.watchListItem.deleteMany({
        where: {
            userId: user.id,
            eventId,
        },
    })

    return NextResponse.json({ success: true })
}