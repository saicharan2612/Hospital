'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DEMO_ACCOUNTS, DemoAccount, getAllAccounts } from '@/lib/demo-accounts'
import { ArrowRight, Check, Copy, Shield, Sparkles, UserCheck } from 'lucide-react'

interface DemoAccountCardsProps {
  onSelectAccount?: (account: DemoAccount) => void
  showDirectLogin?: boolean
}

export function DemoAccountCards({ onSelectAccount, showDirectLogin = true }: DemoAccountCardsProps) {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>(DEMO_ACCOUNTS[0].roleSlug)
  const [accounts, setAccounts] = useState<DemoAccount[]>(DEMO_ACCOUNTS)

  useEffect(() => {
    setAccounts(getAllAccounts())
  }, [])

  const handleCopy = (e: React.MouseEvent, text: string, id: string) => {
    e.stopPropagation()
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleInstantLogin = (account: DemoAccount) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carelink_user', JSON.stringify(account))
    }
    router.push(`/${account.roleSlug}`)
  }

  const activeAccount = accounts.find(a => a.roleSlug === selectedRole) || accounts[0]

  return (
    <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--care-border)]">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 text-[var(--care-primary)]" />
            <h3 className="text-base font-semibold text-[var(--care-ink)]">Pre-Configured & Active Accounts</h3>
          </div>
          <p className="mt-0.5 text-xs text-[var(--care-muted)]">
            One-click access configured for every hospital role
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full bg-[var(--care-highlight)] px-2.5 py-1 text-xs font-semibold text-[var(--care-ink)]">
          {accounts.length} Active Accounts
        </span>
      </div>

      {/* Role selector pills */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        {DEMO_ACCOUNTS.map((acc) => {
          const isSelected = acc.roleSlug === selectedRole
          return (
            <button
              key={acc.id}
              type="button"
              onClick={() => {
                setSelectedRole(acc.roleSlug)
                if (onSelectAccount) {
                  const target = accounts.find(a => a.roleSlug === acc.roleSlug) || acc
                  onSelectAccount(target)
                }
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'bg-[var(--care-highlight)]/60 text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <span className="size-2 rounded-full bg-current opacity-80" />
              {acc.roleLabel}
            </button>
          )
        })}
      </div>

      {/* Active Account Preview Card */}
      {activeAccount && (
        <div className="mt-4 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-[var(--care-primary)] font-bold text-white shadow-inner text-sm">
                {activeAccount.avatarInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold text-[var(--care-ink)] text-sm sm:text-base">
                    {activeAccount.name}
                  </h4>
                  <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${activeAccount.badgeColor}`}>
                    {activeAccount.badge}
                  </span>
                  {activeAccount.specialization && (
                    <span className="inline-flex items-center rounded-md border border-blue-200 bg-blue-50 px-2 py-0.5 text-[11px] font-bold text-blue-700">
                      🩺 {activeAccount.specialization}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--care-muted)] mt-0.5">
                  {activeAccount.title} · <span className="text-[var(--care-ink)] font-medium">{activeAccount.department}</span>
                </p>
              </div>
            </div>
          </div>

          <p className="mt-3 text-xs leading-relaxed text-[var(--care-muted)] border-t border-[var(--care-border)] pt-3">
            {activeAccount.summary}
          </p>

          {/* Credentials box */}
          <div className="mt-3 grid gap-2 sm:grid-cols-2 rounded-lg bg-[var(--care-surface)] p-3 border border-[var(--care-border)]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--care-muted)] font-medium">Email:</span>
              <div className="flex items-center gap-1.5 font-mono text-[var(--care-ink)]">
                <span>{activeAccount.email}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, activeAccount.email, `email-${activeAccount.id}`)}
                  className="rounded p-1 hover:bg-[var(--care-highlight)] text-[var(--care-muted)] hover:text-[var(--care-ink)] transition"
                  title="Copy email"
                >
                  {copiedId === `email-${activeAccount.id}` ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-[var(--care-muted)] font-medium">Password:</span>
              <div className="flex items-center gap-1.5 font-mono text-[var(--care-ink)]">
                <span>{activeAccount.password}</span>
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, activeAccount.password, `pass-${activeAccount.id}`)}
                  className="rounded p-1 hover:bg-[var(--care-highlight)] text-[var(--care-muted)] hover:text-[var(--care-ink)] transition"
                  title="Copy password"
                >
                  {copiedId === `pass-${activeAccount.id}` ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2">
            {showDirectLogin && (
              <button
                type="button"
                onClick={() => handleInstantLogin(activeAccount)}
                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-[var(--care-primary)] px-4 text-xs font-semibold text-white shadow-sm transition hover:bg-[var(--care-primary-dark)]"
              >
                <UserCheck className="size-4" />
                1-Click Sign In as {activeAccount.roleLabel}
                <ArrowRight className="size-3.5" />
              </button>
            )}

            {onSelectAccount && (
              <button
                type="button"
                onClick={() => onSelectAccount(activeAccount)}
                className="inline-flex h-10 items-center justify-center rounded-lg border border-[var(--care-border)] bg-[var(--care-surface)] px-4 text-xs font-semibold text-[var(--care-ink)] transition hover:bg-[var(--care-highlight)]"
              >
                Fill Form
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function DemoAccountsSummaryTable() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<DemoAccount[]>(DEMO_ACCOUNTS)

  useEffect(() => {
    setAccounts(getAllAccounts())
  }, [])

  const handleInstantLogin = (account: DemoAccount) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carelink_user', JSON.stringify(account))
    }
    router.push(`/${account.roleSlug}`)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] shadow-sm">
      <div className="border-b border-[var(--care-border)] bg-[var(--care-highlight)]/40 px-5 py-4">
        <div className="flex items-center gap-2">
          <Shield className="size-4 text-[var(--care-primary)]" />
          <h3 className="text-sm font-semibold text-[var(--care-ink)]">Pre-Configured & Active Accounts</h3>
        </div>
        <p className="mt-0.5 text-xs text-[var(--care-muted)]">
          Credentials and roles mapped for immediate evaluation
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-[var(--care-ink)]">
          <thead className="border-b border-[var(--care-border)] bg-[var(--care-bg)] font-semibold text-[var(--care-muted)]">
            <tr>
              <th className="px-4 py-3">Role & User</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Login Email</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--care-border)]">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-[var(--care-highlight)]/30 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-md bg-[var(--care-primary)] text-[11px] font-bold text-white">
                      {acc.avatarInitials}
                    </span>
                    <div>
                      <div className="font-semibold text-[var(--care-ink)] flex items-center gap-1">
                        {acc.name}
                        {acc.isCustom && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">New</span>}
                      </div>
                      <span className={`inline-block rounded px-1.5 py-0.2 text-[10px] font-medium ${acc.badgeColor}`}>
                        {acc.roleLabel}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-[var(--care-muted)]">
                  {acc.department}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--care-ink)]">
                  {acc.email}
                </td>
                <td className="px-4 py-3 font-mono text-[var(--care-muted)]">
                  {acc.password}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => handleInstantLogin(acc)}
                    className="inline-flex items-center gap-1 rounded-md bg-[var(--care-primary)] px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-[var(--care-primary-dark)]"
                  >
                    Open <ArrowRight className="size-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
