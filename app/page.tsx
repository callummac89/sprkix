import { prisma } from '../lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { getUserFromServerCookie } from '../lib/server-auth';

export default async function HomePage() {
    const user = await getUserFromServerCookie();

    const [events, reviews, upcomingEvents] = await Promise.all([
        prisma.event.findMany({
            where: {
                date: {
                    lte: new Date(),
                },
            },
            orderBy: { date: 'desc' },
            take: 5,
        }),
        prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { event: true, user: true },
        }),
        prisma.event.findMany({
            where: {
                date: {
                    gt: new Date(),
                },
            },
            orderBy: { date: 'asc' },
            take: 10,
        }),
    ]);

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
                ...event,
                averageRating: R,
                weightedRating,
                reviewCount: v,
            };
        })
        .sort((a, b) => b.weightedRating - a.weightedRating)
        .slice(0, 10);

    const allMatchesWithRatings = await prisma.match.findMany({
        include: {
            ratings: {
                select: { rating: true }
            },
            event: true
        },
    });

    const allMatchRatings = allMatchesWithRatings.flatMap(m => m.ratings.map(r => r.rating));
    const globalMatchAverage = allMatchRatings.length
        ? allMatchRatings.reduce((a, b) => a + b, 0) / allMatchRatings.length
        : 0;

    const topRatedMatches = allMatchesWithRatings
        .map(match => {
            const ratings = match.ratings.map(r => r.rating);
            const R = ratings.reduce((a, b) => a + b, 0) / (ratings.length || 1);
            const v = ratings.length;
            const m = minReviews;
            const C = globalMatchAverage;

            const weightedRating = (v / (v + m)) * R + (m / (v + m)) * C;

            return {
                ...match,
                averageRating: R,
                weightedRating,
                reviewCount: v,
            };
        })
        .sort((a, b) => b.weightedRating - a.weightedRating)
        .slice(0, 10);

    return (
        <div>
            {/* Hero with background image */}
            <div className="relative text-center bg-[#0d1020] rounded-t-lg py-24 text-white overflow-hidden mb-12">
                <div className="absolute inset-0 z-0">
                    <Image
                        src="https://media.themoviedb.org/t/p/w1066_and_h600_bestv2/vl5NLG3ArO2Q6eMXhP8FgMuCnnr.jpg"
                        alt="Header Background"
                        fill
                        className="object-cover rounded-lg"
                        priority
                    />
                    {/* Dark overlay */}
                    <div className="absolute inset-0 bg-black opacity-60 rounded-lg" />
                    {/* Bottom fade */}
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-yellow-800 z-10" />
                </div>

                <div className="relative z-10 pt-40 pb-20">
                    <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3 drop-shadow-md">Welcome to sprkix</h1>
                    <p className="text-gray-100 mb-8 text-lg drop-shadow-sm">Rate. Review. Discover Pro Wrestling.</p>

                    <div className="flex justify-center gap-4">
                        <Link href="/events" className="bg-yellow-400 text-black font-bold py-3 px-6 rounded shadow-md transition hover:bg-black hover:text-white">Explore Events</Link>
                        { !user && (
                          <Link href="/register" className="bg-yellow-400 text-black font-bold py-3 px-6 rounded shadow-md transition hover:bg-black hover:text-white">Sign Up</Link>
                        )}
                    </div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">🆕 Latest Events</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                {events.map(event => (
                    <Link key={event.id} href={`/events/${event.slug}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-yellow-400">
                        <div className="relative">
                            <div className="absolute top-2 left-2 z-10">
                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">{event.promotion}</span>
                            </div>
                            <Image
                                src={event.posterUrl || '/placeholder.png'}
                                alt={event.title}
                                width={500}
                                height={750}
                                className="w-full h-[350px] object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <h3 className="text-sm font-semibold text-black group-hover:text-black">
                                {event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            <h2 className="text-2xl font-bold mb-6">📅 Upcoming Events</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                {upcomingEvents.map(event => (
                    <Link key={event.id} href={`/events/${event.slug}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-yellow-400">
                        <div className="relative">
                            <div className="absolute top-2 left-2 z-10">
                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">{event.promotion}</span>
                            </div>
                            <Image
                                src={event.posterUrl || '/placeholder.png'}
                                alt={event.title}
                                width={500}
                                height={750}
                                className="w-full h-[350px] object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <h3 className="text-sm font-semibold text-black group-hover:text-black">
                                {event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            <h2 className="text-2xl font-bold mb-6">🏆 Top Rated Events</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                {topRated.map((event, index) => (
                  <Link key={event.id} href={`/events/${event.slug}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-yellow-400">
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 flex gap-1 items-center">
                        <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">{event.promotion}</span>
                        <span className="bg-black text-yellow-400 text-xs font-bold px-2 py-1 rounded-full w-6 h-6 flex items-center justify-center">
                          {index + 1}
                        </span>
                      </div>
                      <Image
                        src={event.posterUrl || '/placeholder.png'}
                        alt={event.title}
                        width={500}
                        height={750}
                        className="w-full h-[300px] object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-gray-500">{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      <h3 className="text-sm font-semibold text-black group-hover:text-black">
                        {event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}
                      </h3>
                    </div>
                  </Link>
                ))}
              </div>

            <h2 className="text-2xl font-bold mb-6">🎯 Top Rated Matches</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                {topRatedMatches.map((match, index) => (
                    <Link key={match.id} href={`/events/${match.event.slug}#${match.id}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden hover:ring-2 hover:ring-offset-2 hover:ring-yellow-400">
                        <div className="relative">
                            <div className="absolute top-2 left-2 z-10 flex gap-1 items-center">
                                <span className="bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded">{match.event.promotion}</span>
                                <span className="bg-black text-yellow-400 text-xs font-bold px-2 py-1 rounded-full w-6 h-6 flex items-center justify-center">
                                    {index + 1}
                                </span>
                            </div>
                            <Image
                                src={match.event.posterUrl || '/placeholder.png'}
                                alt={match.title}
                                width={500}
                                height={750}
                                className="w-full h-[300px] object-cover"
                            />
                        </div>
                        <div className="p-3">
                            <p className="text-xs text-gray-500">{new Date(match.event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                            <h3 className="text-sm font-semibold text-black group-hover:text-black">
                              {match.result?.replace(' def. ', ' vs. ') || match.title}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="flex justify-start mt-4 mb-10">
              <Link href="/events" className="text-sm font-bold text-black hover:underline">See All</Link>
            </div>

            <h2 className="text-2xl font-bold mb-6">⭐ Latest Reviews</h2>

            <div className="grid gap-6 max-h-[500px] overflow-y-auto pr-1">
                {reviews.map(review => (
                    <Link key={review.id} href={`/events/${review.event.slug}`} className="bg-white p-4 rounded shadow flex gap-4 items-start hover:shadow-md transition">
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
                                <strong>{review.user.name}</strong> on{' '}
                                <span className="text-black font-semibold underline">{review.event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}</span>
                              </span>
                              <span className="ml-4 text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                            </div>
                            {review.comment && (
                                <p className="text-sm text-gray-800 mt-2 whitespace-pre-line">{review.comment}</p>
                            )}
                            <div className="mt-2 text-yellow-500 text-sm">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    )
}