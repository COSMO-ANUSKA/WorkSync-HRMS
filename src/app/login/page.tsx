import { login, signup } from './actions'

interface PageProps {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedParams = await searchParams
  const hasError = !!resolvedParams.error

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">W</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-primary">WorkSync HRMS</h1>
          <p className="text-text-muted mt-2">Sign in to your account</p>
        </div>

        {hasError && (
          <div className="mb-6 p-3 bg-rose-50 border border-rose-100 rounded-lg text-sm text-accent-rose text-center font-medium">
            Wrong credential
          </div>
        )}

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="email">
              Work Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="eleanor.v@worksync.com"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-text-main mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent"
            />
          </div>

          <button 
            formAction={login}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors mt-6"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}
