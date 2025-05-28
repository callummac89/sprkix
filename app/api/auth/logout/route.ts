import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
    // Clear the token cookie
    cookies().set({
        name: 'token',
        value: '',
        path: '/',
        maxAge: 0,
        httpOnly: true,
    })

    return NextResponse.json({ message: 'Logged out' })
}