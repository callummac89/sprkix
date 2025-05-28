'use client'

import { useState } from 'react'

export default function WatchListButton({ eventId, isSavedInitial }: { eventId: string, isSavedInitial: boolean }) {
    const [isSaved, setIsSaved] = useState(isSavedInitial)

    const toggleWatchlist = async () => {
        const method = isSaved ? 'DELETE' : 'POST'

        await fetch('/api/watchlist', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventId }),
        })

        setIsSaved(!isSaved)
    }

    return (
        <button
            onClick={toggleWatchlist}
            className={`text-sm px-2 py-1 rounded ${isSaved ? 'bg-green-500' : 'bg-yellow-400'} text-black font-semibold`}
        >
            {isSaved ? '✓ In Watch List' : '+ Watch List'}
        </button>
    )
}