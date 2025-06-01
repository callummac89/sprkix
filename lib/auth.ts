// lib/auth.ts — Server-only helper. Do not import in client or `pages/` components!
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'

export async function getUserFromServerCookie() {
    const token = cookies().get('token')?.value
    if (!token) return null

    try {
        const { userId } = jwt.verify(token, process.env.JWT_SECRET!)
        return await prisma.user.findUnique({ where: { id: userId } })
    } catch {
        return null
    }
}