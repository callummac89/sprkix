'use client'
import { useState } from 'react'

export default function ReplyForm({ reviewId, onReply, isUpcoming }: { reviewId: string, onReply?: () => void, isUpcoming?: boolean }) {
    const [comment, setComment] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        await fetch('/api/replies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reviewId, comment, rating: isUpcoming ? null : undefined }),
        })

        setComment('')
        setLoading(false)
        if (onReply) onReply()
    }

    return (
        <form onSubmit={handleSubmit} className="mt-2 space-y-2">
      <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full text-sm border border-gray-300 rounded px-3 py-2 text-black"
          rows={2}
          placeholder={isUpcoming ? "Write a comment..." : "Write a reply..."}
      />
            <button
                disabled={loading}
                type="submit"
                className="bg-yellow-400 text-black px-4 py-2 rounded font-semibold hover:bg-yellow-300 transition"
            >
                {loading ? 'Posting...' : isUpcoming ? 'Post Comment' : 'Post Reply'}
            </button>
        </form>
    )
}