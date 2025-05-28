import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(req: Request) {
    const body = await req.json()

    const { eventId, rating, comment, userId } = body

    const review = await prisma.review.create({
        data: {
            rating,
            comment,
            userId,
            eventId,
        },
    })

    return NextResponse.json(review)
}