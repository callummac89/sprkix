
import { prisma } from '../../../../../lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function EditEventPage({ params }: { params: { id: string } }) {
  const event = await prisma.event.findUnique({ where: { id: params.id } })
  if (!event) return notFound()

  const matches = await prisma.match.findMany({
    where: { eventId: event.id },
    include: {
      participants: {
        include: { wrestler: true }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  const wrestlers = await prisma.wrestler.findMany({
    orderBy: { name: 'asc' }
  })

  return (
    <div className="text-black p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Edit Event</h1>
      <p className="mb-12">{event.title}</p>

      <h2 className="text-2xl font-semibold mb-6">Matches</h2>
      {matches.length === 0 ? (
        <p className="text-gray-500 italic mb-10">No matches yet.</p>
      ) : (
        <ul className="space-y-6 mb-12">
          {matches.map(match => (
            <li key={match.id} className="bg-white border p-6 rounded-lg shadow space-y-2">
              <h3 className="text-lg font-bold">{match.title}</h3>
              <p className="text-sm text-gray-700">{match.type} • {match.duration || '?'} min</p>
              <p className="text-yellow-600">{match.result || 'Result pending'}</p>
              <div className="flex flex-wrap gap-3 mt-2">
                {match.participants.map(p => (
                  <Link
                    key={p.id}
                    href={`/wrestlers/${p.wrestler.slug}`}
                    className={`px-3 py-1 rounded text-sm font-medium ${p.isWinner ? 'bg-green-500 text-black' : 'bg-gray-200 text-gray-900'}`}
                  >
                    {p.wrestler.name} {p.isWinner && '✅'}
                  </Link>
                ))}
              </div>
              {/* Edit match form */}
              <form action={`/api/admin/matches/${match.id}/edit`} method="POST" className="space-y-3 mt-4 bg-gray-50 p-4 rounded">
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Title</label>
                  <input type="text" name="title" defaultValue={match.title} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Result</label>
                  <input type="text" name="result" defaultValue={match.result || ''} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Type</label>
                  <input type="text" name="type" defaultValue={match.type} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700">Duration</label>
                  <input type="number" name="duration" defaultValue={match.duration || ''} className="w-full p-2 border rounded" />
                </div>
                <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-4 py-2 rounded">
                  Update Match
                </button>
              </form>
            </li>
          ))}
        </ul>
      )}

      <h2 className="text-2xl font-semibold mb-6">Add Match</h2>
      <form action={`/api/admin/edit-event/${event.id}/add-match`} method="POST" className="space-y-6">
        <input type="hidden" name="eventId" value={event.id} />
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Match Title</label>
          <input type="text" name="title" placeholder="Match Title" className="w-full p-2 rounded border bg-gray-50" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Match Type</label>
          <input type="text" name="type" placeholder="Match Type (e.g. Singles)" className="w-full p-2 rounded border bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Duration (minutes)</label>
          <input type="number" name="duration" placeholder="Duration (minutes)" className="w-full p-2 rounded border bg-gray-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-800 mb-1">Result</label>
          <input type="text" name="result" placeholder="Result (e.g. 'Cody def. Roman')" className="w-full p-2 rounded border bg-gray-50" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 border rounded space-y-2 bg-white">
              <label className="block text-sm font-medium text-gray-800 mb-1">Participant {i + 1}</label>
              <select name={`participants[${i}].wrestlerId`} className="w-full p-2 rounded border bg-gray-50">
                <option value="">-- Select Wrestler --</option>
                {wrestlers.map(wrestler => (
                  <option key={wrestler.id} value={wrestler.id}>{wrestler.name}</option>
                ))}
              </select>

              <label className="block text-sm font-medium text-gray-800 mt-2">Team</label>
              <input
                type="number"
                name={`participants[${i}].team`}
                placeholder="Team #"
                min="1"
                className="w-full p-2 rounded border bg-gray-50"
              />

              <label className="inline-flex items-center mt-2 text-sm">
                <input type="checkbox" name={`participants[${i}].isWinner`} className="mr-2" />
                Winner
              </label>
            </div>
          ))}
        </div>

        <button
          type="submit"
          className="bg-yellow-400 hover:bg-yellow-500 transition text-black px-5 py-2 rounded font-bold"
        >
          Save Match
        </button>
      </form>
    </div>
  )
}