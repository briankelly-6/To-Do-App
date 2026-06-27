import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Passwordless email sign-in. Requesting a code emails the user both a 6-digit
 * code and a magic link (see the email template). Typing the code is the robust
 * path — it works across devices and survives corporate email link-scanners that
 * can consume one-time links; clicking the link still works too.
 */
export function Login() {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  async function requestCode() {
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin },
    })
    return error
  }

  async function handleSendCode(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    setNotice(null)
    const err = await requestCode()
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setStep('code')
    setNotice(`We emailed a 6-digit code to ${email.trim()}.`)
  }

  async function handleVerify(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setBusy(false)
    if (error) setError(error.message)
    // On success, the auth listener swaps this screen for the app automatically.
  }

  async function handleResend() {
    setBusy(true)
    setError(null)
    setNotice(null)
    const err = await requestCode()
    setBusy(false)
    if (err) {
      setError(err.message)
      return
    }
    setNotice('Sent a new code.')
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">To-Do</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in with your email — no password.</p>

        {step === 'email' ? (
          <form onSubmit={handleSendCode} className="mt-6 space-y-3">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-60"
            >
              {busy ? 'Sending…' : 'Email me a code'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 space-y-3">
            <p className="text-sm leading-relaxed text-slate-600">
              Enter the 6-digit code from the email — or just click the link in that same email.
            </p>
            <input
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="123456"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-center text-lg tracking-[0.4em] text-slate-900 shadow-sm outline-none placeholder:tracking-normal placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {notice && !error && <p className="text-sm text-emerald-600">{notice}</p>}
            <button
              type="submit"
              disabled={busy || code.length < 6}
              className="w-full rounded-lg bg-slate-900 px-3 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 disabled:opacity-60"
            >
              {busy ? 'Verifying…' : 'Verify & sign in'}
            </button>
            <div className="flex justify-between pt-1 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={busy}
                className="font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError(null)
                  setNotice(null)
                }}
                className="font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
