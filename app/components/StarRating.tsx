// components/StarRating.tsx
'use client'

import React, { useState } from 'react'

export default function StarRating({
  matchId,
  initialRating,
  averageRating,
  user,
}: {
  matchId: string
  initialRating: number
  averageRating: number
  user: any
}) {
  const stars = [1, 2, 3, 4, 5]

  const [rating, setRating] = useState(initialRating)
  const [hovered, setHovered] = useState<number | null>(null)
  const [avg, setAvg] = useState(averageRating)

  const handleClick = async (star: number) => {
    if (!user || !user.id) {
      console.warn('User not logged in or user ID missing – rating not submitted.')
      return
    }

    if (!matchId) {
      console.error('Match ID is missing – cannot submit rating.')
      return
    }

    try {
      setRating(star)

      console.log('Submitting rating:', { matchId, userId: user.id, rating: star })

      const res = await fetch(`/api/matches/${matchId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating: star, matchId, userId: user.id }),
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Rating submission successful:', data)
        setRating(star)        // Update user's rating in UI
        setAvg(data.average)   // Update average rating from server
      } else {
        const errorText = await res.text()
        console.error('Rating submission failed:', errorText)
      }
    } catch (error) {
      console.error('Error submitting rating:', error)
    }
  }

  return (
    <div>
      <div className="flex gap-1">
        {stars.map(star => (
          <button
            key={star}
            disabled={!user}
            onClick={() => handleClick(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(null)}
            className={`text-xl ${
              star <= (hovered ?? rating) ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-500`}
            type="button"
          >
            ★
          </button>
        ))}
      </div>
      {avg !== null && (
        <p className="text-sm text-gray-500 mt-1">
          Average rating: {avg.toFixed(1)} ★
        </p>
      )}
    </div>
  )
}