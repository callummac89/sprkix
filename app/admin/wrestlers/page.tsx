import { prisma } from '../../../lib/prisma'
import Link from 'next/link'

export default async function WrestlerAdminPage() {
    const wrestlers = await prisma.wrestler.findMany({
        orderBy: { name: 'asc' },
    })

    return (
        <div className="max-w-3xl mx-auto py-10">
            <h1 className="text-black text-3xl font-bold mb-6">Manage Wrestlers</h1>

            <form action="/api/admin/add-wrestler" method="POST" encType="multipart/form-data" className="space-y-4 mb-10">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input name="name" className="w-full p-2 border rounded text-black" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input name="slug" className="w-full p-2 border rounded text-black" placeholder="e.g. cody-rhodes" required />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image Upload</label>
                    <input type="file" name="image" accept="image/*" className="w-full p-2 border rounded text-black bg-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                    <textarea name="bio" className="w-full p-2 border rounded text-black" rows={3} />
                </div>

                <button type="submit" className="bg-yellow-400 text-black px-4 py-2 rounded font-bold">Add Wrestler</button>
            </form>

            <h2 className="text-black text-xl font-semibold mb-4">All Wrestlers</h2>
            <ul className="space-y-2">
                {wrestlers.map(w => (
                    <li key={w.id} className="bg-white border p-3 rounded shadow flex justify-between">
                        <span className="text-black">{w.name}</span>
                        <span className="text-sm text-gray-500">{w.slug}</span>
                    </li>
                ))}
            </ul>
        </div>
    )
}