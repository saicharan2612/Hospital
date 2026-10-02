'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, Mail, MailCheck, Pencil, RefreshCw, Send, ShieldCheck } from 'lucide-react'
import { AuthCard, AuthShell } from '@/components/carelink-header'
import { saveNewStaffAccount, DemoAccount } from '@/lib/demo-accounts'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paramEmail = searchParams.get('email') || ''
  const paramCode = searchParams.get('code') || ''
  const paramSent = searchParams.get('sent') === 'true'

  const [email, setEmail] = useState(paramEmail)
  const [userCode, setUserCode] = useState(paramCode)
  const [step, setStep] = useState<'input' | 'verify' | 'verified'>(
    paramEmail || paramCode ? 'verify' : 'input'
  )
  const [loading, setLoading] = useState(false)
  const [isEditingEmail, setIsEditingEmail] = useState(false)
  const [newEmailInput, setNewEmailInput] = useState('')
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(
    paramSent
      ? {
          text: `A verification link and 6-digit code have been dispatched to ${paramEmail}. Please check your inbox.`,
          type: 'info'
        }
      : null
  )

  // Auto-verify if both email and code are in query params (e.g. user clicked the link in the email)
  useEffect(() => {
    if (paramEmail && paramCode && paramCode.length >= 6) {
      handleVerifyCode(paramEmail, paramCode)
    }
  }, [paramEmail, paramCode])

  const handleVerifyCode = (targetEmail: string, codeToVerify: string) => {
    if (!targetEmail || !codeToVerify) return

    let pendingData: any = null
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('carelink_pending_registration')
      if (stored) {
        try {
          pendingData = JSON.parse(stored)
        } catch {
          // ignore
        }
      }
    }

    // Check code against stored pending code or 6-digit valid format
    if (pendingData && pendingData.otpCode && pendingData.otpCode !== codeToVerify.trim()) {
      setStatusMsg({ text: 'Invalid verification code. Please check your email or click resend.', type: 'error' })
      return
    }

    // Create / activate verified patient account (preserving original name, password, etc.)
    const verifiedAccount: DemoAccount = pendingData?.account || {
      id: `patient-${Date.now()}`,
      roleSlug: 'patient',
      roleLabel: 'Patient / User',
      name: targetEmail.split('@')[0] || 'Registered Patient',
      title: 'Registered CareLink Patient',
      department: 'Personal Health Portal',
      email: targetEmail.trim().toLowerCase(),
      badge: 'Verified Patient',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      avatarInitials: targetEmail.slice(0, 2).toUpperCase(),
      summary: 'Personal health portal access for medical records, lab reports, and appointment scheduling.',
      permissions: [
        'Personal medical records & test history access',
        'Direct secure messaging with assigned care team',
        'Online appointment booking & check-in',
        'Prescription refill requests'
      ],
      stats: [
        { label: 'Account Status', value: 'Verified', change: 'Email confirmed', tone: 'positive' },
        { label: 'Upcoming Visits', value: '0 Scheduled', change: 'Book a consultation', tone: 'neutral' },
        { label: 'Care Team', value: 'Ready', change: 'Choose doctor', tone: 'neutral' },
        { label: 'Records Synced', value: '100%', change: 'All up to date', tone: 'positive' }
      ],
      recentActivities: [
        { title: 'Email Address Verified', subtitle: `Successfully verified: ${targetEmail}`, time: 'Just now', status: 'Verified', statusColor: 'bg-emerald-100 text-emerald-800' }
      ],
      quickActions: [
        { label: 'Book First Appointment', description: 'Search available doctors and departments' },
        { label: 'Complete Health History', description: 'Fill medical background and allergy info' },
        { label: 'Link Insurance Policy', description: 'Add your health insurance card details' }
      ]
    }

    // Ensure email in object matches targetEmail
    verifiedAccount.email = targetEmail.trim().toLowerCase()

    if (typeof window !== 'undefined') {
      saveNewStaffAccount(verifiedAccount)
      localStorage.setItem('carelink_user', JSON.stringify(verifiedAccount))
      localStorage.removeItem('carelink_pending_registration')
    }

    setStep('verified')
    setStatusMsg({ text: 'Your email address has been successfully verified!', type: 'success' })
  }

  const handleSendVerification = async (targetEmailOverride?: string) => {
    const activeEmail = (targetEmailOverride || email || paramEmail).trim().toLowerCase()
    if (!activeEmail) {
      setStatusMsg({ text: 'Please enter a valid email address.', type: 'error' })
      return
    }

    setLoading(true)
    setStatusMsg(null)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()

    let storedName = activeEmail.split('@')[0]
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('carelink_pending_registration')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          parsed.otpCode = newCode
          parsed.email = activeEmail
          if (parsed.account) {
            parsed.account.email = activeEmail
            storedName = parsed.account.name || storedName
          }
          localStorage.setItem('carelink_pending_registration', JSON.stringify(parsed))
        } catch {
          // ignore
        }
      }
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const verifyLink = `${origin}/verify-email?email=${encodeURIComponent(activeEmail)}&code=${newCode}`

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verification',
          to: activeEmail,
          otpCode: newCode,
          verifyLink,
          name: storedName,
          subject: 'CareLink — Verify Your Email Address & Activate Account'
        })
      })

      const data = await res.json()
      if (data.success) {
        setEmail(activeEmail)
        setStep('verify')
        setStatusMsg({
          text: `A fresh verification link and 6-digit code have been dispatched to ${activeEmail}. Please check your inbox.`,
          type: 'success'
        })
      } else {
        setStatusMsg({
          text: data.error || 'Failed to dispatch email.',
          type: 'error'
        })
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || 'Error communicating with email service.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateEmailAndResend = async () => {
    const cleanNewEmail = newEmailInput.trim().toLowerCase()
    if (!cleanNewEmail || !cleanNewEmail.includes('@')) {
      setStatusMsg({ text: 'Please enter a valid email address.', type: 'error' })
      return
    }

    setLoading(true)
    setStatusMsg(null)
    const newCode = Math.floor(100000 + Math.random() * 900000).toString()

    // Update pending registration in localStorage while preserving Name, Password, and other details
    let preservedName = cleanNewEmail.split('@')[0]
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('carelink_pending_registration')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          parsed.email = cleanNewEmail
          parsed.otpCode = newCode
          if (parsed.account) {
            parsed.account.email = cleanNewEmail
            preservedName = parsed.account.name || preservedName
          }
          localStorage.setItem('carelink_pending_registration', JSON.stringify(parsed))
        } catch {
          // ignore
        }
      }
    }

    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
      const verifyLink = `${origin}/verify-email?email=${encodeURIComponent(cleanNewEmail)}&code=${newCode}`

      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'verification',
          to: cleanNewEmail,
          otpCode: newCode,
          verifyLink,
          name: preservedName,
          subject: 'CareLink — Verify Your Email Address & Activate Account'
        })
      })

      const data = await res.json()
      if (data.success) {
        setEmail(cleanNewEmail)
        setIsEditingEmail(false)
        setStep('verify')
        setStatusMsg({
          text: `Email address updated! Verification code and link sent to ${cleanNewEmail}.`,
          type: 'success'
        })
        router.replace(`/verify-email?email=${encodeURIComponent(cleanNewEmail)}&sent=true`)
      } else {
        setStatusMsg({
          text: data.error || 'Failed to dispatch verification email to the updated address.',
          type: 'error'
        })
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.message || 'Error updating email address.',
        type: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell eyebrow="Account Security" title="Verify your email address.">
      <AuthCard>
        {step === 'input' && (
          <div>
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-[var(--care-primary)]">
              <MailCheck className="size-7" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-[var(--care-ink)]">Verify Email Address</h2>
              <p className="mt-2 text-xs leading-5 text-[var(--care-muted)]">
                Our automated mailer will send a secure verification link and 6-digit confirmation code directly to your email inbox.
              </p>
            </div>

            {statusMsg && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs font-semibold ${
                  statusMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendVerification(email)
              }}
              className="grid gap-4"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">Your Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. you@example.com"
                  className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--care-primary)] font-bold text-white shadow-md transition hover:bg-[var(--care-primary-dark)] disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="size-5 animate-spin" />
                    Dispatching Email...
                  </>
                ) : (
                  <>
                    <Send className="size-4" /> Send Verification Link
                  </>
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-[var(--care-muted)]">
              <Link href="/sign-in" className="inline-flex items-center gap-1 font-bold text-[var(--care-primary)] hover:underline">
                <ArrowLeft className="size-3.5" /> Back to Sign In
              </Link>
            </p>
          </div>
        )}

        {step === 'verify' && (
          <div>
            <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-teal-50 text-[var(--care-primary)]">
              <ShieldCheck className="size-7" />
            </div>

            <div className="text-center mb-4">
              <h2 className="text-xl font-bold text-[var(--care-ink)]">Check Your Inbox</h2>
              <p className="mt-1 text-xs text-[var(--care-muted)]">
                We sent a verification email with a single-click link and 6-digit code.
              </p>
            </div>

            {/* Current Email Display with Edit / Change Option */}
            {!isEditingEmail ? (
              <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border-2 border-slate-200 mb-4">
                <div className="flex items-center gap-2 text-xs truncate min-w-0 pr-2">
                  <Mail className="size-4 text-slate-500 shrink-0" />
                  <span className="font-bold text-slate-900 truncate">{email || paramEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingEmail(true)
                    setNewEmailInput(email || paramEmail)
                  }}
                  className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-teal-700 hover:bg-teal-50 hover:text-teal-900 border border-teal-200 shadow-2xs transition shrink-0 cursor-pointer"
                  title="Entered wrong email? Change email address"
                >
                  <Pencil className="size-3" /> Change Email
                </button>
              </div>
            ) : (
              /* Inline Email Editing Form */
              <div className="rounded-xl border-2 border-teal-300 bg-teal-50/60 p-3.5 mb-4 space-y-2.5 animate-in fade-in-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                    <Pencil className="size-3.5 text-teal-700" /> Edit Email Address
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsEditingEmail(false)}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
                <p className="text-[11px] text-slate-600 leading-tight">
                  Your other registration details (Name, Password) remain saved. We will dispatch the verification link to your updated address.
                </p>
                <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
                  <input
                    type="email"
                    value={newEmailInput}
                    onChange={(e) => setNewEmailInput(e.target.value)}
                    placeholder="Enter correct email address"
                    className="h-10 flex-1 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleUpdateEmailAndResend}
                    disabled={loading || !newEmailInput.trim()}
                    className="h-10 px-4 rounded-xl bg-teal-700 font-bold text-xs text-white hover:bg-teal-800 disabled:opacity-50 transition cursor-pointer shrink-0"
                  >
                    {loading ? 'Updating...' : 'Update & Send Code'}
                  </button>
                </div>
              </div>
            )}

            {statusMsg && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs font-semibold ${
                  statusMsg.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : statusMsg.type === 'info'
                    ? 'bg-blue-50 text-blue-800 border border-blue-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {statusMsg.text}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleVerifyCode(email || paramEmail, userCode)
              }}
              className="grid gap-3"
            >
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">Enter 6-Digit Code from Email</label>
                <input
                  type="text"
                  maxLength={6}
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  placeholder="123456"
                  className="h-12 w-full rounded-xl border-2 border-slate-300 bg-white text-center font-mono text-xl font-extrabold tracking-widest text-slate-900 outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>

              <button
                type="submit"
                className="mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--care-primary)] font-bold text-white shadow-md transition hover:bg-[var(--care-primary-dark)] cursor-pointer"
              >
                Verify & Activate Patient Account
              </button>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleSendVerification()}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 text-teal-700 hover:text-teal-900 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Resending...' : 'Resend Verification Email'}
                </button>

                {!isEditingEmail && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingEmail(true)
                      setNewEmailInput(email || paramEmail)
                    }}
                    className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
                  >
                    <Pencil className="size-3.5" /> Edit Email Address
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {step === 'verified' && (
          <div className="text-center py-4">
            <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="text-xl font-bold text-[var(--care-ink)]">Email Successfully Verified!</h3>
            <p className="mt-2 text-xs text-[var(--care-muted)] leading-relaxed">
              Your email address (<strong>{email || paramEmail}</strong>) has been verified. Your patient account is now fully active.
            </p>
            <button
              type="button"
              onClick={() => router.push('/patient')}
              className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--care-primary)] font-bold text-white shadow-md transition hover:bg-[var(--care-primary-dark)] cursor-pointer"
            >
              Enter Patient Portal Now &rarr;
            </button>
          </div>
        )}
      </AuthCard>
    </AuthShell>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-semibold">Loading verification portal...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
