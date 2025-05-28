import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export async function getUserFromCookie() {
    const cookieStore = cookies() // ✅ no await needed in app router

    const token = cookieStore.get('token')?.value
    if (!token) return null

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!)
        const user = await prisma.user.findUnique({
            where: { id: (decoded as any).id },
        })
        return user
    } catch (err) {
        console.error('❌ JWT verification failed in getUserFromCookie():', err)
        return null
    }
}