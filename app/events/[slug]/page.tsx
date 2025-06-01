import Link from 'next/link'
import { prisma } from '../../../lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import ReviewForm from '../../components/ReviewForm'
import WatchListButton from '../../components/WatchListButton'
import ReplyForm from '../../components/ReplyForm'
import { getUserFromServerCookie } from '../../../lib/server-auth'
import MatchList from '../../components/MatchList'

import { type PageProps } from 'next';

type Props = PageProps & {
  params: {
    slug: string;
  };
};

export default async function EventPage({ params }: Props) {
    const slug = params.slug // ✅ You do NOT await `params`
    const event = await prisma.event.findUnique({
        where: { slug },
        include: {
            matches: {
                include: {
                    participants: {
                        include: { wrestler: true }
                    },
                    ratings: {
                        select: {
                            rating: true,
                            userId: true
                        }
                    }
                }
            },
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

    const user = await getUserFromServerCookie()
    const userId = user?.id;

    const processedMatches = event.matches.map(match => {
        const userRating = match.ratings.find(r => r.userId === userId)?.rating || 0;
        const averageRating = match.ratings.length
            ? match.ratings.reduce((sum, r) => sum + r.rating, 0) / match.ratings.length
            : 0;

        return { ...match, userRating, averageRating };
    });

    const isUpcoming = new Date(event.date) > new Date();

    const ratings = processedMatches.flatMap(m => m.ratings?.map(r => r.rating) || [])
    const averageRating = ratings.length
        ? parseFloat((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1))
        : null

    const inWatchList = user
      ? await prisma.watchListItem.findFirst({
          where: { userId: user.id, eventId: event.id },
        })
      : null

    // Get all events and rank by weighted rating (considering both average and review count)
    const allEventsWithRatings = await prisma.event.findMany({
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    const allRatings = allEventsWithRatings.flatMap(e => e.reviews.map(r => r.rating));
    const globalAverage = allRatings.length
      ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
      : 0;

    const minReviews = 10;

    const topRated = allEventsWithRatings
      .map(event => {
        const ratings = event.reviews.map(r => r.rating);
        const R = ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);
        const v = ratings.length;
        const m = minReviews;
        const C = globalAverage;

        const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;

        return {
          id: event.id,
          weightedRating,
        };
      })
      .sort((a, b) => b.weightedRating - a.weightedRating)
      .slice(0, 10);

    const eventRank = topRated.findIndex(e => e.id === event.id);


    return (
        <div className="max-w-10xl mx-auto">
            <div className="flex gap-8 items-start">
                <div className="w-[300px] h-[450px] relative rounded shadow overflow-hidden flex-shrink-0">
                  <Image
                    src={event.posterUrl || '/placeholder.png'}
                    alt={event.title}
                    width={300}
                    height={450}
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
                <div>
                    {eventRank !== -1 && (
                      <div className="text-sm text-yellow-600 font-semibold mb-1">
                        🏆 Top 10 Rated Event (#{eventRank + 1})
                      </div>
                    )}
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
                    {!isUpcoming && averageRating !== null && (
                        <div className="mt-2 flex items-center gap-2">
                            <span className="text-sm font-semibold">Average Rating:</span>
                            <span className="text-yellow-500">
                                {'★'.repeat(Math.floor(averageRating)) + (averageRating % 1 >= 0.5 ? '½' : '') + '☆'.repeat(5 - Math.ceil(averageRating))}
                            </span>
                            <span className="text-sm text-gray-500">({event.reviews.length} reviews)</span>
                        </div>
                    )}
                    <p className="mt-4 italic text-white">
                        {event.description || 'There is currently no event description.'}
                    </p>
                    {processedMatches.length > 0 && <MatchList matches={processedMatches} user={user} />}
                </div>
            </div>



            {!isUpcoming && (
              <>
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
                                    <div className={`${review.Reply.length > 3 ? 'max-h-48 overflow-y-auto' : ''} mt-4 space-y-3`}>
                                      {review.Reply.map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="w-full flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg text-sm text-white"
                                        >
                                          <div className="flex-shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-bold">
                                              {reply.user.name?.charAt(0).toUpperCase()}
                                            </div>
                                          </div>
                                          <div className="flex flex-col flex-grow">
                                            <div className="flex justify-between items-center mb-1">
                                              <span className="text-xs font-semibold text-white">{reply.user.name}</span>
                                              <span className="text-xs text-gray-400">
                                                {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                                  year: 'numeric',
                                                  month: 'short',
                                                  day: 'numeric',
                                                  hour: 'numeric',
                                                  minute: '2-digit',
                                                })}
                                              </span>
                                            </div>
                                            <p className="text-sm text-gray-100">{reply.comment}</p>
                                          </div>
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
              </>
            )}
        </div>
    )
}