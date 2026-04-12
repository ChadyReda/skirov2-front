import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { profileApi } from '@/services'
import { useAuthStore } from '@/store/auth'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'
import { User, MapPin, Lock, Trash2 } from 'lucide-react'

const TABS = [
  { k: 'profile',   l: 'Profile',   I: User   },
  { k: 'addresses', l: 'Addresses', I: MapPin  },
  { k: 'security',  l: 'Security',  I: Lock    },
]

export default function ProfilePage() {
  const [tab, setTab] = useState('profile')
  const { setUser }   = useAuthStore()
  const qc            = useQueryClient()

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn:  profileApi.get,
  })

  const updateM = useMutation({
    mutationFn: profileApi.update,
    onSuccess:  (user) => {
      qc.setQueryData(['profile'], user)
      setUser(user)
      toast('Profile updated', 'success')
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  const rmAddrM = useMutation({
    mutationFn: profileApi.removeAddress,
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['profile'] })
      toast('Address removed', 'info')
    },
  })

  const [pw, setPw] = useState({ c: '', n: '' })

  const pwM = useMutation({
    mutationFn: profileApi.changePw,
    onSuccess:  () => {
      toast('Password changed', 'success')
      setPw({ c: '', n: '' })
    },
    onError: (e) => toast(errMsg(e), 'error'),
  })

  if (isLoading) return <Spinner full />
  if (!profile)  return null

  return (
    <div className="page py-12">
      <h1
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
        className="text-3xl font-normal mb-8"
      >
        My Account
      </h1>

      <div className="flex gap-8 flex-col lg:flex-row">

        {/* Tabs */}
        <nav className="lg:w-48 flex-shrink-0">
          <div className="flex lg:flex-col gap-1">
            {TABS.map(({ k, l, I }) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`flex items-center gap-2.5 px-4 py-3 text-sm font-medium transition-colors text-left w-full ${
                  tab === k
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                <I size={15} /> {l}
              </button>
            ))}
          </div>
        </nav>

        {/* Content */}
        <div className="flex-1">

          {/* Profile tab */}
          {tab === 'profile' && (
            <ProfileTab
              profile={profile}
              onSave={(d) => updateM.mutate(d)}
              saving={updateM.isPending}
            />
          )}

          {/* Addresses tab */}
          {tab === 'addresses' && (
            <div>
              <h2 className="font-medium text-stone-900 mb-5">
                Saved Addresses
              </h2>
              {!profile.addresses?.length ? (
                <div className="bg-white border border-stone-100 p-8 text-center text-stone-400 text-sm">
                  No saved addresses yet.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {profile.addresses?.map((a) => (
                    <div
                      key={a._id}
                      className="bg-white border border-stone-100 p-5 relative"
                    >
                      {a.isDefault && (
                        <span className="badge badge-green absolute top-3 right-3">
                          Default
                        </span>
                      )}
                      <p className="font-medium text-stone-900 text-sm mb-1">
                        {a.label}
                      </p>
                      <address className="not-italic text-sm text-stone-500 leading-relaxed">
                        {a.firstName} {a.lastName}
                        <br />
                        {a.street}
                        {a.apartment && `, ${a.apartment}`}
                        <br />
                        {a.city}, {a.state} {a.zip}
                      </address>
                      <button
                        onClick={() => rmAddrM.mutate(a._id)}
                        className="btn btn-ghost btn-sm text-red-500 hover:text-red-700 mt-3 -ml-2"
                      >
                        <Trash2 size={13} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Security tab */}
          {tab === 'security' && (
            <div className="bg-white border border-stone-100 p-6 max-w-md">
              <h2 className="font-medium text-stone-900 mb-5">
                Change Password
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="label">Current Password</label>
                  <input
                    type="password"
                    value={pw.c}
                    onChange={(e) => setPw((p) => ({ ...p, c: e.target.value }))}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">New Password</label>
                  <input
                    type="password"
                    value={pw.n}
                    onChange={(e) => setPw((p) => ({ ...p, n: e.target.value }))}
                    className="input"
                  />
                </div>
                <button
                  onClick={() =>
                    pwM.mutate({ currentPassword: pw.c, newPassword: pw.n })
                  }
                  disabled={!pw.c || !pw.n || pwM.isPending}
                  className="btn btn-primary"
                >
                  {pwM.isPending ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

// ── Profile tab sub-component ─────────────────────
function ProfileTab({
  profile,
  onSave,
  saving,
}: {
  profile: { firstName: string; lastName: string; phone?: string; email: string }
  onSave: (d: Record<string, unknown>) => void
  saving: boolean
}) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      firstName: profile.firstName,
      lastName:  profile.lastName,
      phone:     profile.phone || '',
    },
  })

  return (
    <div className="bg-white border border-stone-100 p-6 max-w-lg">
      <h2 className="font-medium text-stone-900 mb-5">
        Personal Information
      </h2>
      <div className="mb-4 p-3 bg-stone-50 border border-stone-100">
        <p className="text-xs text-stone-500">
          Email:{' '}
          <span className="font-medium text-stone-700">{profile.email}</span>
          {' '}(cannot be changed)
        </p>
      </div>
      <form onSubmit={handleSubmit(onSave)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name</label>
            <input {...register('firstName')} className="input" />
          </div>
          <div>
            <label className="label">Last Name</label>
            <input {...register('lastName')} className="input" />
          </div>
        </div>
        <div>
          <label className="label">Phone (optional)</label>
          <input {...register('phone')} type="tel" className="input" />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="btn btn-primary"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  )
}