import { prisma } from '../../lib/prisma'
import WrestlersGrid from './WrestlersGrid'

export default async function WrestlersPage() {
  const wrestlers = await prisma.wrestler.findMany({
    orderBy: { name: 'asc' },
  })

  return <WrestlersGrid wrestlers={wrestlers} />
}