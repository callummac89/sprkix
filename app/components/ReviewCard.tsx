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
                        ? 'max-h-48 overflow-y-auto'
                        : ''
                } mt-4 space-y-3`}
            >
                {review.Reply.map((reply) => (
                    <div
                        key={reply.id}
                        className="w-full flex items-start gap-3 p-3 bg-[#1a1a1a] rounded-lg text-sm text-white"
                    >
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center text-xs font-bold">
                                {reply.user.name?.charAt(0).toUpperCase()}
                            </div>
                        </div>
                        <div className="flex flex-col flex-grow">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-semibold text-white">{reply.user.name}</span>
                                <span className="text-xs text-gray-400">
                                    {new Date(reply.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'short',
                                        day: 'numeric',
                                        hour: 'numeric',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>
                            <p className="text-sm text-gray-100">{reply.comment}</p>
                        </div>
                    </div>
                ))}
            </div>

            {user && <ReplyForm reviewId={review.id} />}
        </div>
    )
}