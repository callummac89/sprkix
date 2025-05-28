import { prisma } from '../../../lib/prisma'
import { getUserFromCookie } from '../../../lib/auth'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const { targetUserId } = await req.json()
    const currentUser = await getUserFromCookie()

    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const existing = await prisma.follow.findUnique({
        where: {
            followerId_followingId: {
                followerId: currentUser.id,
                followingId: targetUserId,
            },
        },
    })

    if (existing) {
        // Unfollow
        await prisma.follow.delete({
            where: {
                followerId_followingId: {
                    followerId: currentUser.id,
                    followingId: targetUserId,
                },
            },
        })
        return NextResponse.json({ followed: false })
    } else {
        // Follow
        await prisma.follow.create({
            data: {
                followerId: currentUser.id,
                followingId: targetUserId,
            },
        })
        return NextResponse.json({ followed: true })
    }
}