import { NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'
import { scrapeMatchesFromProfightDB } from '../../../../lib/scraper'

export async function POST(req: Request) {
    try {
        const body = await req.json()

        const newEvent = await prisma.event.create({
            data: {
                title: body.title,
                slug: body.slug,
                date: new Date(body.date),
                promotion: body.promotion,
                posterUrl: body.posterUrl || null,
                description: body.description || null,
                profightdbUrl: body.profightdbUrl || null,
            }
        })

        if (body.profightdbUrl) {
            await scrapeMatchesFromProfightDB(newEvent.id, body.profightdbUrl)
        }

        return NextResponse.json({ success: true, event: newEvent })
    } catch (error) {
        console.error('❌ Error adding event:', error)
        return NextResponse.json({ success: false, error: 'Error adding event' }, { status: 500 })
    }
}