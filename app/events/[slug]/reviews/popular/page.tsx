import { prisma } from '../../../../../lib/prisma'
import { notFound } from 'next/navigation'
import { getUserFromServerCookie } from '../../../../../lib/auth'
import ReviewCard from '@/components/ReviewCard'

export default async function PopularReviewsPage(props: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) {
    const { slug } = await props.params;
    const searchParams = await props.searchParams;

    const pageParam = searchParams?.page
    let page = 1
    if (pageParam) {
        const parsedPage = parseInt(pageParam, 10)
        if (!isNaN(parsedPage) && parsedPage > 0) {
            page = parsedPage
        }
    }

    const event = await prisma.event.findUnique({
        where: { slug },
    })

    if (!event) return notFound()

    const isUpcoming = new Date(event.date) > new Date();

    const skip = (page - 1) * 5

    const reviews = await prisma.review.findMany({
        where: { eventId: event.id },
        include: {
            user: true,
            Reply: { include: { user: true } },
            _count: true, // this lets you access review._count.likes
        },
        orderBy: {
            createdAt: 'desc',
        },
        skip,
        take: 5,
    })

    const user = await getUserFromServerCookie()

    // Pagination logic
    const totalPages = Math.ceil(await prisma.review.count({ where: { eventId: event.id } }) / 5);

    const Pagination = () => (
      <div className="flex justify-center items-center gap-4 mt-8">
        <a
          href={`?page=${Math.max(1, page - 1)}`}
          className={`px-4 py-2 rounded bg-gray-200 text-black ${page === 1 ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Previous
        </a>
        <span>
          Page {page} of {totalPages} {isUpcoming ? 'comments' : 'reviews'}
        </span>
        <a
          href={`?page=${Math.min(totalPages, page + 1)}`}
          className={`px-4 py-2 rounded bg-gray-200 text-black ${page === totalPages ? 'opacity-50 pointer-events-none' : ''}`}
        >
          Next
        </a>
      </div>
    );

    return (
        <div className="max-w-10xl mx-auto">
            <div className="w-full flex gap-6 items-start mb-6">
                <img
                    src={event.posterUrl || '/placeholder.png'}
                    alt={event.title}
                    width={120}
                    height={180}
                    className="rounded shadow"
                />
                <div>
                    <h1 className="text-3xl font-bold">
                        {event.title.replace(/–\s\d{4}-\d{2}-\d{2}$/, '')}
                    </h1>
                    <p className="text-sm text-gray-500 mb-1">
                      {isUpcoming ? 'Comments' : 'Reviews'}
                    </p>
                </div>
            </div>
            <div className="space-y-6">
                {reviews.length > 0 ? (
                    reviews.map(review => (
                        <ReviewCard key={review.id} review={review} user={user} />
                    ))
                ) : (
                    <p className="text-gray-500 italic">No {isUpcoming ? 'comments' : 'reviews'} yet.</p>
                )}
            </div>
            <Pagination />
        </div> 
    )
}