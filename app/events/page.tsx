import { prisma } from '../../lib/prisma'
import EventsGrid from './EventsGrid'

export default async function EventsPage() {
    const events = await prisma.event.findMany({ orderBy: { date: 'desc' } });

    return (
        <div className="rounded-t-lg text-white overflow-hidden">
            <EventsGrid events={events} />
        </div>
    );
}