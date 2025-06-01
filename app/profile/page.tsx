import { prisma } from '../../lib/prisma'
import { getUserFromServerCookie } from '../../lib/server-auth'
import Link from 'next/link'
import Image from 'next/image'

export default async function ProfilePage() {
  const user = await getUserFromServerCookie()
  if (!user) return <p className="text-center mt-10">You must be logged in.</p>

  const [reviews, watchList] = await Promise.all([
    prisma.review.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { event: true },
    }),
    prisma.watchListItem.findMany({
      where: { userId: user.id },
      include: { event: true },
    }),
  ])

  return (
    <div className="max-w-10xl mx-auto">
      {/* Profile Header */}
      <div className="flex items-center gap-6 mb-12 bg-white p-6 rounded shadow">
        <div className="w-20 h-20 flex items-center justify-center rounded-full bg-gray-300 text-3xl font-bold text-gray-700">
          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-black">{user.name || 'Your Profile'}</h1>
          <p className="text-gray-600 mt-1">This is your bio. You can update it later.</p>
          <div className="flex gap-6 mt-3 text-gray-500 text-sm">
            <span><strong>0</strong> Followers</span>
            <span><strong>0</strong> Following</span>
          </div>
        </div>
      </div>


      <h2 className="text-2xl font-semibold mb-4">⭐ Your Reviews</h2>
      <div className="max-h-[500px] overflow-y-auto space-y-4 mb-12 pr-1">
        {reviews.map(review => (
          <div key={review.id} className="bg-white p-4 rounded shadow flex gap-4 items-start">
            <Image
              src={review.event.posterUrl || '/placeholder.png'}
              alt={review.event.title}
              width={80}
              height={120}
              className="w-20 h-28 object-cover rounded"
            />
            <div className="flex-1">
              <div className="text-sm text-gray-500 flex items-center justify-between">
                <span>
                  <strong>You</strong> on{' '}
                  <Link href={`/events/${review.event.slug}`} className="text-black font-semibold hover:underline">
                    {review.event.title.replace(/–\s\d{4}.*$/, '')}
                  </Link>
                </span>
                <span className="ml-4 text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              {review.comment && (
                <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{review.comment}</p>
              )}
              <div className="mt-2 text-yellow-500 text-sm">
                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-sm text-gray-400">You haven't left any reviews yet.</p>}
      </div>

      <h2 className="text-2xl font-semibold mb-4">📺 Your Watch List</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {watchList.map(item => (
          <Link
            key={item.id}
            href={`/events/${item.event.slug}`}
            className="bg-white hover:shadow-lg transition border rounded-lg overflow-hidden flex flex-col"
          >
            <Image
              src={item.event.posterUrl || '/placeholder.png'}
              alt={item.event.title}
              width={300}
              height={400}
              className="w-full h-[200px] object-cover"
            />
            <div className="p-3">
              <h3 className="text-sm font-semibold text-black leading-tight line-clamp-2">
                {item.event.title.replace(/–\s\d{4}.*$/, '')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(item.event.date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Link>
        ))}
        {watchList.length === 0 && <p className="text-sm text-gray-400">Your watch list is empty.</p>}
      </div>

    </div>
  )
}