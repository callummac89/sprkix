import { NextResponse } from 'next/server'
import { prisma } from '@lib/prisma'

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.event.delete({
            where: { id: params.id },
        })
        return NextResponse.json({ success: true })
    } catch (err) {
        console.error('[Delete Event]', err)
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
}