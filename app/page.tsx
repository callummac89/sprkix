import { prisma } from '../lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { getUserFromCookie } from '../lib/auth';

export default async function HomePage() {
    const user = await getUserFromCookie();

    const [events, reviews] = await Promise.all([
        prisma.event.findMany({
            orderBy: { date: 'desc' },
            take: 5,
        }),
        prisma.review.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { event: true, user: true },
        }),
    ]);

    const allEventsWithRatings = await prisma.event.findMany({
        include: {
            reviews: {
                select: { rating: true },
            },
        },
    });

    const topRated = allEventsWithRatings
        .map(event => ({
            ...event,
            averageRating:
                event.reviews.reduce((sum, r) => sum + r.rating, 0) /
                (event.reviews.length || 1),
        }))
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, 5);

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
                    <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-b from-transparent to-[#0d1020] z-10" />
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
                    <Link key={event.id} href={`/events/${event.slug}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden">
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
                            <h3 className="text-sm font-semibold text-black group-hover:text-yellow-400">
                                {event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            <h2 className="text-2xl font-bold mb-6">🏆 Top Rated Events</h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-10">
                {topRated.map(event => (
                    <Link key={event.id} href={`/events/${event.slug}`} className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden">
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
                            <h3 className="text-sm font-semibold text-black group-hover:text-yellow-400">
                                {event.title.replace(/– \d{4}(?:[-–]\d{2}){0,2}$/, '').trim()}
                            </h3>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="flex justify-start mt-4 mb-10">
              <Link href="/events" className="text-sm font-bold text-black hover:underline">See All</Link>
            </div>

            <h2 className="text-2xl font-bold mb-6 mt-16">⭐ Latest Reviews</h2>

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