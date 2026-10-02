'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  APPOINTMENT_TIME_SLOTS,
  AppointmentRequest,
  BillingRecord,
  DEMO_ACCOUNTS,
  DemoAccount,
  DoctorAvailability,
  getAllAccounts,
  getDemoAccountByRole,
  getDoctorAvailability,
  getStoredAppointments,
  getStoredBillings,
  getStoredDoctorAvailabilities,
  getStoredPatients,
  getStoredPrescriptions,
  PatientRecord,
  PrescriptionRecord,
  saveAppointments,
  saveBillings,
  savePrescriptions
} from '@/lib/demo-accounts'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bell,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Info,
  Layers,
  LogOut,
  PackageCheck,
  Pill,
  Receipt,
  Send,
  Shield,
  Sparkles,
  Stethoscope,
  Timer,
  UserCheck,
  Users,
  Zap
} from 'lucide-react'

const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) return 0
  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const period = match[3].toUpperCase()
  if (period === 'PM' && hours !== 12) hours += 12
  if (period === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function getDayOfWeekShort(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number)
  if (!year || !month || !day) return ''
  const d = new Date(Date.UTC(year, month - 1, day))
  return WEEKDAYS_SHORT[d.getUTCDay()]
}

function getTodayIsoString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

interface RoleDashboardProps {
  roleSlug: string
}

