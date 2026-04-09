import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-md p-8 border border-outline-variant/30">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-primary tracking-tight mb-2">Restore Inventory</h1>
          <p className="text-on-surface-variant text-sm font-medium">Log in to manage operations</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-error-container text-on-error-container text-sm rounded-lg font-medium border border-error/20">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-shadow"
              placeholder="e.g. ops@saahas.org"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-[11px] font-bold text-on-surface-variant tracking-widest uppercase">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full h-12 px-4 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-on-surface transition-shadow"
              placeholder="••••••••"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-primary-container text-white font-bold rounded-xl shadow-lg shadow-primary-container/20 hover:bg-[#1b6d24] active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 flex justify-center items-center"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
