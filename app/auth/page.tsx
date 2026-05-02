'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronDown } from 'lucide-react'
import { LANGUAGES, LANGUAGE_NAMES, LEVELS } from '@/lib/languages'

function LevelTooltip() {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-block ml-1">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-4 h-4 rounded-full bg-gray-200 text-gray-600 text-xs font-bold inline-flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-700 transition-colors"
      >
        i
      </button>
      {open && (
        <div className="absolute z-10 left-6 top-0 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs text-gray-600 space-y-1">
          <p className="font-semibold text-gray-800 mb-2">Language levels explained</p>
          {LEVELS.map(l => (
            <p key={l.code}><span className="font-medium">{l.label}:</span> {l.cefr}</p>
          ))}
          <button
            onClick={() => setOpen(false)}
            className="mt-2 text-indigo-600 font-medium hover:underline"
          >
            Close
          </button>
        </div>
      )}
    </span>
  )
}

function SearchableSelect({
  id, value, onChange, options, placeholder
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { code: string; label: string }[]
  placeholder: string
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const sorted = [...options].sort((a, b) => a.label.localeCompare(b.label))
  const filtered = sorted.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )
  const selected = options.find(o => o.code === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-indigo-500 flex justify-between items-center"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
              >
                {placeholder}
              </button>
            </li>
            {filtered.map(o => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => { onChange(o.code); setOpen(false); setSearch('') }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-indigo-50 hover:text-indigo-700 ${
                    value === o.code ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No languages found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function AuthPage() {
  const router = useRouter()
  const supabase = createClient()

  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [step, setStep] = useState<1 | 2>(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    password: '',
    confirm_password: '',
    username: '',
    native_language: '',
    learning_language: '',
    learning_language_level: '',
    learning_language_2: '',
    learning_language_2_level: '',
  })

  const update = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }))

  function handleNext() {
    setError(null)
    if (!form.username.trim()) {
      setError('Please enter a username.')
      return
    }
    if (!form.email.trim()) {
      setError('Please enter your email.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (form.password !== form.confirm_password) {
      setError('Passwords do not match.')
      return
    }
    setStep(2)
  }

  async function handleSubmit() {
    setError(null)
    setLoading(true)

    if (!form.native_language) {
      setError('Please select your native language.')
      setLoading(false)
      return
    }
    if (!form.learning_language) {
      setError('Please select the language you are learning.')
      setLoading(false)
      return
    }
    if (!form.learning_language_level) {
      setError('Please select your level.')
      setLoading(false)
      return
    }
    if (form.native_language === form.learning_language) {
      setError('Your native and learning language cannot be the same.')
      setLoading(false)
      return
    }
    if (
      form.learning_language_2 &&
      form.learning_language_2 === form.learning_language
    ) {
      setError('Your two learning languages cannot be the same.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          username: form.username,
          native_language: form.native_language,
          learning_language: form.learning_language,
          learning_language_level: form.learning_language_level,
          learning_language_2: form.learning_language_2 || null,
          learning_language_2_level: form.learning_language_2
            ? form.learning_language_2_level
            : null,
        }
      }
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  async function handleLogin() {
    setError(null)
    setLoading(true)

    if (!form.email || !form.password) {
      setError('Please enter your email and password.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (error) {
      setError('Invalid email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  function switchMode() {
    setMode(mode === 'login' ? 'signup' : 'login')
    setStep(1)
    setError(null)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-indigo-600">
            WriteCircle
          </CardTitle>
          <CardDescription>
            {mode === 'login'
              ? 'Welcome back! Sign in to continue.'
              : step === 1
              ? 'Create your account — step 1 of 2'
              : 'Almost there — step 2 of 2'}
          </CardDescription>

          {mode === 'signup' && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
              <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-indigo-500' : 'bg-gray-200'}`} />
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">

          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </>
          )}

          {/* SIGNUP STEP 1 */}
          {mode === 'signup' && step === 1 && (
            <>
              <div className="space-y-1">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="e.g. amanda_writes"
                  value={form.username}
                  onChange={e => update('username', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => update('email', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleLogin() }}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  value={form.confirm_password}
                  onChange={e => update('confirm_password', e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') handleNext() }}
                />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={handleNext}
              >
                Next →
              </Button>
            </>
          )}

          {/* SIGNUP STEP 2 */}
          {mode === 'signup' && step === 2 && (
            <>
              <p className="text-sm text-gray-500">
                This helps us show you the right content and corrections queue.
              </p>

              <div className="space-y-1">
                <Label htmlFor="native">What is your native language?</Label>
                <SearchableSelect
                  id="native"
                  value={form.native_language}
                  onChange={v => update('native_language', v)}
                  options={LANGUAGES}
                  placeholder="Select your native language"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="learning">What language are you learning?</Label>
                <SearchableSelect
                  id="learning"
                  value={form.learning_language}
                  onChange={v => update('learning_language', v)}
                  options={LANGUAGES}
                  placeholder="Select a language"
                />
              </div>

              {form.learning_language && (
                <div className="space-y-1">
                  <Label htmlFor="level" className="flex items-center">
                    What is your level?
                    <LevelTooltip />
                  </Label>
                  <select
                    id="level"
                    value={form.learning_language_level}
                    onChange={e => update('learning_language_level', e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your level</option>
                    {LEVELS.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {form.learning_language && (
                <div className="space-y-1">
                  <Label htmlFor="learning2">
                    Are you learning a second language?{' '}
                    <span className="text-gray-400 font-normal">(optional)</span>
                  </Label>
                  <SearchableSelect
                    id="learning2"
                    value={form.learning_language_2}
                    onChange={v => update('learning_language_2', v)}
                    options={LANGUAGES}
                    placeholder="None"
                  />
                </div>
              )}

              {form.learning_language_2 && (
                <div className="space-y-1">
                  <Label htmlFor="level2" className="flex items-center">
                    What is your level in {LANGUAGES.find(l => l.code === form.learning_language_2)?.label}?
                    <LevelTooltip />
                  </Label>
                  <select
                    id="level2"
                    value={form.learning_language_2_level}
                    onChange={e => update('learning_language_2_level', e.target.value)}
                    className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select your level</option>
                    {LEVELS.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              )}

              {error && <p className="text-sm text-red-500">{error}</p>}

              <div className="flex flex-col gap-2">
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => { setStep(1); setError(null) }}
                >
                  ← Back
                </Button>
              </div>
            </>
          )}

          <p className="text-center text-sm text-gray-500 pt-2">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              className="text-indigo-600 font-medium hover:underline"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>

        </CardContent>
      </Card>
    </div>
  )
}