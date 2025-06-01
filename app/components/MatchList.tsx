// components/MatchList.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MatchRating from './MatchRating'
import StarRating from './StarRating'

export default function MatchList({ matches }: { matches: any[] }) {
    const [showSpoilers, setShowSpoilers] = useState(false)
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        fetch('/api/me')
          .then(res => res.ok ? res.json() : null)
          .then(data => setUser(data?.user || null))
          .catch(() => setUser(null))
    }, [])

    return (
        <div className="mt-10">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Match Card</h2>
                <button
                    type="button"
                    onClick={() => setShowSpoilers(prev => !prev)}
                    className="text-sm text-yellow-400 hover:underline"
                >
                    {showSpoilers ? 'Hide Spoilers' : 'Show Spoilers'}
                </button>
            </div>
            <ul className="space-y-4">
                {matches.map(match => (
                    <li key={match.id} className={`bg-white p-4 rounded shadow transition duration-200 ${showSpoilers ? '' : 'blur-sm select-none'}`}>
                      <div className="flex justify-between items-start gap-8">
                        <div className="flex-1">
                          <h3
                            className="text-lg font-bold text-black"
                            dangerouslySetInnerHTML={{
                                __html: (() => {
                                    let result = match.result || match.title
                                    match.participants.forEach(({ wrestler }) => {
                                        const escapedName = wrestler.name.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
                                        const regex = new RegExp(`\\b${escapedName}\\b`, 'g')
                                        result = result.replace(
                                            regex,
                                            `<a href="/wrestlers/${wrestler.slug}" class="underline hover:text-yellow-400">${wrestler.name}</a>`
                                        )
                                    })
                                    return result
                                })(),
                            }}
                          />
                          {match.title && (
                            <p className="text-sm text-black mt-1">{match.title}</p>
                          )}
                          <p className="text-sm text-gray-600">
                              {match.type} • {match.duration || '?'} min
                          </p>
                        </div>
                        <div className="flex flex-col items-center justify-center">
                            <StarRating
                                matchId={match.id}
                                initialRating={match.userRating || 0}
                                averageRating={match.averageRating || 0}
                                user={user}
                                showAverage={true}
                                hideStarLabel={true}
                            />
                        </div>
                      </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}