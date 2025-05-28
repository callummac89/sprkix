'use client'

import { Review, Reply, User } from '@prisma/client'
import ReplyForm from '../components/ReplyForm'
import { useSession } from 'next-auth/react'

type FullReview = Review & {
    user: User
    Reply: (Reply & { user: User })[]
}

export default function ReviewCard({
                                       review,
                                       user,
                                   }: {
    review: FullReview
    user?: User | null
}) {
    return (
        <div className="bg-white p-4 rounded shadow">
            <div className="flex items-center justify-between">
                <div>
                    <span className="text-black font-semibold">{review.user.name}</span>
                    <span className="ml-2 text-yellow-500">
            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
          </span>
                </div>
                <span className="text-sm text-gray-400 ml-2">
          {new Date(review.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
          })}
        </span>
            </div>

            <p className="mt-2 text-black">{review.comment}</p>

            <div
                className={`${
                    review.Reply.length > 3
                        ? 'max-h-48 overflow-y-auto border border-gray-300 rounded'
                        : ''
                } mt-2 space-y-2`}
            >
                {review.Reply.map((reply) => (
                    <div
                        key={reply.id}
                        className="w-full p-2 bg-gray-100 rounded text-sm text-black"
                    >
                        <div className="flex justify-between">
              <span className="text-black">
                <span className="mr-1">🗨️</span>
                <strong>{reply.user.name}</strong>:
              </span>
                            <span className="text-sm text-gray-400">
                {new Date(reply.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                })}
              </span>
                        </div>
                        <p className="text-black">{reply.comment}</p>
                    </div>
                ))}
            </div>

            {user && <ReplyForm reviewId={review.id} />}
        </div>
    )
}