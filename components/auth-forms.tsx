'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { AuthCard, PasswordField, PrimaryButton, StatusMessage, TextInput } from './carelink-header'
import { DemoAccountCards } from './demo-account-cards'
import { DEMO_ACCOUNTS, findDemoAccount, DemoAccount } from '@/lib/demo-accounts'
import { ArrowRight, Sparkles, UserCheck } from 'lucide-react'

export function SignUpForm() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (password !== confirm) return setError('Passwords do not match.')
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (!consent) return setError('Please accept the terms and consent to continue.')

    setLoading(true)

    const cleanEmail = email.trim().toLowerCase()
    const cleanName = name.trim() || 'New Patient'
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Create a pending patient profile
    const newPatient: DemoAccount = {
      id: `patient-${Date.now()}`,
      roleSlug: 'patient',
      roleLabel: 'Patient / User',
      name: cleanName,
      title: 'Registered CareLink Patient',
      department: 'Personal Health Portal',
      email: cleanEmail,
      password: password,
      badge: 'New Patient',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      avatarInitials: cleanName.slice(0, 2).toUpperCase() || 'PT',
      summary: 'Personal health portal access for medical records, lab reports, and appointment scheduling.',
      permissions: [
        'Personal medical records & test history access',
        'Direct secure messaging with assigned care team',
        'Online appointment booking & check-in',
        'Prescription refill requests'
      ],
      stats: [
        { label: 'Account Status', value: 'Active', change: 'Profile verified', tone: 'positive' },
        { label: 'Upcoming Visits', value: '0 Scheduled', change: 'Book your first visit', tone: 'neutral' },
        { label: 'Care Team', value: 'Unassigned', change: 'Assign a physician', tone: 'neutral' },
        { label: 'Records Synced', value: '100%', change: 'All up to date', tone: 'positive' }
      ],
      recentActivities: [
        { title: 'Patient Account Registered', subtitle: 'Email verification completed', time: 'Just now', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-800' }
      ],
      quickActions: [
        { label: 'Book First Appointment', description: 'Search available doctors and departments' },
        { label: 'Complete Health History', description: 'Fill medical background and allergy info' },
        { label: 'Link Insurance Policy', description: 'Add your health insurance card details' }
      ]
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'carelink_pending_registration',
        JSON.stringify({
          account: newPatient,
          otpCode,
          email: cleanEmail
        })
      )
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const verifyLink = `${origin}/verify-email?email=${encodeURIComponent(cleanEmail)}&code=${otpCode}`

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verification',
          to: cleanEmail,
          name: cleanName,
          otpCode,
          verifyLink,
          subject: 'CareLink — Verify Your Email Address & Activate Account'
        })
      })

      const data = await res.json()
      if (!data.success) {
        setLoading(false)
        setError(data.error || 'Failed to send verification email via SMTP.')
        return
      }

      // Redirect to verification screen
      router.push(`/verify-email?email=${encodeURIComponent(cleanEmail)}&sent=true`)
    } catch (err: any) {
      setLoading(false)
      setError(err.message || 'Network error while attempting to send verification email.')
    }
  }

  return (
    <AuthCard>
      <div className="mb-7">
        <h2 className="text-2xl font-semibold text-[var(--care-ink)]">Create a patient account</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--care-muted)]">
          Public registration is for patients and users only. A secure verification link and code will be sent to your email.
        </p>
      </div>

      <form onSubmit={submit} className="grid gap-4">
        <TextInput id="name" label="Full name" value={name} onChange={setName} placeholder="Your full name" />
        <TextInput id="email" label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <PasswordField id="password" label="Password" value={password} onChange={setPassword} show={show} onToggle={() => setShow(!show)} />
        <PasswordField id="confirm" label="Confirm password" value={confirm} onChange={setConfirm} show={show} onToggle={() => setShow(!show)} />
        {error && <StatusMessage tone="error">{error}</StatusMessage>}
        <label className="flex items-start gap-3 text-sm leading-6 text-[var(--care-muted)]">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-4 accent-[var(--care-primary)]"
          />
          I agree to the CareLink terms and consent to account communication.
        </label>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--care-primary)] px-5 font-semibold text-white transition hover:bg-[var(--care-primary-dark)] disabled:opacity-50 cursor-pointer shadow-md"
        >
          {loading ? 'Sending Verification Link via SMTP...' : 'Create Account & Send Verification Link'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--care-muted)]">
        Already have an account?{' '}
        <Link href="/sign-in" className="font-semibold text-[var(--care-primary)] hover:underline">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}

