import { requireAdmin } from '@/lib/auth'
import { UserTable } from '@/components/admin/UserTable'

export default async function UsersPage() {
  await requireAdmin()

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Usuarios</h1>
      <UserTable />
    </div>
  )
}
