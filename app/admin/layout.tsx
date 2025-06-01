// app/admin/layout.tsx
import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="admin-dashboard flex min-h-screen">
            <aside className="w-64 bg-black-800 text-white flex flex-col">
                <div className="text-xl font-bold p-6 border-b border-gray-700">sprkix Admin</div>
                <nav className="flex-1 p-4 space-y-4">
                    <Link href="/admin" className="block hover:text-yellow-400">Dashboard</Link>
                    <Link href="/admin/events" className="block hover:text-yellow-400">Events</Link>
                    <Link href="/admin/wrestlers" className="block hover:text-yellow-400">Wrestlers</Link>
                </nav>
            </aside>
            <main className="flex-1 bg-gray-100 p-8">{children}</main>
        </div>
    )
}