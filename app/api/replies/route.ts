import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
    const user = await getUserFromServerCookie()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const { reviewId, comment } = await req.json()

    const reply = await prisma.reply.create({
        data: {
            comment,
            userId: user.id,
            reviewId,
        },
    })

    return NextResponse.json(reply)
}