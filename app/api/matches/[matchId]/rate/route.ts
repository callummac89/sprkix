import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../../lib/prisma'
import { jwtVerify } from 'jose'

export async function POST(req: NextRequest, { params }: { params: { matchId: string } }) {
    try {
        const token = req.cookies.get('token')?.value
        if (!token) {
            console.error('[Auth] Missing token')
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        if (!process.env.JWT_SECRET) {
            const errorMsg = '[Auth] Missing JWT_SECRET environment variable'
            console.error(errorMsg)
            throw new Error(errorMsg)
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET)
        const { payload } = await jwtVerify(token, secret)
        const userId = (payload as any).userId

        if (!userId) {
            console.error('[Auth] Invalid userId in token payload')
            return NextResponse.json({ error: 'Invalid token' }, { status: 403 })
        }

        const matchId = params.matchId
        if (!matchId) {
            console.error('[Params] Missing matchId')
            return NextResponse.json({ error: 'Match ID not provided' }, { status: 400 })
        }

        const { rating } = await req.json()
        if (typeof rating !== 'number' || rating < 0 || rating > 5) {
            return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
        }

        console.log({ matchId, userId, rating })

        try {
            await prisma.matchRating.upsert({
                where: {
                    userId_matchId: {
                        userId,
                        matchId,
                    },
                },
                update: { rating },
                create: {
                    matchId,
                    userId,
                    rating,
                },
            })

            const allRatings = await prisma.matchRating.findMany({
                where: { matchId },
            })

            const average =
                allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length

            await prisma.match.update({
                where: { id: matchId },
                data: { rating: average },
            })

            return NextResponse.json({ success: true, average })
        } catch (dbErr) {
            console.error('[DB Error]', dbErr)
            return NextResponse.json({ error: 'Database operation failed', details: dbErr.message }, { status: 500 })
        }
    } catch (err: any) {
        console.error('[Rating Error]', err)
        return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 })
    }
}