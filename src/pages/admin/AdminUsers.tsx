import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '@/services'
import { fmtDate, cap } from '@/utils'
import { Spinner } from '@/components/ui/Spinner'
import { Pager } from '@/components/ui/Pagination'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { Search, X } from 'lucide-react'

export default function AdminUsers() {
  const [page,   setPage]   = useState(1)
  const [search, setSearch] = useState('')
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey:        ['admin-users', page, search],
    queryFn:         () =>
      adminApi.users({
        page,
        limit: 15,
        ...(search && { search }),
      }),
    placeholderData: (p) => p,
  })

  const roleM = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminApi.updateRole(id, role),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast('Role updated', 'success')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  const statusM = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminApi.updateStatus(id, active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] })
      toast('Status updated', 'success')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  if (isLoading) return <Spinner full />

  return (
    <div className="p-4 md:p-8 bg-stone-900 text-white min-h-screen">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white">
          Users
        </h1>
        {data && (
          <p className="text-stone-400 text-sm mt-1">
            {data.pagination.total} accounts
          </p>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-2 border border-stone-700 bg-transparent px-3 mb-6 max-w-sm">
        <Search size={15} className="text-stone-400" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search by name or email…"
          className="flex-1 py-2.5 text-sm outline-none bg-transparent text-white"
        />
        {search && (
          <button onClick={() => setSearch('')}>
            <X size={14} className="text-stone-400" />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto mt-8">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-stone-400 uppercase border-b border-stone-800">
            <tr>
              {['User', 'Email', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                <th
                  key={h}
                  className="text-left px-4 py-3 font-medium uppercase tracking-widest"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-800">
            {data?.data.map((u) => (
              <tr key={u.id} className="hover:bg-stone-800/50">
                <td className="px-4 py-3 font-medium">
                  {u.firstName} {u.lastName}
                </td>
                <td className="px-4 py-3 text-stone-400">
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={u.role}
                    onChange={(e) =>
                      roleM.mutate({ id: u.id, role: e.target.value })
                    }
                    disabled={roleM.isPending}
                    className="input-dark text-xs py-1.5 appearance-none w-32"
                  >
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-stone-400 text-xs">
                  {fmtDate(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${u.isActive ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                    {u.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() =>
                      statusM.mutate({ id: u.id, active: !u.isActive })
                    }
                    disabled={statusM.isPending}
                    className={`text-xs font-medium transition-colors ${
                      u.isActive
                        ? 'text-red-400 hover:text-red-300'
                        : 'text-green-400 hover:text-green-300'
                    }`}
                  >
                    {u.isActive ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.data.length && (
          <div className="p-10 text-center text-stone-400 text-sm">
            No users found.
          </div>
        )}
      </div>

      {data?.pagination && (
        <Pager p={data.pagination} onChange={setPage} />
      )}

    </div>
  )
}