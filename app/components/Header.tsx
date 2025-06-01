'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function Header({ user }: { user: any }) {
    const logout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        window.location.href = '/login'
    }

    const [menuOpen, setMenuOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')

    return (
        <>
        <header className="bg-black text-white sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                <Link href="/" className="flex items-center">
                  <Image src="/img/logo.png" alt="Sprkix Logo" width={100} height={26} priority />
                </Link>
                <nav className="flex items-center">
                  <div className="hidden md:flex space-x-6 items-center">
                    <Link href="/events" className="hover:text-yellow-400">Events</Link>
                    <Link href="/wrestlers" className="hover:text-yellow-400">Wrestlers</Link>
                    {user ? (
                        <div className="flex items-center gap-4">
                            <button onClick={logout} className="hover:text-red-600">Logout</button>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-yellow-400 text-black text-xs font-bold flex items-center justify-center">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <Link href="/profile" className="text-yellow-400 font-medium hover:underline">
                                  {user.name}
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-yellow-400">Login</Link>
                            <Link href="/register" className="hover:text-yellow-400">Register</Link>
                        </>
                    )}
                  </div>
                  <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden ml-4">
                    <span className="text-yellow-400 text-xl font-bold">☰</span>
                  </button>
                </nav>
            </div>
        </header>
        {menuOpen && (
          <div className="md:hidden fixed top-16 left-0 right-0 bg-black text-white px-6 py-4 space-y-3 z-50">
            <Link href="/events" className="block hover:text-yellow-400">Events</Link>
            <Link href="/wrestlers" className="block hover:text-yellow-400">Wrestlers</Link>
            {user ? (
              <>
                <Link href="/profile" className="block hover:text-yellow-400">Profile</Link>
                <button onClick={logout} className="block text-left hover:text-red-600">Logout</button>
              </>
            ) : (
              <>
                <Link href="/login" className="block hover:text-yellow-400">Login</Link>
                <Link href="/register" className="block hover:text-yellow-400">Register</Link>
              </>
            )}
          </div>
        )}
        </>
    )
}