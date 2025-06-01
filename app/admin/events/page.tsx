import { getUserFromServerCookie } from '../../../lib/getUserFromServerCookie'
import { redirect } from 'next/navigation'
import AdminEventsPage from './AdminEventsPage'

export default async function AdminPageWrapper() {
    const user = await getUserFromServerCookie()

    return <AdminEventsPage />
}