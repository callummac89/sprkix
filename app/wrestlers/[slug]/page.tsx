import { prisma } from '@lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default async function WrestlerPage({ params }: { params: { slug: string } }) {
    const wrestler = await prisma.wrestler.findUnique({
        where: { slug: params.slug },
        include: {
            matches: {
                include: {
                    match: {
                        include: {
                            event: true,
                            participants: { include: { wrestler: true } },
                        },
                    },
                },
            },
        },
    });

    if (!wrestler) return notFound();

    return (
        <div className="max-w-10xl mx-auto">
            <div className="flex items-start gap-6">
                <div className="w-[720px] aspect-[3/4] rounded shadow overflow-hidden">
                  <Image
                    src={wrestler.imageUrl || '/placeholder.png'}
                    alt={wrestler.name}
                    width={300}
                    height={400}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                    <h1 className="text-4xl font-bold text-white">{wrestler.name}</h1>
                    <p className="text-sm text-gray-400 mt-1">Pro Wrestler Profile</p>
                    <p className="mt-4 italic text-white">{wrestler.bio || 'No bio yet.'}</p>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold text-white mb-4">Matches</h2>
                {wrestler.matches.length > 0 ? (
                    <ul className="space-y-4">
                        {wrestler.matches.map(mp => (
                            <li key={mp.match.id} className="bg-white p-4 rounded shadow">
                                <Link
                                    href={`/events/${mp.match.event.slug}`}
                                    className="text-base text-yellow-600 hover:underline font-semibold block"
                                >
                                    {mp.match.event.title}
                                </Link>
                                <p
                                  className="text-lg font-bold text-black"
                                  dangerouslySetInnerHTML={{
                                    __html: (() => {
                                      let result = mp.match.result || 'No result';
                                      mp.match.participants.forEach(({ wrestler }) => {
                                        const escapedName = wrestler.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
                                        const regex = new RegExp(`\\b${escapedName}\\b`, 'g');
                                        result = result.replace(
                                          regex,
                                          `<a href="/wrestlers/${wrestler.slug}" class="underline hover:text-yellow-500">${wrestler.name}</a>`
                                        );
                                      });
                                      return result;
                                    })(),
                                  }}
                                />
                                {mp.match.title && (
                                  <p className="text-base text-black mt-1">{mp.match.title}</p>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-300 italic">No matches listed yet.</p>
                )}
            </div>
        </div>
    )
}