// app/admin/page.tsx
import { prisma } from '../../lib/prisma'
// import { getUserFromServerCookie } from '../../lib/getUserFromServerCookie'
// import { redirect } from 'next/navigation'

export default async function AdminHome() {
    // const user = await getUserFromServerCookie()
    // if (!user || !user.isAdmin) {
    //     redirect('/')
    // }

    const userCount = await prisma.user.count()
    const eventCount = await prisma.event.count()
    const wrestlerCount = await prisma.wrestler.count()
    const matchCount = await prisma.match.count()

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4 text-black">Admin Dashboard</h1>
            <p className="mt-4 text-sm text-gray-500">Total users registered: <span className="font-semibold">{userCount}</span></p>
            <p className="mt-2 text-sm text-gray-500">Total events listed: <span className="font-semibold">{eventCount}</span></p>
            <p className="mt-2 text-sm text-gray-500">Total wrestlers: <span className="font-semibold">{wrestlerCount}</span></p>
            <p className="mt-2 text-sm text-gray-500">Total matches: <span className="font-semibold">{matchCount}</span></p>
        </div>
    )
}