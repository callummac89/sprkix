import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function WrestlersPage() {
    const wrestlers = await prisma.wrestler.findMany({
        orderBy: { name: 'asc' },
    })

    return (
      <main className="bg-[#0a0a0a] min-h-screen text-white py-12 px-6">
        <h1 className="text-5xl font-extrabold text-yellow-400 text-center mb-12 tracking-tight">
          Wrestlers
        </h1>

        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {wrestlers.map((wrestler) => (
            <Link
              key={wrestler.id}
              href={`/wrestlers/${wrestler.slug}`}
              className="bg-gradient-to-b from-black to-gray-900 border border-yellow-400 rounded-xl p-4 hover:shadow-yellow-400 shadow-xl hover:scale-[1.02] transition-all duration-200"
            >
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(wrestler.name)}&background=000000&color=FFD700&size=256`}
                alt={wrestler.name}
                className="w-full h-52 object-cover rounded-lg border border-yellow-500 mb-4"
              />

              <div className="text-sm font-bold inline-block bg-yellow-400 text-black px-3 py-1 rounded-full mb-2 uppercase tracking-wide">
                {wrestler.promotion}
              </div>

              <h2 className="text-xl font-bold text-white mb-1">{wrestler.name}</h2>
              <p className="text-xs text-gray-400">
                Added: {new Date(wrestler.createdAt).toLocaleDateString()}
              </p>
            </Link>
          ))}
        </div>
      </main>
    )
}