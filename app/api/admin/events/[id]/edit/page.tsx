import { prisma } from '../../../../../../lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function EditEventPage({ params }) {
    const event = await prisma.event.findUnique({
        where: { id: params.id },
    });

    if (!event) return notFound();

    const matches = await prisma.match.findMany({
        where: { eventId: event.id },
        include: {
            participants: {
                include: {
                    wrestler: true,
                },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    const wrestlers = await prisma.wrestler.findMany({
        orderBy: { name: 'asc' },
    });

    return (
        <div className="max-w-4xl mx-auto py-10">
            <h1 className="text-3xl font-bold mb-2">Edit Events</h1>
            <p className="text-sm text-gray-500 mb-6">{event.title} — {new Date(event.date).toLocaleDateString()}</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4">Matches</h2>

            {matches.length === 0 ? (
                <p className="text-gray-400 italic">No matches yet.</p>
            ) : (
                <ul className="space-y-4">
                    {matches.map(match => (
                        <li key={match.id} className="bg-gray-900 p-4 rounded">
                            <h3 className="text-lg font-semibold text-white">{match.title}</h3>
                            <p className="text-gray-300">{match.type} • {match.duration ? `${match.duration} min` : 'TBD'}</p>
                            <p className="text-yellow-300 mt-1">{match.result || 'Result pending'}</p>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {match.participants.map(p => (
                                    <Link
                                        key={p.id}
                                        href={`/wrestlers/${p.wrestler.slug}`}
                                        className={`px-2 py-1 rounded text-sm font-medium ${p.isWinner ? 'bg-green-500 text-black' : 'bg-gray-700 text-white'}`}
                                    >
                                        {p.wrestler.name} {p.isWinner && '✅'}
                                    </Link>
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            <h2 className="text-2xl font-semibold mt-10 mb-4">Add Match</h2>
            <form action={`/api/admin/edit-event/${event.id}/add-match`} method="POST" className="space-y-4">
                <input type="hidden" name="eventId" value={event.id} />
                <input type="text" name="title" placeholder="Match Title" className="w-full p-2 rounded bg-gray-800 text-white" required />
                <input type="text" name="type" placeholder="Match Type (e.g. Singles)" className="w-full p-2 rounded bg-gray-800 text-white" />
                <input type="text" name="duration" placeholder="Duration (mins)" className="w-full p-2 rounded bg-gray-800 text-white" />
                <input type="text" name="result" placeholder="Result (e.g. 'Wrestler A def. Wrestler B')" className="w-full p-2 rounded bg-gray-800 text-white" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i}>
                            <label className="block mb-1 text-sm text-white">Participant {i + 1}</label>
                            <select name={`participants[${i}].wrestlerId`} className="w-full p-2 rounded bg-gray-800 text-white" required>
                                <option value="">— Select Wrestler —</option>
                                {wrestlers.map(wrestler => (
                                    <option key={wrestler.id} value={wrestler.id}>{wrestler.name}</option>
                                ))}
                            </select>
                            <label className="text-sm text-white inline-flex items-center mt-1">
                                <input type="checkbox" name={`participants[${i}].isWinner`} className="mr-2" /> Winner
                            </label>
                            <input
                              type="number"
                              name={`participants[${i}].team`}
                              placeholder="Team #"
                              min="1"
                              className="w-full p-2 mt-2 rounded bg-gray-800 text-white"
                            />
                        </div>
                    ))}
                </div>

                <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded font-bold">
                    Save Match
                </button>
            </form>
        </div>
    );
}