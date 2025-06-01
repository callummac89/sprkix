'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ReviewForm({ eventId, user, isUpcoming }: { eventId: string, user: any, isUpcoming?: boolean }) {
    const [comment, setComment] = useState('')
    const [rating, setRating] = useState(0)
    const [submitting, setSubmitting] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)

        await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                eventId,
                rating: isUpcoming ? null : rating,
                comment,
                userId: user.id,
                userName: user.name,
            }),
        })

        setComment('')
        setRating(0)
        setSubmitting(false)
        router.refresh()
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      <textarea
          className="w-full border p-2 rounded text-black"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={isUpcoming ? "Write your comment..." : "Write your review..."}
      />
            {!isUpcoming && (
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        className={`text-2xl ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                        ★
                    </button>
                ))}
              </div>
            )}
            <button
                type="submit"
                disabled={submitting}
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold"
            >
                {submitting ? 'Posting...' : isUpcoming ? 'Post Comment' : 'Post Review'}
            </button>
        </form>
    )
}