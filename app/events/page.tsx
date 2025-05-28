import { prisma } from '../../lib/prisma'
import EventsGrid from './EventsGrid'

export default async function EventsPage() {
    const events = await prisma.event.findMany({ orderBy: { date: 'desc' } });

    return (
        <div className="max-w-12xl mx-auto px-4 py-6">
            <EventsGrid events={events} />
        </div>
    );
}