export function RoleDashboard({ roleSlug }: RoleDashboardProps) {
  const router = useRouter()
  const defaultAccount = getDemoAccountByRole(roleSlug) || DEMO_ACCOUNTS[0]
  const [currentUser, setCurrentUser] = useState<DemoAccount>(defaultAccount)
  const [actionFeedback, setActionFeedback] = useState<string | null>(null)
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [allRoleAccounts, setAllRoleAccounts] = useState<DemoAccount[]>([])
  const [appointments, setAppointments] = useState<AppointmentRequest[]>([])
  const [patients, setPatients] = useState<PatientRecord[]>([])
  const [doctorAvailabilities, setDoctorAvailabilities] = useState<Record<string, DoctorAvailability>>({})
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>([])
  const [billings, setBillings] = useState<BillingRecord[]>([])
  
  const [bookingDoctorId, setBookingDoctorId] = useState('')
  const [bookingDate, setBookingDate] = useState(getTodayIsoString())
  const [bookingTime, setBookingTime] = useState('')
  const [bookingVisitType, setBookingVisitType] = useState<AppointmentRequest['visitType']>('New Consultation')
  const [bookingReason, setBookingReason] = useState('')
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const allAccs = getAllAccounts()
      setAllRoleAccounts(allAccs)
      setAppointments(getStoredAppointments())
      setPatients(getStoredPatients())
      setDoctorAvailabilities(getStoredDoctorAvailabilities())
      setPrescriptions(getStoredPrescriptions())
      setBillings(getStoredBillings())

      const firstDoctor = allAccs.find((acc) => acc.roleSlug === 'doctor')
      if (firstDoctor) setBookingDoctorId(firstDoctor.id)

      const stored = localStorage.getItem('carelink_user')
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as DemoAccount
          if (parsed && parsed.roleSlug === roleSlug) {
            setCurrentUser(parsed)
            return
          }
        } catch {
          // ignore parsing error
        }
      }
      const matched = getDemoAccountByRole(roleSlug)
      if (matched) {
        setCurrentUser(matched)
        localStorage.setItem('carelink_user', JSON.stringify(matched))
      }
    }
  }, [roleSlug])

  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('carelink_user')
    }
    router.push('/sign-in')
  }

  const handleSwitchRole = (account: DemoAccount) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('carelink_user', JSON.stringify(account))
    }
    setRoleMenuOpen(false)
    router.push(`/${account.roleSlug}`)
  }

  const triggerAction = (label: string) => {
    setActionFeedback(`Action simulated: "${label}" successfully processed for ${currentUser.name}.`)
    setTimeout(() => setActionFeedback(null), 4000)
  }

  const displayedSwitchers = allRoleAccounts.length > 0 ? allRoleAccounts : DEMO_ACCOUNTS
  const availableDoctors = displayedSwitchers.filter((acc) => acc.roleSlug === 'doctor')
  const myAppointments = appointments.filter(
    (appt) => appt.patientId === currentUser.id || appt.patientEmail === currentUser.email
  )

  // Selected doctor's availability
  const selectedDoctorAvailability = useMemo(() => {
    if (!bookingDoctorId) return null
    return getDoctorAvailability(bookingDoctorId)
  }, [bookingDoctorId, doctorAvailabilities])

  // Real-time queue for selected doctor
  const selectedDoctorQueue = useMemo(() => {
    if (!bookingDoctorId) return []
    const doc = availableDoctors.find((d) => d.id === bookingDoctorId)
    const docName = doc?.name.toLowerCase() || ''
    return patients.filter((p) => {
      const matchDoctor = p.assignedDoctor?.toLowerCase().includes(docName.split(' ')[1] || 'wright') || p.assignedDoctor?.toLowerCase().includes(docName)
      return matchDoctor && (p.status === 'waiting' || p.status === 'diagnosing' || p.status === 'registered')
    })
  }, [bookingDoctorId, patients, availableDoctors])

  const currentWaitingCount = selectedDoctorQueue.filter((p) => p.status === 'waiting' || p.status === 'registered').length
  const currentInConsultation = selectedDoctorQueue.find((p) => p.status === 'diagnosing')
  const estimatedQueueWaitMins = currentWaitingCount * 15

  // Calculate valid slots strictly based on doctor availability
  const validBookingSlots = useMemo(() => {
    if (!selectedDoctorAvailability || !selectedDoctorAvailability.isAvailable) return []
    if (!bookingDate) return []

    const selectedDay = getDayOfWeekShort(bookingDate)
    if (!selectedDoctorAvailability.availableDays.includes(selectedDay)) {
      return []
    }

    const docStartMins = parseTimeToMinutes(selectedDoctorAvailability.startTime)
    const docEndMins = parseTimeToMinutes(selectedDoctorAvailability.endTime)
    const breakStartMins = selectedDoctorAvailability.breakStartTime
      ? parseTimeToMinutes(selectedDoctorAvailability.breakStartTime)
      : null
    const breakEndMins = selectedDoctorAvailability.breakEndTime
      ? parseTimeToMinutes(selectedDoctorAvailability.breakEndTime)
      : null

    const todayIso = getTodayIsoString()
    const isToday = bookingDate === todayIso
    const now = new Date()
    const currentMinsNow = now.getHours() * 60 + now.getMinutes()

    return APPOINTMENT_TIME_SLOTS.filter((slot) => {
      const slotMins = parseTimeToMinutes(slot)
      // Must be within doctor's working hours
      if (slotMins < docStartMins || slotMins >= docEndMins) return false

      // Must not be within lunch / break hours
      if (breakStartMins !== null && breakEndMins !== null) {
        if (slotMins >= breakStartMins && slotMins < breakEndMins) return false
      }

      // If today, cannot book a past slot (e.g. before current time)
      if (isToday && slotMins <= currentMinsNow) return false

      return true
    })
  }, [selectedDoctorAvailability, bookingDate])

  // Automatically update bookingTime when valid slots change
  useEffect(() => {
    if (validBookingSlots.length > 0) {
      if (!bookingTime || !validBookingSlots.includes(bookingTime as any)) {
        setBookingTime(validBookingSlots[0])
      }
    } else {
      setBookingTime('')
    }
  }, [validBookingSlots, bookingTime])

  const handleBookAppointment = () => {
    setBookingError(null)
    const doctor = availableDoctors.find((acc) => acc.id === bookingDoctorId)
    if (!doctor) {
      setBookingError('Please select a doctor.')
      return
    }

    if (!selectedDoctorAvailability?.isAvailable) {
      setBookingError(`${doctor.name} is currently marked as unavailable/off-duty. Please select another doctor.`)
      return
    }

    if (!bookingDate) {
      setBookingError('Please choose a preferred appointment date.')
      return
    }

    const dayName = getDayOfWeekShort(bookingDate)
    if (!selectedDoctorAvailability.availableDays.includes(dayName)) {
      setBookingError(
        `${doctor.name} is not available on ${dayName}s. Available days: ${selectedDoctorAvailability.availableDays.join(
          ', '
        )}.`
      )
      return
    }

    if (!bookingTime || validBookingSlots.length === 0) {
      setBookingError('No available time slots within the doctor’s working hours for the selected date.')
      return
    }

    if (!bookingReason.trim()) {
      setBookingError('Please provide a reason or symptom description for your appointment.')
      return
    }

    const request: AppointmentRequest = {
      id: `appt-${Date.now()}`,
      patientId: currentUser.id,
      patientName: currentUser.name,
      patientEmail: currentUser.email,
      mrn: 'MRN-84920',
      doctorId: doctor.id,
      doctorName: doctor.name,
      department: doctor.specialization || doctor.department,
      requestedDate: bookingDate,
      requestedTime: bookingTime,
      visitType: bookingVisitType,
      reason: bookingReason.trim(),
      status: 'pending',
      submittedAt: 'Just now'
    }
    const next = [request, ...getStoredAppointments()]
    saveAppointments(next)
    setAppointments(next)
    setBookingReason('')
    setActionFeedback(
      `Appointment requested with ${doctor.name} for ${bookingDate} at ${bookingTime}. Awaiting doctor confirmation.`
    )
    setTimeout(() => setActionFeedback(null), 5000)
  }

  return (
    <div className="min-h-screen bg-[var(--care-bg)] text-[var(--care-ink)]">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-[var(--care-border)] bg-[var(--care-surface)]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--care-primary)] text-white shadow-sm">
                <Activity className="size-5" />
              </span>
              <span className="text-lg font-bold tracking-tight text-[var(--care-ink)]">CareLink</span>
            </Link>

            <span className="hidden h-5 w-px bg-[var(--care-border)] md:block" />

            {/* Live Role Switcher Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 rounded-lg border border-[var(--care-border)] bg-[var(--care-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--care-ink)] transition hover:bg-[var(--care-highlight)]"
              >
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Role: <strong className="text-[var(--care-primary)] font-bold">{currentUser.roleLabel}</strong></span>
                <ChevronDown className="size-3.5 text-[var(--care-muted)]" />
              </button>

              {roleMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-xl border border-[var(--care-border)] bg-[var(--care-surface)] p-2 shadow-xl ring-1 ring-black/5 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--care-muted)] border-b border-[var(--care-border)] mb-1">
                    Switch Active Account
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {displayedSwitchers.map((acc) => {
                      const isCurrent = acc.id === currentUser.id
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSwitchRole(acc)}
                          className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-xs transition ${
                            isCurrent
                              ? 'bg-[var(--care-highlight)] font-bold text-[var(--care-ink)]'
                              : 'text-[var(--care-muted)] hover:bg-[var(--care-bg)] hover:text-[var(--care-ink)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex size-6 items-center justify-center rounded bg-[var(--care-primary)] text-[10px] font-bold text-white">
                              {acc.avatarInitials}
                            </span>
                            <div>
                              <div className="font-semibold flex items-center gap-1">
                                {acc.roleLabel}
                                {acc.isCustom && <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1 rounded">New</span>}
                              </div>
                              <div className="text-[10px] text-[var(--care-muted)]">{acc.name.split(',')[0]}</div>
                            </div>
                          </div>
                          {isCurrent && <CheckCircle2 className="size-4 text-[var(--care-primary)]" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User Profile Pill */}
            <div className="hidden items-center gap-2.5 rounded-full border border-[var(--care-border)] bg-[var(--care-bg)] py-1 pl-1.5 pr-3 text-xs sm:flex">
              <span className="flex size-7 items-center justify-center rounded-full bg-[var(--care-primary)] font-bold text-white">
                {currentUser.avatarInitials}
              </span>
              <div className="text-left">
                <div className="font-semibold leading-none text-[var(--care-ink)]">{currentUser.name}</div>
                <div className="text-[10px] text-[var(--care-muted)] leading-none mt-1">{currentUser.email}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--care-border)] bg-[var(--care-surface)] px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-200"
            >
              <LogOut className="size-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Banner with role credentials & badge */}
        <div className="relative overflow-hidden rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm sm:p-8">
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-[var(--care-highlight)]/50 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--care-primary)] text-xl font-bold text-white shadow-md">
                {currentUser.avatarInitials}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="text-2xl font-bold text-[var(--care-ink)] sm:text-3xl">
                    {currentUser.name}
                  </h1>
                  <span className={`inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-bold ${currentUser.badgeColor}`}>
                    {currentUser.badge}
                  </span>
                  {currentUser.specialization && (
                    <span className="inline-flex items-center rounded-lg border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                      🩺 {currentUser.specialization}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--care-muted)]">
                  {currentUser.title} · <span className="font-semibold text-[var(--care-ink)]">{currentUser.department}</span>
                </p>
                <p className="mt-3 max-w-3xl text-xs sm:text-sm leading-relaxed text-[var(--care-muted)]">
                  {currentUser.summary}
                </p>
              </div>
            </div>

            {/* Fast Switch Badges */}
            <div className="flex flex-col gap-2 rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4 shrink-0 lg:max-w-xs">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--care-muted)] font-semibold">Role:</span>
                <span className="font-bold text-[var(--care-primary)]">{currentUser.roleLabel}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--care-muted)] font-semibold">Login Email:</span>
                <span className="font-mono text-[var(--care-ink)] text-[11px]">{currentUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[var(--care-muted)] font-semibold">Session:</span>
                <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 text-[11px]">
                  <span className="size-1.5 rounded-full bg-emerald-500" /> Active Session
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Simulated Notification */}
        {actionFeedback && (
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs sm:text-sm text-emerald-800 shadow-sm animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {roleSlug === 'patient' && (
          <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
              <div className="flex flex-col gap-1 border-b border-[var(--care-border)] pb-4">
                <h2 className="text-lg font-bold text-[var(--care-ink)]">Request Doctor Appointment</h2>
                <p className="text-xs text-[var(--care-muted)]">
                  Select a physician, check their hospital availability & current queue, and submit your consultation request.
                </p>
              </div>

              {bookingError && (
                <div className="mt-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-800">
                  <AlertCircle className="size-4 shrink-0 text-red-600" />
                  <span>{bookingError}</span>
                </div>
              )}

              <div className="mt-5 grid gap-4">
                {/* Doctor Selection */}
                <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                  Select Physician
                  <select
                    value={bookingDoctorId}
                    onChange={(event) => setBookingDoctorId(event.target.value)}
                    className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-semibold"
                  >
                    {availableDoctors.map((doctor) => (
                      <option key={doctor.id} value={doctor.id}>
                        {doctor.name} {doctor.specialization ? `(${doctor.specialization})` : ''}
                      </option>
                    ))}
                  </select>
                </label>

                {/* Doctor Live Availability & Live Queue Card */}
                {selectedDoctorAvailability && (
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/80 to-indigo-50/60 p-4 space-y-3 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-blue-200/70 pb-2.5">
                      <div className="flex items-center gap-2">
                        <Stethoscope className="size-4 text-blue-700" />
                        <span className="font-bold text-blue-950">{selectedDoctorAvailability.doctorName}</span>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold border ${
                          selectedDoctorAvailability.isAvailable
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-red-100 text-red-800 border-red-200'
                        }`}
                      >
                        {selectedDoctorAvailability.isAvailable ? '● Available in Clinic' : '○ Unavailable / Off-Duty'}
                      </span>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-blue-900">
                      <div>
                        <strong>Consultation Hours:</strong> {selectedDoctorAvailability.startTime} – {selectedDoctorAvailability.endTime}
                      </div>
                      <div>
                        <strong>Available Days:</strong> {selectedDoctorAvailability.availableDays.join(', ')}
                      </div>
                      {selectedDoctorAvailability.breakStartTime && (
                        <div>
                          <strong>Physician Break:</strong> {selectedDoctorAvailability.breakStartTime} – {selectedDoctorAvailability.breakEndTime}
                        </div>
                      )}
                      <div>
                        <strong>Clinic Room:</strong> {selectedDoctorAvailability.statusNote || 'OPD Room 204'}
                      </div>
                    </div>

                    {/* Live Patient Queue Badge for this Doctor */}
                    <div className="flex flex-wrap items-center justify-between rounded-xl bg-white p-3 border border-blue-200 shadow-xs">
                      <div className="flex items-center gap-2">
                        <Users className="size-4 text-[var(--care-primary)]" />
                        <span className="font-bold text-blue-950">Live Queue for This Doctor:</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs font-semibold">
                        <span className="rounded-lg bg-amber-100 px-2 py-0.5 text-amber-900 font-bold">
                          {currentWaitingCount} {currentWaitingCount === 1 ? 'patient' : 'patients'} waiting
                        </span>
                        <span className="text-[11px] text-[var(--care-muted)]">
                          Est. wait ~{estimatedQueueWaitMins} mins
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Date & Time selection */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                    Preferred Date
                    <input
                      type="date"
                      min={getTodayIsoString()}
                      value={bookingDate}
                      onChange={(event) => {
                        setBookingDate(event.target.value)
                        setBookingError(null)
                      }}
                      className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-medium"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                    Available Time Slot (Within Doctor Hours)
                    {validBookingSlots.length > 0 ? (
                      <select
                        value={bookingTime}
                        onChange={(event) => {
                          setBookingTime(event.target.value)
                          setBookingError(null)
                        }}
                        className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-semibold text-[var(--care-ink)]"
                      >
                        {validBookingSlots.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex h-11 items-center rounded-xl border border-red-200 bg-red-50 px-3 text-[11px] font-bold text-red-800">
                        {selectedDoctorAvailability && !selectedDoctorAvailability.availableDays.includes(getDayOfWeekShort(bookingDate))
                          ? `Doctor not available on ${getDayOfWeekShort(bookingDate)}s`
                          : 'No slots available for this date'}
                      </div>
                    )}
                  </label>
                </div>

                <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                  Visit Type
                  <select
                    value={bookingVisitType}
                    onChange={(event) => setBookingVisitType(event.target.value as AppointmentRequest['visitType'])}
                    className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-medium"
                  >
                    <option value="New Consultation">New Consultation</option>
                    <option value="Follow-up">Follow-up</option>
                    <option value="Telehealth">Telehealth (Remote Video)</option>
                    <option value="Post-op Review">Post-op Review</option>
                  </select>
                </label>

                <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                  Reason for Visit & Symptoms
                  <textarea
                    value={bookingReason}
                    onChange={(event) => {
                      setBookingReason(event.target.value)
                      setBookingError(null)
                    }}
                    rows={3}
                    placeholder="Describe your current symptoms or reason for consulting the doctor..."
                    className="rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 py-2 text-xs"
                  />
                </label>

                <button
                  type="button"
                  disabled={!selectedDoctorAvailability?.isAvailable || validBookingSlots.length === 0}
                  onClick={handleBookAppointment}
                  className="h-11 rounded-xl bg-[var(--care-primary)] text-xs font-bold text-white shadow-sm hover:bg-[var(--care-primary-dark)] disabled:cursor-not-allowed disabled:opacity-50 transition"
                >
                  Submit Appointment Request
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
              <h2 className="text-base font-bold text-[var(--care-ink)]">Your requests</h2>
              <div className="mt-4 space-y-3">
                {myAppointments.length === 0 && (
                  <p className="text-sm text-[var(--care-muted)]">No appointment requests yet.</p>
                )}
                {myAppointments.map((appt) => (
                  <div key={appt.id} className="rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[var(--care-ink)]">{appt.doctorName}</p>
                      <span className="rounded-md bg-[var(--care-highlight)] px-2 py-0.5 text-[10px] font-bold uppercase">
                        {appt.status}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-[var(--care-muted)]">
                      Requested {appt.requestedDate} at {appt.requestedTime}
                    </p>
                    {appt.status === 'rescheduled' && appt.rescheduledDate && (
                      <p className="mt-1 text-xs font-semibold text-amber-700">
                        Doctor offered {appt.rescheduledDate} at {appt.rescheduledTime}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* PATIENT VIEW: Electronic Prescriptions & Medication Timetable */}
        {roleSlug === 'patient' && (
          <section className="mt-8 rounded-3xl border border-teal-200 bg-gradient-to-br from-teal-50/70 via-emerald-50/50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-teal-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-teal-600 text-white shadow-xs">
                  <Pill className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-teal-950">
                    Your Digital Prescriptions & Daily Medication Timetable
                  </h2>
                  <p className="text-xs text-teal-800">
                    Shared directly by your Attending Nurse & Physician during clinic consultation
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-teal-100 border border-teal-300 px-3 py-1 text-xs font-bold text-teal-900 self-start sm:self-auto">
                {prescriptions.filter((rx) => rx.sharedWithPatient).length} Active Prescriptions
              </span>
            </div>

            {prescriptions.filter((rx) => rx.sharedWithPatient).length === 0 ? (
              <div className="mt-5 rounded-2xl border border-dashed border-teal-200 bg-white/70 p-8 text-center text-xs text-teal-800">
                <FileText className="mx-auto size-8 text-teal-400 mb-2" />
                No active electronic prescriptions logged yet. They will appear here once written by the Nurse during your consult.
              </div>
            ) : (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {prescriptions
                  .filter((rx) => rx.sharedWithPatient)
                  .map((rx) => (
                    <div
                      key={rx.id}
                      className="rounded-2xl border border-teal-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 border-b border-[var(--care-border)] pb-3">
                          <div>
                            <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-900">
                              Rx #{rx.id.toUpperCase()}
                            </span>
                            <h3 className="mt-1 text-sm font-bold text-[var(--care-ink)]">{rx.diagnosis}</h3>
                            <p className="text-[11px] text-[var(--care-muted)]">
                              By {rx.nurseName} · {rx.doctorName}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                            {rx.status.toUpperCase()}
                          </span>
                        </div>

                        {/* Vitals Recorded */}
                        <div className="mt-3 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-2.5 text-center text-[10px]">
                          <div>
                            <p className="text-[var(--care-muted)] font-semibold">BP</p>
                            <p className="font-bold text-[var(--care-ink)]">{rx.vitals.bloodPressure}</p>
                          </div>
                          <div>
                            <p className="text-[var(--care-muted)] font-semibold">HR</p>
                            <p className="font-bold text-[var(--care-ink)]">{rx.vitals.heartRate}</p>
                          </div>
                          <div>
                            <p className="text-[var(--care-muted)] font-semibold">SpO2</p>
                            <p className="font-bold text-[var(--care-ink)]">{rx.vitals.spO2}</p>
                          </div>
                          <div>
                            <p className="text-[var(--care-muted)] font-semibold">Temp</p>
                            <p className="font-bold text-[var(--care-ink)]">{rx.vitals.temperature}</p>
                          </div>
                        </div>

                        {/* Medication Timetable */}
                        <div className="mt-3 space-y-2">
                          <p className="text-xs font-bold text-[var(--care-ink)] flex items-center gap-1.5">
                            <Clock className="size-3.5 text-teal-600" />
                            Medication Schedule & Timings:
                          </p>
                          <div className="space-y-2">
                            {rx.medications.map((med) => (
                              <div
                                key={med.id}
                                className="rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)]/60 p-3 text-xs"
                              >
                                <div className="flex items-center justify-between font-bold text-[var(--care-ink)]">
                                  <span>
                                    {med.name} ({med.dosage} - {med.form})
                                  </span>
                                  <span className="rounded-md bg-teal-100 px-2 py-0.5 text-[10px] text-teal-900 font-extrabold">
                                    {med.durationDays} Days
                                  </span>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px]">
                                  <span className="rounded bg-white px-2 py-0.5 font-bold text-teal-800 border border-teal-200">
                                    🕒 {med.scheduleTimes.join(', ')}
                                  </span>
                                  <span className="rounded bg-amber-50 px-2 py-0.5 font-semibold text-amber-900 border border-amber-200">
                                    🍽️ {med.timingInstructions}
                                  </span>
                                  <span className="text-[var(--care-muted)]">({med.frequency})</span>
                                </div>
                                {med.instructions && (
                                  <p className="mt-1.5 text-[11px] text-[var(--care-muted)] italic">
                                    "{med.instructions}"
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {rx.nurseNotes && (
                        <div className="mt-3 rounded-xl bg-teal-50/70 p-2.5 text-[11px] text-teal-950 border border-teal-200/60">
                          <strong>Nurse Instructions:</strong> {rx.nurseNotes}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}

        {/* MEDICAL STAFF (PHARMACY) VIEW: Nurse Dispatched Prescriptions Queue */}
        {roleSlug === 'medical-staff' && (
          <section className="mt-8 rounded-3xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 via-blue-50/50 to-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-indigo-200/80 pb-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xs">
                  <PackageCheck className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold text-indigo-950">
                    Nurse-Dispatched Digital Prescriptions & Pharmacy Dispense Queue
                  </h2>
                  <p className="text-xs text-indigo-800">
                    Live electronic prescriptions shared by Nurse Station for medication packaging & dispensing
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-indigo-100 border border-indigo-300 px-3 py-1 text-xs font-bold text-indigo-900 self-start sm:self-auto">
                {prescriptions.filter((rx) => rx.sharedWithPharmacy).length} Orders in Pharmacy Queue
              </span>
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              {prescriptions
                .filter((rx) => rx.sharedWithPharmacy)
                .map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-2xl border border-indigo-200 bg-white p-5 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 border-b border-[var(--care-border)] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-[var(--care-ink)]">{rx.patientName}</span>
                            <span className="font-mono text-[10px] text-[var(--care-muted)]">{rx.mrn}</span>
                          </div>
                          <p className="text-xs text-indigo-900 font-semibold mt-0.5">Diagnosis: {rx.diagnosis}</p>
                          <p className="text-[11px] text-[var(--care-muted)]">
                            Dispatched by Nurse {rx.nurseName} · {rx.doctorName}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                            rx.status === 'dispensed'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border-amber-200'
                          }`}
                        >
                          {rx.status === 'dispensed' ? 'Dispensed & Verified' : 'Awaiting Dispense'}
                        </span>
                      </div>

                      {/* Prescribed Items Schedule */}
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-bold text-[var(--care-ink)]">Medications to Dispense:</p>
                        <div className="space-y-1.5">
                          {rx.medications.map((med) => (
                            <div
                              key={med.id}
                              className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 text-xs border border-[var(--care-border)]"
                            >
                              <div>
                                <span className="font-bold text-[var(--care-ink)]">
                                  {med.name} {med.dosage}
                                </span>
                                <span className="ml-2 text-[11px] text-[var(--care-muted)]">
                                  ({med.form} · {med.durationDays} days supply)
                                </span>
                                <div className="text-[11px] text-indigo-900 mt-0.5">
                                  Schedule: <strong>{med.scheduleTimes.join(', ')}</strong> ({med.timingInstructions})
                                </div>
                              </div>
                              <span className="font-mono text-[10px] rounded bg-indigo-100 px-2 py-0.5 text-indigo-900 font-bold">
                                {med.frequency}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-[var(--care-border)] pt-3">
                      <span className="text-[11px] text-[var(--care-muted)]">Transmitted {rx.createdAt}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = prescriptions.map((item) =>
                            item.id === rx.id
                              ? {
                                  ...item,
                                  status: (item.status === 'dispensed' ? 'active' : 'dispensed') as PrescriptionRecord['status']
                                }
                              : item
                          )
                          setPrescriptions(updated)
                          savePrescriptions(updated)
                          triggerAction(`Prescription ${rx.id} status updated`)
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition ${
                          rx.status === 'dispensed'
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                      >
                        <Check className="size-3.5" />
                        <span>{rx.status === 'dispensed' ? 'Re-open Order' : 'Mark Dispensed'}</span>
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {/* Billing Staff: Prescription & Clinical Invoicing Queue */}
        {roleSlug === 'billing-staff' && (
          <section className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 via-white to-white p-6 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                  <Receipt className="size-3.5" />
                  Synchronized Billing Stream
                </span>
                <h2 className="mt-2 text-xl font-bold text-emerald-950">Medication & Care Invoicing Queue</h2>
                <p className="text-sm text-slate-600">
                  Real-time invoice generation synchronized directly from Nurse Prescriptions & Doctor Consultations.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-100/70 border border-emerald-200 px-3 py-1.5 rounded-xl">
                  {billings.filter((b) => b.status === 'pending').length} Pending Invoices
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {billings.map((bill) => (
                <div
                  key={bill.id}
                  className={`rounded-2xl border p-5 transition ${
                    bill.status === 'paid'
                      ? 'border-emerald-200 bg-emerald-50/40 opacity-85'
                      : 'border-emerald-200/80 bg-white shadow-xs hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-500">{bill.id}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            bill.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-[var(--care-ink)]">{bill.patientName}</h3>
                      <p className="text-xs text-[var(--care-muted)]">
                        Provider: <strong>{bill.providerName}</strong> ({bill.providerRole})
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-[var(--care-muted)]">Total Amount</div>
                      <div className="text-xl font-black text-emerald-700 font-mono">${bill.totalAmount.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Line items */}
                  <div className="mt-4 rounded-xl bg-slate-50 p-3 border border-slate-200/60">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Billable Items ({bill.items.length})
                    </div>
                    <div className="space-y-1.5">
                      {bill.items.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <span className="text-slate-700 truncate max-w-[200px] sm:max-w-[260px]">{item.description}</span>
                          <span className="font-mono font-semibold text-slate-900">${item.amount.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-[var(--care-border)] pt-3">
                    <span className="text-[11px] text-[var(--care-muted)]">Issued {bill.createdAt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = billings.map((b) =>
                          b.id === bill.id
                            ? {
                                ...b,
                                status: (b.status === 'paid' ? 'pending' : 'paid') as BillingRecord['status'],
                                paidAt: b.status === 'paid' ? undefined : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              }
                            : b
                        )
                        setBillings(updated)
                        saveBillings(updated)
                        triggerAction(`Billing record ${bill.id} updated`)
                      }}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold shadow-xs transition ${
                        bill.status === 'paid'
                          ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <DollarSign className="size-3.5" />
                      <span>{bill.status === 'paid' ? 'Re-open Claim' : 'Approve & Settle Invoice'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Operational Stats Grid */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[var(--care-ink)] flex items-center gap-2">
              <Zap className="size-4 text-[var(--care-primary)]" />
              Live Operational Metrics
            </h2>
            <span className="text-xs text-[var(--care-muted)]">Updated just now</span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {currentUser.stats.map((stat, i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-5 shadow-sm transition hover:shadow-md"
              >
                <p className="text-xs font-medium text-[var(--care-muted)]">{stat.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--care-ink)]">{stat.value}</p>
                {stat.change && (
                  <p className={`mt-1.5 text-xs font-semibold ${
                    stat.tone === 'positive'
                      ? 'text-emerald-600'
                      : stat.tone === 'warning'
                      ? 'text-amber-600'
                      : 'text-[var(--care-muted)]'
                  }`}>
                    {stat.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Two-Column Section: Activities & Quick Actions */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
          {/* Recent Role Activities */}
          <section className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[var(--care-border)] pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-[var(--care-primary)]" />
                <h3 className="font-bold text-[var(--care-ink)] text-sm sm:text-base">
                  Recent Activities & Workflow Log
                </h3>
              </div>
              <span className="rounded-md bg-[var(--care-highlight)] px-2 py-0.5 text-[11px] font-semibold text-[var(--care-ink)]">
                Real-time
              </span>
            </div>

            <div className="space-y-3">
              {currentUser.recentActivities.map((act, i) => (
                <div
                  key={i}
                  className="flex items-start justify-between gap-3 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)]/60 p-3.5 transition hover:bg-[var(--care-highlight)]/40"
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 size-2 rounded-full bg-[var(--care-primary)] shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--care-ink)]">{act.title}</p>
                      <p className="text-xs text-[var(--care-muted)] mt-0.5">{act.subtitle}</p>
                      <span className="text-[10px] text-[var(--care-muted)] mt-1 inline-block font-mono">
                        {act.time}
                      </span>
                    </div>
                  </div>
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${act.statusColor}`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Role Actions & Permissions */}
          <div className="space-y-6">
            {/* Quick Actions Panel */}
            <section className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--care-border)] pb-4 mb-4">
                <Sparkles className="size-4 text-[var(--care-primary)]" />
                <h3 className="font-bold text-[var(--care-ink)] text-sm sm:text-base">
                  Quick Actions
                </h3>
              </div>

              <div className="space-y-2.5">
                {currentUser.quickActions.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => triggerAction(action.label)}
                    className="group flex w-full items-center justify-between rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] p-3 text-left transition hover:border-[var(--care-primary)] hover:bg-[var(--care-highlight)]"
                  >
                    <div>
                      <p className="text-xs sm:text-sm font-semibold text-[var(--care-ink)] group-hover:text-[var(--care-primary-dark)]">
                        {action.label}
                      </p>
                      <p className="text-[11px] text-[var(--care-muted)] mt-0.5">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="size-4 text-[var(--care-muted)] transition group-hover:translate-x-1 group-hover:text-[var(--care-primary)] shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </section>

            {/* Role Permissions Card */}
            <section className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-[var(--care-border)] pb-4 mb-4">
                <Shield className="size-4 text-[var(--care-primary)]" />
                <h3 className="font-bold text-[var(--care-ink)] text-sm sm:text-base">
                  Authorized Role Permissions
                </h3>
              </div>

              <ul className="space-y-2">
                {currentUser.permissions.map((perm, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-[var(--care-muted)]">
                    <CheckCircle2 className="size-3.5 text-[var(--care-primary)] shrink-0 mt-0.5" />
                    <span>{perm}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        {/* Quick Role Switcher Bar at Bottom */}
        <section className="mt-10 rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[var(--care-border)] pb-4">
            <div>
              <h3 className="font-bold text-[var(--care-ink)] text-sm sm:text-base flex items-center gap-2">
                <Layers className="size-4 text-[var(--care-primary)]" />
                Explore Other Accounts
              </h3>
              <p className="text-xs text-[var(--care-muted)]">
                Instantly switch to test any other CareLink hospital role
              </p>
            </div>
            <Link
              href="/admin"
              className="text-xs font-semibold text-red-600 hover:underline self-start sm:self-auto flex items-center gap-1"
            >
              Open Admin Portal & Provision Accounts <ArrowRight className="size-3.5" />
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
            {displayedSwitchers.slice(0, 7).map((acc) => {
              const isCurrent = acc.id === currentUser.id
              return (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => handleSwitchRole(acc)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 text-center transition border ${
                    isCurrent
                      ? 'border-[var(--care-primary)] bg-[var(--care-highlight)] text-[var(--care-ink)] shadow-sm'
                      : 'border-[var(--care-border)] bg-[var(--care-bg)] hover:bg-[var(--care-highlight)]/50'
                  }`}
                >
                  <span className="flex size-8 items-center justify-center rounded-lg bg-[var(--care-primary)] text-xs font-bold text-white mb-1.5">
                    {acc.avatarInitials}
                  </span>
                  <span className="text-xs font-bold text-[var(--care-ink)] leading-tight">{acc.roleLabel}</span>
                  <span className="text-[10px] text-[var(--care-muted)] mt-0.5 truncate max-w-full">
                    {acc.name.split(',')[0]}
                  </span>
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
