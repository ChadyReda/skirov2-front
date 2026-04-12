import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/services/api'
import { useAuthStore } from '@/store/auth'
import { toast } from '@/components/ui/Toast'
import { errMsg } from '@/services/api'

// ── LOGIN ─────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Required'),
})
type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) })

   const m = useMutation({
     mutationFn: async (data: LoginForm) => {
       const response = await api.post('/auth/login', {
         email: data.email,
         password: data.password,
       })
       return response.data.data
     },
     onSuccess: ({ user, accessToken }) => {
       setAuth(user, accessToken)
       toast(`Welcome back, ${user.firstName}!`, 'success')
       if (user.role.toLowerCase() === 'admin') {
         navigate('/admin', { replace: true })
       } else {
         navigate(from, { replace: true })
       }
     },
     onError: (e: any) => {
       toast(errMsg(e), 'error')
     },
   })

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link
            to="/"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-3xl tracking-[.12em] uppercase text-stone-900"
          >
            SKIRO
          </Link>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-2xl font-normal mt-6 mb-2"
          >
            Welcome back
          </h1>
          <p className="text-sm text-stone-500">Sign in to your account</p>
        </div>

        <div className="bg-white border border-stone-100 p-8">
          <form
            onSubmit={handleSubmit((d) => m.mutate(d))}
            className="space-y-5"
          >
            <div>
              <label className="label">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={`input ${errors.email ? 'input-err' : ''}`}
              />
              {errors.email && (
                <p className="ferror">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`input ${errors.password ? 'input-err' : ''}`}
              />
              {errors.password && (
                <p className="ferror">{errors.password.message}</p>
              )}
            </div>

            {m.isError && (
              <div className="p-3 mb-4 text-sm text-red-600 bg-red-50 border border-red-100">
                {m.error.message === 'Invalid login credentials'
                  ? 'Invalid login credentials.'
                  : 'Login failed. Please try again.'}
              </div>
            )}
            <button
              type="submit"
              disabled={m.isPending}
              className="btn btn-primary w-full"
            >
              {m.isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-stone-900 font-medium hover:text-brand-600">
                Create one
              </Link>
            </p>
          </div>


        </div>

      </div>
    </div>
  )
}

// ── REGISTER ──────────────────────────────────────
const registerSchema = z.object({
  firstName: z.string().min(1, 'Required'),
  lastName: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'At least 8 characters'),
})
type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) })

   const m = useMutation({
     mutationFn: async (data: RegisterForm) => {
       const response = await api.post('/auth/register', {
         email: data.email,
         password: data.password,
         firstName: data.firstName,
         lastName: data.lastName,
       })
       return response.data.data
     },
     onSuccess: ({ user, accessToken }) => {
       setAuth(user, accessToken)
       toast(`Welcome, ${user.firstName}!`, 'success')
       navigate('/')
     },
     onError: (e) => toast(errMsg(e), 'error'),
   })

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <Link
            to="/"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-3xl tracking-[.12em] uppercase text-stone-900"
          >
            SKIRO
          </Link>
          <h1
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
            className="text-2xl font-normal mt-6 mb-2"
          >
            Create your account
          </h1>
          <p className="text-sm text-stone-500">
            Join SKIRO for exclusive access and early drops
          </p>
        </div>

        <div className="bg-white border border-stone-100 p-8">
          <form
            onSubmit={handleSubmit((d) => m.mutate(d))}
            className="space-y-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">First Name</label>
                <input
                  {...register('firstName')}
                  className={`input ${errors.firstName ? 'input-err' : ''}`}
                />
                {errors.firstName && (
                  <p className="ferror">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="label">Last Name</label>
                <input
                  {...register('lastName')}
                  className={`input ${errors.lastName ? 'input-err' : ''}`}
                />
                {errors.lastName && (
                  <p className="ferror">{errors.lastName.message}</p>
                )}
              </div>
            </div>
            <div>
              <label className="label">Email</label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className={`input ${errors.email ? 'input-err' : ''}`}
              />
              {errors.email && (
                <p className="ferror">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="label">Password</label>
              <input
                {...register('password')}
                type="password"
                autoComplete="new-password"
                className={`input ${errors.password ? 'input-err' : ''}`}
              />
              {errors.password && (
                <p className="ferror">{errors.password.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={m.isPending}
              className="btn btn-primary w-full"
            >
              {m.isPending ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-stone-100 text-center">
            <p className="text-sm text-stone-500">
              Already have an account?{' '}
              <Link to="/login" className="text-stone-900 font-medium hover:text-brand-600">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}