export function SignInForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showDemoSelector, setShowDemoSelector] = useState(true)

  const handleSelectDemo = (account: DemoAccount) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const submit = (event: FormEvent) => {
    event.preventDefault()
    setError('')
    if (!email || !password) {
      return setError('Please enter your email and password.')
    }

    setLoading(true)
    const demoAccount = findDemoAccount(email, password)

    if (demoAccount) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('carelink_user', JSON.stringify(demoAccount))
      }
      setTimeout(() => {
        router.push(`/${demoAccount.roleSlug}`)
      }, 400)
      return
    }

    // Check if email matches any demo account but password was wrong
    const emailMatch = DEMO_ACCOUNTS.find(a => a.email.toLowerCase() === email.trim().toLowerCase())
    if (emailMatch) {
      setLoading(false)
      return setError(`Incorrect password for ${emailMatch.name}. Use password: ${emailMatch.password} or universal password DemoPass2026!`)
    }

    // If it's a custom email, fallback to patient role for test purposes
    const customUser: DemoAccount = {
      id: `custom-${Date.now()}`,
      roleSlug: 'patient',
      roleLabel: 'Patient / User',
      name: email.split('@')[0],
      title: 'CareLink User',
      department: 'Patient Portal',
      email: email,
      password: password,
      badge: 'Active User',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
      avatarInitials: email.slice(0, 2).toUpperCase(),
      summary: 'Logged in with custom credentials.',
      permissions: ['Patient dashboard access'],
      stats: [
        { label: 'Account Status', value: 'Active', tone: 'positive' }
      ],
      recentActivities: [
        { title: 'Signed In', subtitle: 'Authenticated session started', time: 'Just now', status: 'Active', statusColor: 'bg-emerald-100 text-emerald-800' }
      ],
      quickActions: [
        { label: 'View Dashboard', description: 'Explore account features' }
      ]
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('carelink_user', JSON.stringify(customUser))
    }
    setTimeout(() => {
      router.push('/patient')
    }, 400)
  }

  return (
    <div className="space-y-6">
      <AuthCard>
        <div className="mb-7">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[var(--care-ink)]">Sign in to CareLink</h2>
            <button
              type="button"
              onClick={() => setShowDemoSelector(!showDemoSelector)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--care-highlight)] px-2.5 py-1 text-xs font-semibold text-[var(--care-primary-dark)] hover:bg-[var(--care-highlight)]/80 transition"
            >
              <Sparkles className="size-3.5" />
              {showDemoSelector ? 'Hide Demo Logins' : 'Show Demo Logins'}
            </button>
          </div>
          <p className="mt-2 text-sm leading-6 text-[var(--care-muted)]">
            Patients and care team members use this secure entry point. Choose a demo account below or enter credentials.
          </p>
        </div>

        <form onSubmit={submit} className="grid gap-4">
          <TextInput
            id="signin-email"
            label="Email address"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="e.g. doctor@carelink.health"
          />
          <PasswordField
            id="signin-password"
            label="Password"
            value={password}
            onChange={setPassword}
            show={show}
            onToggle={() => setShow(!show)}
          />

          {error && <StatusMessage tone="error">{error}</StatusMessage>}

          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-semibold text-[var(--care-primary)] hover:underline">
              Forgot password?
            </Link>
          </div>

          <PrimaryButton disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign in'}
          </PrimaryButton>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--care-muted)]">
          New to CareLink?{' '}
          <Link href="/sign-up" className="font-semibold text-[var(--care-primary)] hover:underline">
            Create a patient account
          </Link>
        </p>
      </AuthCard>

      {/* Demo Accounts Panel */}
      {showDemoSelector && (
        <DemoAccountCards
          onSelectAccount={handleSelectDemo}
          showDirectLogin={true}
        />
      )}
    </div>
  )
}
