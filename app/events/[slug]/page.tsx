import Link from 'next/link'
import { prisma } from '../../../lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReviewForm from '../../components/ReviewForm'
import WatchListButton from '../../components/WatchListButton'
import ReplyForm from '../../components/ReplyForm'
import { getUserFromCookie } from '../../../lib/auth'

export default async function EventPage({ params }: { params: { slug: string } }) {
    const event = await prisma.event.findUnique({
        where: { slug: params.slug },
        include: {
            matches: { orderBy: { order: 'asc' } },
            reviews: {
                include: {
                    user: true,
                    Reply: {
                        include: { user: true },
                        orderBy: { createdAt: 'asc' },
                    },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    })

    if (!event) return notFound()

    const ratings = event.reviews.map(r => r.rating)
    const averageRating = ratings.length
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : null

    const user = await getUserFromCookie()
    const inWatchList = user
      ? await prisma.watchListItem.findFirst({
          where: { userId: user.id, eventId: event.id },
        })
      : null

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="flex gap-8">
                <Image
                    src={event.posterUrl || '/placeholder.png'}
                    alt={event.title}
                    width={300}
                    height={450}
                    className="rounded shadow"
                />
                <div>
                    <h1 className="text-4xl font-bold">
                      {event.title.replace(/–\s\d{4}-\d{2}-\d{2}$/, '')}
                    </h1>
                    <p className="text-sm text-gray-500">
                      {new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <div className="mt-2 flex gap-2">
                      {user && (
                        <WatchListButton eventId={event.id} isSavedInitial={!!inWatchList} />
                      )}
                      <span className="inline-block px-3 py-2 bg-yellow-400 text-sm font-bold rounded text-black">
                        {event.promotion}
                      </span>
                    </div>
                    {averageRating !== null && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold">Average Rating:</span>
                            <span className="text-yellow-500">
                                {'★'.repeat(Math.floor(averageRating)) + (averageRating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(averageRating))}
                            </span>
                            <span className="text-sm text-gray-500">({event.reviews.length} reviews)</span>
                        </div>
                    )}
                    <p className="mt-4 italic text-gray-600">
                        {event.description || 'There is currently no event description.'}
                    </p>
                </div>
            </div>

            <h2 className="mt-10 text-2xl font-bold">Match Card</h2>
            {event.matches.length > 0 ? (
                <ul className="mt-2 space-y-2">
                    {event.matches.map((match) => (
                        <li key={match.id} className="bg-white p-4 rounded shadow">
                            {match.result}
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="italic text-gray-500 mt-2">No matches available yet.</p>
            )}

            <div className="mt-10">
                <h2 className="text-2xl font-bold">Leave a Review</h2>
                {user ? (
                    <ReviewForm eventId={event.id} user={user} />
                ) : (
                    <p className="italic text-gray-500 mt-2">You must be logged in to leave a review.</p>
                )}
            </div>

            <div className="mt-10">
                <h2 className="text-2xl font-bold">Reviews</h2>
                <Link href={`/events/${event.slug}/reviews/popular`} className="text-sm text-yellow-400 text-left hover:underline">
                    See all reviews →
                </Link>
                {event.reviews.length > 0 ? (
                    <ul className="mt-4 space-y-4">
                        {event.reviews.slice(0, 3).map((review) => (
                            <li key={review.id} className="bg-white p-4 rounded shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-black font-semibold">{review.user.name}</span>
                                        <span className="ml-2 text-yellow-500">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-400 ml-2">
                                      {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </span>
                                </div>
                                <p className="mt-2 text-black">{review.comment}</p>
                                <div className={`${review.Reply.length > 3 ? 'max-h-48 overflow-y-auto border border-gray-300 rounded' : ''} mt-2 space-y-2`}>
                                  {review.Reply.map(reply => (
                                    <div key={reply.id} className="w-full p-2 bg-gray-100 rounded text-sm text-black">
                                      <div className="flex justify-between">
                                        <span className="text-black"><span className="mr-1">🗨️</span><strong>{reply.user.name}</strong>:</span>
                                        <span className="text-sm text-gray-400">
                                          {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                          })}
                                        </span>
                                      </div>
                                      <p className="text-black">{reply.comment}</p>
                                    </div>
                                  ))}
                                </div>
                                {user && <ReplyForm reviewId={review.id} />}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-500 mt-2">No reviews yet.</p>
                )}
            </div>
        </div>
    )
}