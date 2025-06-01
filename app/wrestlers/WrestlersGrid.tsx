'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

type Wrestler = {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
};

export default function WrestlersGrid({ wrestlers }: { wrestlers: Wrestler[] }) {
    const [search, setSearch] = useState('');
    const WRESTLERS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);

    const filteredWrestlers = wrestlers
        .filter(w => w.name.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => a.name.localeCompare(b.name));

    const totalPages = Math.ceil(filteredWrestlers.length / WRESTLERS_PER_PAGE);
    const paginated = filteredWrestlers.slice(
        (currentPage - 1) * WRESTLERS_PER_PAGE,
        currentPage * WRESTLERS_PER_PAGE
    );

    return (
        <main className="max-w-10xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Wrestlers</h1>

            <div className="flex flex-wrap gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search wrestlers..."
                    className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 text-black"
                    value={search}
                    onChange={(e) => {
                        setCurrentPage(1);
                        setSearch(e.target.value);
                    }}
                />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">                {paginated.map(wrestler => (
                    <Link
                        key={wrestler.id}
                        href={`/wrestlers/${wrestler.slug}`}
                        className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden border border-transparent hover:border-yellow-300 p-[2px]"
                    >
                        <div className="bg-white rounded-lg overflow-hidden">
                            <Image
                                src={wrestler.imageUrl || '/placeholder.png'}
                                alt={wrestler.name}
                                width={300}
                                height={400}
                                className="w-full aspect-[3/4] object-cover"
                            />
                            <div className="p-3">
                                <h2 className="text-sm font-semibold leading-tight line-clamp-2 text-black">
                                    {wrestler.name}
                                </h2>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        className="px-4 py-2 rounded bg-gray-200 text-black disabled:opacity-50"
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    >
                        Previous
                    </button>
                    <span>
            Page {currentPage} of {totalPages}
          </span>
                    <button
                        className="px-4 py-2 rounded bg-gray-200 text-black disabled:opacity-50"
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    >
                        Next
                    </button>
                </div>
            )}
        </main>
    );
}