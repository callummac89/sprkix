import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import { getUserFromCookie } from '../../../lib/auth'

export async function POST(req: Request) {
    const user = await getUserFromCookie()
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