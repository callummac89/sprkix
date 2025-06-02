import { prisma } from '../../../lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import { getUserFromServerCookie } from '../../../lib/auth' // Assuming this import is needed for getUserFromCookie
import { type Metadata } from 'next'

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  return { title: `User – ${params.slug}` }
}

export default async function PublicProfilePage(
  { params }: { params: { slug: string } }
) {
    const user = await prisma.user.findFirst({
        where: {
            slug: {
                equals: params.slug,
              },
        },
        include: {
            reviews: {
                include: { event: true },
                orderBy: { createdAt: 'desc' },
            },
            WatchListItem: {
                include: { event: true },
            },
        },
    });

    const currentUser = await getUserFromServerCookie();
    // Default isFollowing to false; only check DB if both users present and different
    let isFollowing = false;
    if (currentUser?.id && user?.id && currentUser.id !== user.id) {
      const follow = await prisma.follow.findFirst({
        where: {
          followerId: currentUser.id,
          followingId: user.id,
        },
      });
      isFollowing = !!follow;
    }

    if (!user) return <p className="text-center mt-10 text-white">User not found.</p>;

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 text-white">
            <h1 className="text-3xl font-bold mb-2">{user.name}</h1>
            <p className="text-sm text-gray-400 mb-8">@{user.slug}</p>
            {currentUser?.id && user?.id && currentUser.id !== user.id && (
              <form
                method="POST"
                action={`/api/follow/${user.id}`}
                className="mb-8"
              >
                <button
                  type="submit"
                  className={`text-sm px-4 py-2 rounded font-medium ${
                    isFollowing ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </form>
            )}

            <h2 className="text-2xl font-semibold mb-4">⭐ Reviews</h2>
            <div className="space-y-4 mb-12">
                {user.reviews.map(review => (
                    <div key={review.id} className="bg-white p-4 rounded shadow flex gap-4 items-start text-black">
                        <Image
                            src={review.event.posterUrl || '/placeholder.png'}
                            alt={review.event.title}
                            width={80}
                            height={120}
                            className="w-20 h-28 object-cover rounded"
                        />
                        <div className="flex-1">
                            <div className="text-sm text-gray-500 flex items-center justify-between">
                                <Link href={`/events/${review.event.slug}`} className="text-black font-semibold hover:underline">
                                    {review.event.title.replace(/–\s\d{4}.*$/, '')}
                                </Link>
                                <span className="ml-4 text-xs text-gray-400">
                  {new Date(review.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                  })}
                </span>
                            </div>
                            <p className="text-sm mt-2">{review.comment}</p>
                            <div className="mt-1 text-yellow-500 text-sm">
                                {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                            </div>
                        </div>
                    </div>
                ))}
                {user.reviews.length === 0 && <p className="text-sm text-gray-400">No reviews yet.</p>}
            </div>

            <h2 className="text-2xl font-semibold mb-4">📺 Watch List</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {user.WatchListItem.map(item => (
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
                        <div className="p-3 text-black">
                            <h3 className="text-sm font-semibold leading-tight line-clamp-2">
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
                {user.WatchListItem.length === 0 && <p className="text-sm text-gray-400">Nothing in their watch list.</p>}
            </div>
        </div>
    )
}