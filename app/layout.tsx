import './globals.css'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import Header from './components/Header'

export const metadata = {
    title: 'sprkix',
    description: 'Discover. Rate. Share Pro Wrestling Events.',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')?.value
    let user = null

    if (token) {
        try {
            user = jwt.verify(token, process.env.JWT_SECRET as string)
        } catch {
            user = null
        }
    }

    return (
        <html lang="en">
        <body className="bg-gradient-to-b from-[#0d1020] to-black text-white min-h-screen">
        <Header user={user} />
        <main className="max-w-7xl mx-auto px-6 py-10">{children}</main>
        <footer className="mt-16 border-t text-center text-sm text-gray-500 py-8 px-6 max-w-7xl mx-auto">
            © {new Date().getFullYear()} Superkick. Built with ❤️ for wrestling fans.
        </footer>
        </body>
        </html>
    )
}