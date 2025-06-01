'use client';

import { useState } from 'react';
import Link from 'next/link';

type Event = {
    id: string;
    title: string;
    slug: string;
    date: string;
    promotion: string;
    posterUrl: string | null;
};

export default function EventsGrid({ events }: { events: Event[] }) {
    const [search, setSearch] = useState('');
    const [yearFilter, setYearFilter] = useState('All');
    const [promotionFilter, setPromotionFilter] = useState('All');
    const [showUpcomingOnly, setShowUpcomingOnly] = useState(false);

    const uniqueYears = Array.from(new Set(events.map(e => new Date(e.date).getFullYear()))).sort();
    const uniquePromotions = Array.from(new Set(events.map(e => e.promotion))).sort();

    const filteredEvents = events.filter(event => {
        const normalizedTitle = event.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedPromotion = event.promotion.toLowerCase().replace(/[^a-z0-9]/g, '');
        const normalizedSearch = search.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchesSearch =
          normalizedTitle.includes(normalizedSearch) ||
          normalizedPromotion.includes(normalizedSearch);
        const matchesYear = yearFilter === 'All' || new Date(event.date).getFullYear().toString() === yearFilter;
        const matchesPromotion = promotionFilter === 'All' || event.promotion === promotionFilter;
        const matchesUpcoming = !showUpcomingOnly || new Date(event.date) > new Date();
        return matchesSearch && matchesYear && matchesPromotion && matchesUpcoming;
    });

    // Pagination state
    const EVENTS_PER_PAGE = 20;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(filteredEvents.length / EVENTS_PER_PAGE);
    const paginatedEvents = filteredEvents.slice(
        (currentPage - 1) * EVENTS_PER_PAGE,
        currentPage * EVENTS_PER_PAGE
    );

    return (
        <main className="max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Events</h1>

            <div className="flex flex-wrap gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search events..."
                    className="border border-gray-300 px-4 py-2 rounded w-full sm:w-64 text-black"
                    value={search}
                    onChange={(e) => {
                        setCurrentPage(1);
                        setSearch(e.target.value);
                    }}
                />
                <select
                    className="border border-gray-300 px-4 py-2 rounded text-black"
                    value={yearFilter}
                    onChange={(e) => setYearFilter(e.target.value)}
                >
                    <option value="All">All Years</option>
                    {uniqueYears.map(year => (
                        <option key={year} value={year}>{year}</option>
                    ))}
                </select>
                <select
                    className="border border-gray-300 px-4 py-2 rounded text-black"
                    value={promotionFilter}
                    onChange={(e) => setPromotionFilter(e.target.value)}
                >
                    <option value="All">All Promotions</option>
                    {uniquePromotions.map(promo => (
                        <option key={promo} value={promo}>{promo}</option>
                    ))}
                </select>
                <label className="flex items-center gap-2 text-white text-sm">
                  <input
                    type="checkbox"
                    checked={showUpcomingOnly}
                    onChange={(e) => {
                      setCurrentPage(1);
                      setShowUpcomingOnly(e.target.checked);
                    }}
                    className="w-5 h-5"
                  />
                  Upcoming
                </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {paginatedEvents.map(event => (
                    <Link
                        key={event.id}
                        href={`/events/${event.slug}`}
                        className="group block bg-white rounded-lg shadow transition transform hover:shadow-xl hover:scale-[1.02] duration-200 ease-in-out overflow-hidden border border-transparent hover:border-yellow-300 p-[2px]"
                    >
                        <div className="bg-white rounded-lg overflow-hidden">
                            <div className="relative">
                                <img
                                    src={event.posterUrl || '/placeholder.png'}
                                    alt={event.title}
                                    className="w-full aspect-[3/4] object-cover"
                                />
                                <span className="absolute top-2 left-2 text-xs bg-yellow-400 text-black font-semibold px-2 py-1 rounded">
                                    {event.promotion}
                                </span>
                            </div>
                            <div className="p-3">
                                <h2 className="text-sm font-semibold leading-tight line-clamp-2 text-black">
                                    {event.title.replace(/–\s\d{4}(\s–\s\d{2}\s–\s\d{2}|-\d{2}-\d{2})$/, '').trim()}
                                </h2>
                                <p className="text-xs text-gray-500">
                                    {new Date(event.date).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </p>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination Controls */}
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