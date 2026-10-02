'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  APPOINTMENT_TIME_SLOTS,
  BillingRecord,
  DEMO_ACCOUNTS,
  DemoAccount,
  getAllAccounts,
  getDemoAccountByRole,
  getStoredBillings,
  getStoredLeaveRequests,
  getStoredPatients,
  getStoredPrescriptions,
  INITIAL_PATIENTS,
  INITIAL_PRESCRIPTIONS,
  LeaveRequest,
  MedicationItem,
  PatientRecord,
  PrescriptionRecord,
  saveBillings,
  saveLeaveRequests,
  savePatients,
  savePrescriptions,
  syncPrescriptionToBillingRecord
} from '@/lib/demo-accounts'
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarCheck,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  DoorOpen,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileText,
  Flame,
  HeartPulse,
  History,
  Info,
  Layers,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Pencil,
  Pill,
  Plus,
  PlusCircle,
  Radio,
  Receipt,
  RefreshCw,
  Search,
  Send,
  Share2,
  Shield,
  ShieldAlert,
  Sparkles,
  Stethoscope,
  Thermometer,
  Timer,
  Trash2,
  User,
  UserCheck,
  UserPlus,
  Users,
  X,
  Zap
} from 'lucide-react'

type NurseTab = 'queue-flow' | 'prescriptions' | 'active-consultations' | 'triage-vitals' | 'shared-orders' | 'leave-requests'

const AVAILABLE_MEDICINES_LIBRARY = [
  { name: 'Metoprolol Succinate', defaultDosage: '25mg', form: 'Tablet' as const, timing: 'After Food' as const, frequency: 'Once Daily (Morning)', timeSlots: ['08:30 AM'] },
  { name: 'Paracetamol', defaultDosage: '650mg', form: 'Tablet' as const, timing: 'After Food' as const, frequency: 'Twice Daily (Morning & Night)', timeSlots: ['08:30 AM', '08:30 PM'] },
  { name: 'Atorvastatin', defaultDosage: '20mg', form: 'Tablet' as const, timing: 'At Bedtime' as const, frequency: 'Once Daily (Night)', timeSlots: ['09:00 PM'] },
  { name: 'Amoxicillin & Clavulanate', defaultDosage: '625mg', form: 'Tablet' as const, timing: 'After Food' as const, frequency: 'Twice Daily', timeSlots: ['09:00 AM', '09:00 PM'] },
  { name: 'Salbutamol HFA Inhaler', defaultDosage: '100mcg (2 Puffs)', form: 'Inhaler' as const, timing: 'As Needed (SOS)' as const, frequency: 'Every 6 hours if breathless', timeSlots: ['08:00 AM', '02:00 PM', '08:00 PM'] },
  { name: 'Ceftriaxone IV', defaultDosage: '1g IV', form: 'Injection' as const, timing: 'With Food' as const, frequency: 'Once Daily IV', timeSlots: ['10:00 AM'] },
  { name: 'Insulin Glargine', defaultDosage: '14 Units', form: 'Injection' as const, timing: 'At Bedtime' as const, frequency: 'Once Daily SubQ', timeSlots: ['09:30 PM'] },
  { name: 'Pantoprazole', defaultDosage: '40mg', form: 'Tablet' as const, timing: 'Before Food' as const, frequency: 'Once Daily (Morning Before Breakfast)', timeSlots: ['07:30 AM'] },
  { name: 'Aspirin Cardio', defaultDosage: '81mg', form: 'Tablet' as const, timing: 'After Food' as const, frequency: 'Once Daily', timeSlots: ['09:00 AM'] }
]

function getTomorrowIsoString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDayAfterTomorrowIsoString(): string {
  const d = new Date()
  d.setDate(d.getDate() + 2)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function calculateDaysBetween(startStr: string, endStr: string): number {
  if (!startStr || !endStr) return 1
  try {
    const s = new Date(startStr)
    const e = new Date(endStr)
    const diffTime = e.getTime() - s.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays > 0 ? diffDays : 1
  } catch {
    return 1
  }
}

export function NurseDashboard() {
  const router = useRouter()
  const defaultAccount = getDemoAccountByRole('nurse') || DEMO_ACCOUNTS[2]
  const [currentUser, setCurrentUser] = useState<DemoAccount>(defaultAccount)
  const [allRoleAccounts, setAllRoleAccounts] = useState<DemoAccount[]>([])
  const [roleMenuOpen, setRoleMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<NurseTab>('queue-flow')
  const [patients, setPatients] = useState<PatientRecord[]>(INITIAL_PATIENTS)
  const [prescriptions, setPrescriptions] = useState<PrescriptionRecord[]>(INITIAL_PRESCRIPTIONS)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [bannerNotice, setBannerNotice] = useState<{ message: string; type?: 'success' | 'info' | 'warning' } | null>(
    null
  )

  // Leave Request Form State
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Sick Leave')
  const [leaveStartDate, setLeaveStartDate] = useState(getTomorrowIsoString)
  const [leaveEndDate, setLeaveEndDate] = useState(getDayAfterTomorrowIsoString)
  const [leaveDaysCount, setLeaveDaysCount] = useState(2)
  const [leaveShiftSlot, setLeaveShiftSlot] = useState<LeaveRequest['shiftSlot']>('Morning (08:00 - 16:00)')
  const [leaveReason, setLeaveReason] = useState('')

  const leaveStartRef = React.useRef<HTMLInputElement>(null)
  const leaveEndRef = React.useRef<HTMLInputElement>(null)

  const handleStartDateChange = (val: string) => {
    setLeaveStartDate(val)
    if (val > leaveEndDate) {
      setLeaveEndDate(val)
      setLeaveDaysCount(1)
    } else {
      setLeaveDaysCount(calculateDaysBetween(val, leaveEndDate))
    }
  }

  const handleEndDateChange = (val: string) => {
    setLeaveEndDate(val)
    setLeaveDaysCount(calculateDaysBetween(leaveStartDate, val))
  }

  // Doctor list for assignment
  const [availableDoctors, setAvailableDoctors] = useState<DemoAccount[]>([])

  // Modal: Assign Doctor & Room Modal
  const [assigningPatient, setAssigningPatient] = useState<PatientRecord | null>(null)
  const [selectedDoctorName, setSelectedDoctorName] = useState('Dr. Alexander Wright')
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('OPD Room 204 (Cardiology)')
  const [triageNote, setTriageNote] = useState('')

  // Modal: Triage Vitals Intake Modal
  const [triagePatient, setTriagePatient] = useState<PatientRecord | null>(null)
  const [bpInput, setBpInput] = useState('120/80')
  const [hrInput, setHrInput] = useState('76')
  const [spo2Input, setSpo2Input] = useState('99')
  const [tempInput, setTempInput] = useState('98.6')
  const [priorityInput, setPriorityInput] = useState<'Normal' | 'Urgent' | 'STAT'>('Normal')

  // Modal: Walk-in Registration Modal
  const [showWalkinModal, setShowWalkinModal] = useState(false)
  const [walkinName, setWalkinName] = useState('')
  const [walkinAge, setWalkinAge] = useState('38')
  const [walkinGender, setWalkinGender] = useState<'Female' | 'Male' | 'Other'>('Female')
  const [walkinSymptoms, setWalkinSymptoms] = useState('')
  const [walkinDoctor, setWalkinDoctor] = useState('Dr. Alexander Wright')
  const [walkinPriority, setWalkinPriority] = useState<'Normal' | 'Urgent' | 'STAT'>('Normal')

  // Modal: Severe Fever & Urgent Triage Protocol State
  const [severePatient, setSeverePatient] = useState<PatientRecord | null>(null)
  const [showSevereModal, setShowSevereModal] = useState(false)
  const [severeFeverTemp, setSevereFeverTemp] = useState('109.0')
  const [severeDiagnosis, setSevereDiagnosis] = useState('High-Grade Pyrexia (109.0°F Fever) & Acute Dehydration')
  const [severeNurseActions, setSevereNurseActions] = useState('Emergency tepid sponge cooling administered, oral/IV antipyretic hydration initiated, vitals stabilized.')

  // Prescription Form State
  const [rxPatientId, setRxPatientId] = useState('')
  const [rxDoctorName, setRxDoctorName] = useState('Dr. Alexander Wright, MD')
  const [rxDiagnosis, setRxDiagnosis] = useState('')
  const [rxNurseNotes, setRxNurseNotes] = useState('')
  const [rxMedications, setRxMedications] = useState<MedicationItem[]>([
    {
      id: `med-${Date.now()}-1`,
      name: 'Metoprolol Succinate',
      dosage: '25mg',
      form: 'Tablet',
      frequency: 'Once Daily (Morning)',
      scheduleTimes: ['08:30 AM'],
      timingInstructions: 'After Food',
      durationDays: 14,
      instructions: 'Take after breakfast with plenty of water.'
    }
  ])

  // New medication builder item state
  const [newMedLibSelected, setNewMedLibSelected] = useState(AVAILABLE_MEDICINES_LIBRARY[0].name)
  const [newMedDosage, setNewMedDosage] = useState(AVAILABLE_MEDICINES_LIBRARY[0].defaultDosage)
  const [newMedForm, setNewMedForm] = useState<MedicationItem['form']>('Tablet')
  const [newMedTiming, setNewMedTiming] = useState<MedicationItem['timingInstructions']>('After Food')
  const [newMedFrequency, setNewMedFrequency] = useState('Once Daily (Morning)')
  const [newMedTimes, setNewMedTimes] = useState('08:30 AM')
  const [newMedDuration, setNewMedDuration] = useState('14')
  const [newMedCustomInstructions, setNewMedCustomInstructions] = useState('')

  // Slide-over drawer for patient details
  const [drawerPatient, setDrawerPatient] = useState<PatientRecord | null>(null)

  useEffect(() => {
    const allAccs = getAllAccounts()
    setAllRoleAccounts(allAccs)
    const docs = allAccs.filter((a) => a.roleSlug === 'doctor')
    setAvailableDoctors(docs)
    if (docs.length > 0) {
      setSelectedDoctorName(docs[0].name)
      setWalkinDoctor(docs[0].name)
      setRxDoctorName(docs[0].name)
    }

    const storedPatients = getStoredPatients()
    setPatients(storedPatients)
    if (storedPatients.length > 0) {
      setRxPatientId(storedPatients[0].id)
    }

    setPrescriptions(getStoredPrescriptions())
    setLeaveRequests(getStoredLeaveRequests())

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'carelink_leave_requests') {
        setLeaveRequests(getStoredLeaveRequests())
      }
      if (e.key === 'carelink_patients') {
        setPatients(getStoredPatients())
      }
      if (e.key === 'carelink_prescriptions') {
        setPrescriptions(getStoredPrescriptions())
      }
    }
    window.addEventListener('storage', handleStorageChange)

    const stored = localStorage.getItem('carelink_user')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as DemoAccount
        if (parsed && parsed.roleSlug === 'nurse') {
          setCurrentUser(parsed)
          return () => window.removeEventListener('storage', handleStorageChange)
        }
      } catch {
        // ignore parsing error
      }
    }

    const matched = getDemoAccountByRole('nurse')
    if (matched) {
      setCurrentUser(matched)
      localStorage.setItem('carelink_user', JSON.stringify(matched))
    }

    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const showNotice = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setBannerNotice({ message, type })
    window.setTimeout(() => setBannerNotice(null), 5000)
  }

  const persistPatients = (next: PatientRecord[]) => {
    setPatients(next)
    savePatients(next)
  }

  const persistPrescriptions = (next: PrescriptionRecord[]) => {
    setPrescriptions(next)
    savePrescriptions(next)
  }

  const handleSubmitLeaveRequest = (e: React.FormEvent) => {
    e.preventDefault()
    if (!leaveReason.trim()) {
      showNotice('Please provide a reason for the leave request.', 'warning')
      return
    }

    const tomorrowStr = getTomorrowIsoString()
    if (leaveStartDate < tomorrowStr) {
      showNotice('Leave can only be requested from tomorrow onwards. Today and past dates are not permitted.', 'warning')
      return
    }

    if (leaveEndDate < leaveStartDate) {
      showNotice('End date cannot be earlier than start date.', 'warning')
      return
    }

    const finalDays = Math.max(1, calculateDaysBetween(leaveStartDate, leaveEndDate))

    const newLeave: LeaveRequest = {
      id: `leave-nurse-${Date.now()}`,
      staffId: currentUser.id,
      staffName: currentUser.name,
      staffRole: 'Nurse',
      department: 'Inpatient Medical/Surgical Ward 4B',
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      shiftSlot: leaveShiftSlot,
      reason: `${leaveReason.trim()} (${finalDays} day${finalDays > 1 ? 's' : ''})`,
      status: 'pending',
      submittedAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const updated = [newLeave, ...leaveRequests]
    setLeaveRequests(updated)
    saveLeaveRequests(updated)
    setLeaveReason('')
    showNotice(`🏖️ Leave request for ${finalDays} day(s) (${leaveStartDate} to ${leaveEndDate}) submitted to Admin for approval!`, 'success')
  }

  const handleSignOut = () => {
    localStorage.removeItem('carelink_user')
    router.push('/sign-in')
  }

  const handleSwitchRole = (account: DemoAccount) => {
    localStorage.setItem('carelink_user', JSON.stringify(account))
    setRoleMenuOpen(false)
    router.push(`/${account.roleSlug}`)
  }

  // Filtered patient list
  const waitingPatients = useMemo(() => {
    return patients.filter((p) => p.status === 'waiting' || p.status === 'registered')
  }, [patients])

  const diagnosingPatients = useMemo(() => {
    return patients.filter((p) => p.status === 'diagnosing')
  }, [patients])

  const completedPatients = useMemo(() => {
    return patients.filter((p) => p.status === 'completed')
  }, [patients])

  // Nurse calls the next patient in line and assigns doctor
  const handleCallNextPatientFlow = () => {
    if (waitingPatients.length === 0) {
      showNotice('No patients waiting in queue!', 'info')
      return
    }

    const nextPatient = waitingPatients[0]
    setAssigningPatient(nextPatient)
  }

  // Confirm doctor and room assignment by nurse
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!assigningPatient) return

    const updated = patients.map((p) => {
      if (p.id === assigningPatient.id) {
        return {
          ...p,
          status: 'diagnosing' as const,
          assignedDoctor: selectedDoctorName,
          notes: triageNote.trim() || `Assigned by Nurse ${currentUser.name} to ${selectedRoomNumber}`
        }
      }
      return p
    })

    persistPatients(updated)
    setAssigningPatient(null)
    setTriageNote('')
    showNotice(
      `Called Token #${assigningPatient.mrn.slice(-2)}: ${assigningPatient.name} into ${selectedRoomNumber} for ${selectedDoctorName}!`,
      'success'
    )
  }

  // Nurse completes consultation / moves to observation
  const handleCompletePatient = (patient: PatientRecord) => {
    const updated = patients.map((p) => {
      if (p.id === patient.id) {
        return {
          ...p,
          status: 'completed' as const,
          completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: p.notes || `Consultation concluded by Nurse ${currentUser.name}`
        }
      }
      return p
    })
    persistPatients(updated)
    showNotice(`Consultation completed for ${patient.name}. Prescription ready to dispatch.`, 'success')
  }

  // Update Triage Vitals
  const handleSaveTriageVitals = (e: React.FormEvent) => {
    e.preventDefault()
    if (!triagePatient) return

    const updated = patients.map((p) => {
      if (p.id === triagePatient.id) {
        return {
          ...p,
          triagePriority: priorityInput,
          notes: `Vitals recorded: BP ${bpInput}, HR ${hrInput} bpm, SpO2 ${spo2Input}%, Temp ${tempInput}°F`
        }
      }
      return p
    })

    persistPatients(updated)
    setTriagePatient(null)
    showNotice(`Vitals and triage priority updated for ${triagePatient.name}!`, 'success')
  }

  // Register Walk-in Patient
  const handleRegisterWalkin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!walkinName.trim()) return

    const newPt: PatientRecord = {
      id: `pt-${Date.now()}`,
      mrn: `MRN-${Math.floor(80000 + Math.random() * 19000)}`,
      name: walkinName.trim(),
      age: parseInt(walkinAge) || 30,
      gender: walkinGender,
      registeredTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'waiting',
      department: 'Cardiology & Triage',
      assignedDoctor: walkinDoctor,
      symptoms: walkinSymptoms.trim() || 'Walk-in outpatient triage intake',
      triagePriority: walkinPriority,
      notes: `Registered at Nurse Station by ${currentUser.name}`
    }

    const updated = [newPt, ...patients]
    persistPatients(updated)
    setShowWalkinModal(false)
    setWalkinName('')
    setWalkinSymptoms('')
    showNotice(`Patient ${newPt.name} (${newPt.mrn}) checked into live nurse queue!`, 'success')
  }

  // Add Medication Item to Prescription Builder
  const handleAddMedicationToRx = () => {
    const timesArray = newMedTimes.split(',').map((t) => t.trim()).filter(Boolean)
    const newMed: MedicationItem = {
      id: `med-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      name: newMedLibSelected,
      dosage: newMedDosage,
      form: newMedForm,
      frequency: newMedFrequency,
      scheduleTimes: timesArray.length > 0 ? timesArray : ['08:00 AM'],
      timingInstructions: newMedTiming,
      durationDays: parseInt(newMedDuration) || 7,
      instructions: newMedCustomInstructions.trim() || undefined
    }

    setRxMedications([...rxMedications, newMed])
    setNewMedCustomInstructions('')
    showNotice(`Added ${newMed.name} to medication schedule list.`, 'info')
  }

  // Remove Medication Item from Builder
  const handleRemoveMedicationFromRx = (id: string) => {
    setRxMedications(rxMedications.filter((m) => m.id !== id))
  }

  // Bump Severe Patient to Top of Doctor Queue (#1 priority)
  const handleBumpToTopPriority = (targetPt: PatientRecord) => {
    const otherWaiting = waitingPatients.filter((p) => p.id !== targetPt.id)
    const updatedPt: PatientRecord = {
      ...targetPt,
      triagePriority: 'STAT',
      notes: `[CRITICAL 109°F FEVER / STAT] Fast-tracked to #1 in Doctor Queue by Nurse ${currentUser.name}`
    }
    const nonWaiting = patients.filter((p) => p.status !== 'waiting' && p.status !== 'registered')
    const updated = [updatedPt, ...otherWaiting, ...nonWaiting]
    persistPatients(updated)
    setSeverePatient(null)
    setShowSevereModal(false)
    showNotice(`Patient ${targetPt.name} fast-tracked to #1 in Doctor Queue with STAT priority!`, 'warning')
  }

  // Nurse Direct Care Protocol (Treat without Doctor for General Fever / Checkup)
  const handleNurseDirectFeverProtocol = (targetPt: PatientRecord) => {
    // Conclude patient intake
    const updatedPatients = patients.map((p) => {
      if (p.id === targetPt.id) {
        return {
          ...p,
          status: 'completed' as const,
          completedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          notes: `Treated under Nurse Direct Care (109°F Fever Protocol) by Nurse ${currentUser.name}. Vitals stabilized.`
        }
      }
      return p
    })
    persistPatients(updatedPatients)

    // Generate complete prescription with timing schedule
    const feverRx: PrescriptionRecord = {
      id: `rx-nurse-${Date.now()}`,
      patientId: targetPt.id,
      patientName: targetPt.name,
      mrn: targetPt.mrn,
      doctorId: 'demo-doctor',
      doctorName: 'Dr. Alexander Wright, MD (Clinical Standing Protocol)',
      nurseId: currentUser.id,
      nurseName: currentUser.name,
      diagnosis: severeDiagnosis.trim() || 'Acute Severe Hyperpyrexia (109.0°F Fever) & Dehydration',
      vitals: {
        bloodPressure: '118/78 mmHg',
        heartRate: '96 bpm',
        spO2: '98%',
        temperature: `${severeFeverTemp}°F`
      },
      medications: [
        {
          id: `med-${Date.now()}-1`,
          name: 'Paracetamol Antipyretic',
          dosage: '650mg',
          form: 'Tablet',
          frequency: 'Thrice Daily (TID)',
          scheduleTimes: ['08:30 AM', '02:30 PM', '08:30 PM'],
          timingInstructions: 'After Food',
          durationDays: 5,
          instructions: 'Take strictly after meals for fever reduction. Repeat if temperature > 101°F.'
        },
        {
          id: `med-${Date.now()}-2`,
          name: 'Oral Rehydration Salts (ORS)',
          dosage: '1 Sachet in 1L Water',
          form: 'Bottle',
          frequency: 'Twice Daily (Morning & Afternoon)',
          scheduleTimes: ['09:00 AM', '03:00 PM'],
          timingInstructions: 'With Food',
          durationDays: 3,
          instructions: 'Sip steadily throughout the morning and afternoon.'
        },
        {
          id: `med-${Date.now()}-3`,
          name: 'Pantoprazole Gastric Shield',
          dosage: '40mg',
          form: 'Tablet',
          frequency: 'Once Daily (Morning Before Breakfast)',
          scheduleTimes: ['07:30 AM'],
          timingInstructions: 'Before Food',
          durationDays: 5,
          instructions: 'Take 30 minutes before first meal.'
        }
      ],
      nurseNotes: `${severeNurseActions} Patient counseled on hydration and rest. Prescription synchronized to Pharmacy, Patient & Billing.`,
      status: 'active',
      sharedWithPharmacy: true,
      sharedWithPatient: true,
      sharedWithBilling: true,
      isNurseDirectCare: true,
      treatmentType: 'Nurse Direct Fever/General Protocol',
      createdAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const updatedPrescriptions = [feverRx, ...prescriptions]
    persistPrescriptions(updatedPrescriptions)

    // Sync to Billing Staff
    const storedBills = getStoredBillings()
    const newBill = syncPrescriptionToBillingRecord(feverRx)
    saveBillings([newBill, ...storedBills.filter((b) => b.id !== newBill.id)])

    setSeverePatient(null)
    setShowSevereModal(false)
    showNotice(
      `Patient ${targetPt.name} treated directly by Nurse! Prescription & invoice synchronized to Pharmacy, Patient, and Billing Staff.`,
      'success'
    )
    setActiveTab('shared-orders')
  }

  // Share Prescription with Medicine Staff, Patient and Billing Staff
  const handleSharePrescription = (e: React.FormEvent) => {
    e.preventDefault()
    const targetPatient = patients.find((p) => p.id === rxPatientId)
    if (!targetPatient) {
      showNotice('Please select a valid patient.', 'warning')
      return
    }

    if (rxMedications.length === 0) {
      showNotice('Please add at least one medication to the prescription timetable.', 'warning')
      return
    }

    const newRx: PrescriptionRecord = {
      id: `rx-${Date.now()}`,
      patientId: targetPatient.id,
      patientName: targetPatient.name,
      mrn: targetPatient.mrn,
      doctorId: 'demo-doctor',
      doctorName: rxDoctorName,
      nurseId: currentUser.id,
      nurseName: currentUser.name,
      diagnosis: rxDiagnosis.trim() || 'Clinical Consultation Evaluation',
      vitals: {
        bloodPressure: '124/80 mmHg',
        heartRate: '74 bpm',
        spO2: '99%',
        temperature: '98.6 °F'
      },
      medications: rxMedications,
      nurseNotes: rxNurseNotes.trim() || 'Please take medications strictly per scheduled timings with meals.',
      status: 'active',
      sharedWithPharmacy: true,
      sharedWithPatient: true,
      sharedWithBilling: true,
      treatmentType: 'Doctor Consult',
      createdAt: `Today at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    }

    const updated = [newRx, ...prescriptions]
    persistPrescriptions(updated)

    // Sync to Billing Staff
    const storedBills = getStoredBillings()
    const newBill = syncPrescriptionToBillingRecord(newRx)
    saveBillings([newBill, ...storedBills.filter((b) => b.id !== newBill.id)])

    setRxDiagnosis('')
    setRxNurseNotes('')
    showNotice(
      `Prescription & Medication Timetable successfully synchronized with Medicine Staff (Pharmacy), Patient (${targetPatient.name}), and Billing Staff!`,
      'success'
    )
    setActiveTab('shared-orders')
  }

  const displayedSwitchers = allRoleAccounts.length > 0 ? allRoleAccounts : DEMO_ACCOUNTS

  return (
    <div className="flex min-h-screen bg-[var(--care-bg)] text-[var(--care-ink)]">
      {/* ========================================================================= */}
      {/* 1. NURSE WORKSPACE LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="sticky top-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-[var(--care-border)] bg-[var(--care-surface)] shadow-sm">
        {/* Brand & Nurse Badge */}
        <div className="flex h-16 items-center justify-between border-b border-[var(--care-border)] px-5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-[var(--care-primary)] text-white shadow-sm">
              <Activity className="size-5" />
            </span>
            <div>
              <span className="text-base font-bold tracking-tight text-[var(--care-ink)]">CareLink</span>
              <span className="ml-1.5 rounded-md bg-teal-100 px-1.5 py-0.5 text-[10px] font-extrabold text-teal-800">
                NURSE STATION
              </span>
            </div>
          </Link>
        </div>

        {/* Nurse Identity & Shift Status */}
        <div className="border-b border-[var(--care-border)] bg-[var(--care-bg)]/60 p-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-teal-600 text-sm font-bold text-white shadow-sm">
                {currentUser.avatarInitials}
              </span>
              <span className="absolute -bottom-0.5 -right-0.5 size-3.5 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-bold text-[var(--care-ink)]">{currentUser.name}</div>
              <div className="truncate text-[10px] text-[var(--care-muted)]">{currentUser.department}</div>
              <div className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                On Duty · Morning Shift (08:00 - 16:00)
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-6 overflow-y-auto p-3">
          {/* Group 1: Patient Queue & Triage */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--care-muted)]">
              Queue & Doctor Assignment
            </div>

            {/* Queue Flow Controller */}
            <button
              type="button"
              onClick={() => setActiveTab('queue-flow')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'queue-flow'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="size-4" />
                <span>Patient Queue Controller</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  waitingPatients.length > 0
                    ? activeTab === 'queue-flow'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-900 animate-pulse'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {waitingPatients.length} in line
              </span>
            </button>

            {/* Active Doctor Consultations */}
            <button
              type="button"
              onClick={() => setActiveTab('active-consultations')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'active-consultations'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <DoorOpen className="size-4" />
                <span>Active Consultation Rooms</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === 'active-consultations'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {diagnosingPatients.length} active
              </span>
            </button>

            {/* Triage & Vitals Intake */}
            <button
              type="button"
              onClick={() => setActiveTab('triage-vitals')}
              className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'triage-vitals'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <HeartPulse className="size-4" />
              <span>Triage & Vital Signs Intake</span>
            </button>
          </div>

          {/* Group 2: Prescriptions & Medication Timetable */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--care-muted)]">
              Prescription Timetables
            </div>

            {/* Write & Share Rx */}
            <button
              type="button"
              onClick={() => setActiveTab('prescriptions')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'prescriptions'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Pill className="size-4" />
                <span>Write & Share Rx Timetable</span>
              </div>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-bold text-blue-800">
                Rx Hub
              </span>
            </button>

            {/* Shared Orders Log */}
            <button
              type="button"
              onClick={() => setActiveTab('shared-orders')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'shared-orders'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Share2 className="size-4" />
                <span>Dispatched Pharmacy Orders</span>
              </div>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === 'shared-orders' ? 'bg-white/20 text-white' : 'bg-[var(--care-highlight)] text-[var(--care-ink)]'
                }`}
              >
                {prescriptions.length}
              </span>
            </button>
          </div>

          {/* Group 3: Staff Governance & Leave Requests */}
          <div className="space-y-1">
            <div className="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-[var(--care-muted)]">
              Staff Governance & Time-Off
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('leave-requests')}
              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                activeTab === 'leave-requests'
                  ? 'bg-[var(--care-primary)] text-white shadow-sm'
                  : 'text-[var(--care-ink)] hover:bg-[var(--care-highlight)]'
              }`}
            >
              <div className="flex items-center gap-3">
                <Calendar className="size-4" />
                <span>Request Leave / Time-Off</span>
              </div>
              {leaveRequests.filter((l) => (l.staffRole === 'Nurse' || l.staffId === currentUser.id) && l.status === 'pending').length > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    activeTab === 'leave-requests'
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {leaveRequests.filter((l) => (l.staffRole === 'Nurse' || l.staffId === currentUser.id) && l.status === 'pending').length} Pending
                </span>
              )}
            </button>
          </div>

          {/* Nurse Quick Actions Card */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-3.5 text-xs text-teal-950 shadow-sm">
            <div className="flex items-center justify-between font-bold text-teal-900">
              <span className="flex items-center gap-1.5">
                <Zap className="size-3.5 text-teal-700" />
                Nurse Queue Authority
              </span>
            </div>
            <p className="mt-1.5 text-[11px] leading-relaxed text-teal-900/80">
              Nurses control patient intake, assign consultation rooms, and dispatch digital medication schedules to both Pharmacy and Patients.
            </p>
          </div>
        </nav>

        {/* Nurse Footer & Switcher */}
        <div className="border-t border-[var(--care-border)] p-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex w-full items-center justify-between rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 py-2 text-xs font-semibold text-[var(--care-ink)] transition hover:bg-[var(--care-highlight)]"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="size-2 shrink-0 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="truncate">{currentUser.roleLabel}</span>
                </div>
                <ChevronDown className="size-3.5 shrink-0 text-[var(--care-muted)]" />
              </button>

              {roleMenuOpen && (
                <div className="absolute bottom-full left-0 mb-2 w-72 rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-2 shadow-2xl ring-1 ring-black/5 z-50">
                  <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--care-muted)] border-b border-[var(--care-border)] mb-1">
                    Switch Active Account
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {displayedSwitchers.map((acc) => {
                      const isCurrent = acc.id === currentUser.id
                      return (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => handleSwitchRole(acc)}
                          className={`flex w-full items-center justify-between rounded-xl px-2.5 py-2 text-left text-xs transition ${
                            isCurrent
                              ? 'bg-[var(--care-highlight)] font-bold text-[var(--care-ink)]'
                              : 'text-[var(--care-muted)] hover:bg-[var(--care-bg)] hover:text-[var(--care-ink)]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--care-primary)] text-[10px] font-bold text-white">
                              {acc.avatarInitials}
                            </span>
                            <div>
                              <div className="font-bold text-[var(--care-ink)]">{acc.roleLabel}</div>
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

            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-xl border border-[var(--care-border)] p-2 text-red-600 hover:bg-red-50 transition"
              title="Sign out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. MAIN WORKSPACE CONTENT */}
      {/* ========================================================================= */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--care-border)] bg-[var(--care-surface)]/95 px-6 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <h1 className="text-base font-bold text-[var(--care-ink)] sm:text-lg">
              {activeTab === 'queue-flow' && 'Patient Queue Flow & Doctor Assignment'}
              {activeTab === 'prescriptions' && 'Write & Share Prescription Timetable'}
              {activeTab === 'active-consultations' && 'Active Consultation Rooms & Doctor Status'}
              {activeTab === 'triage-vitals' && 'Patient Triage & Vital Signs Recording'}
              {activeTab === 'shared-orders' && 'Dispatched Pharmacy Orders & Patient Records'}
            </h1>
            <span className="hidden items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-800 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Ward 4B Nurse Station Active
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowWalkinModal(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--care-border)] bg-[var(--care-surface)] px-3 py-1.5 text-xs font-bold text-[var(--care-ink)] shadow-xs transition hover:bg-[var(--care-highlight)]"
            >
              <UserPlus className="size-3.5 text-[var(--care-primary)]" />
              <span>Intake Walk-in Patient</span>
            </button>

            <button
              type="button"
              onClick={handleCallNextPatientFlow}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--care-primary)] px-4 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-[var(--care-primary-dark)]"
            >
              <DoorOpen className="size-3.5" />
              <span>Call Next Patient</span>
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Banner Notice Alert */}
          {bannerNotice && (
            <div
              className={`mb-5 flex items-center justify-between gap-3 rounded-2xl border p-4 text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 ${
                bannerNotice.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : bannerNotice.type === 'info'
                  ? 'border-blue-200 bg-blue-50 text-blue-800'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{bannerNotice.message}</span>
              </div>
              <button
                type="button"
                onClick={() => setBannerNotice(null)}
                className="rounded-lg p-1 hover:bg-black/5"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          {/* TAB 1: PATIENT QUEUE FLOW & DOCTOR ASSIGNMENT */}
          {activeTab === 'queue-flow' && (
            <div className="space-y-6">
              {/* Queue Command Center Banner */}
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--care-border)] pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-[var(--care-ink)]">Queue Flow Controller</h2>
                    <p className="text-xs text-[var(--care-muted)]">
                      Manage patient check-in order, assign to attending doctors, and direct patients into consultation rooms.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCallNextPatientFlow}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--care-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--care-primary-dark)]"
                    >
                      <DoorOpen className="size-4" />
                      <span>Call Next in Queue (#{waitingPatients.length > 0 ? waitingPatients[0].mrn.slice(-2) : '00'})</span>
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4">
                    <p className="text-xs font-semibold text-[var(--care-muted)]">Waiting in Triage / Queue</p>
                    <p className="mt-1 text-2xl font-bold text-amber-700">{waitingPatients.length} Patients</p>
                    <p className="text-[11px] text-[var(--care-muted)]">Ready for doctor assignment</p>
                  </div>

                  <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4">
                    <p className="text-xs font-semibold text-[var(--care-muted)]">Currently In Consultation</p>
                    <p className="mt-1 text-2xl font-bold text-emerald-700">{diagnosingPatients.length} Rooms Active</p>
                    <p className="text-[11px] text-[var(--care-muted)]">Consultations in progress</p>
                  </div>

                  <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4">
                    <p className="text-xs font-semibold text-[var(--care-muted)]">Completed Consultations</p>
                    <p className="mt-1 text-2xl font-bold text-[var(--care-ink)]">{completedPatients.length} Seen</p>
                    <p className="text-[11px] text-emerald-600 font-semibold">Prescriptions dispatched</p>
                  </div>
                </div>
              </div>

              {/* Waiting Patients Queue List */}
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-[var(--care-ink)] flex items-center gap-2">
                    <Users className="size-4 text-[var(--care-primary)]" />
                    <span>Patients Waiting for Room Assignment ({waitingPatients.length})</span>
                  </h3>
                  <span className="text-xs text-[var(--care-muted)]">Nurse queue sequence</span>
                </div>

                {waitingPatients.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-[var(--care-border)] bg-[var(--care-bg)] p-10 text-center text-xs text-[var(--care-muted)]">
                    <CheckCircle2 className="mx-auto size-8 text-emerald-500 mb-2" />
                    Queue is clear! All patients have been directed into doctor consultation rooms.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {waitingPatients.map((patient, index) => (
                      <div
                        key={patient.id}
                        className="flex flex-col gap-3 rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs"
                      >
                        <div className="flex items-start gap-3.5">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-900 font-extrabold text-sm border border-amber-200">
                            #{index + 1}
                          </span>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-bold text-sm text-[var(--care-ink)]">{patient.name}</span>
                              <span
                                className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                                  patient.triagePriority === 'STAT'
                                    ? 'bg-red-100 text-red-800'
                                    : patient.triagePriority === 'Urgent'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {patient.triagePriority} Priority
                              </span>
                              <span className="font-mono text-xs text-[var(--care-muted)]">{patient.mrn}</span>
                            </div>
                            <p className="mt-1 text-xs text-[var(--care-ink)]">
                              <strong>Symptoms:</strong> {patient.symptoms}
                            </p>
                            <p className="mt-1 text-[11px] text-[var(--care-muted)]">
                              {patient.age} yrs · {patient.gender} · Registered at {patient.registeredTime} · Target Doctor:{' '}
                              <strong>{patient.assignedDoctor}</strong>
                            </p>
                            {patient.notes && (
                              <p className="mt-1 text-[10px] text-teal-800 font-medium">
                                Note: {patient.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap shrink-0 items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSeverePatient(patient)
                              const is109 = patient.symptoms.toLowerCase().includes('109') || patient.notes?.toLowerCase().includes('109')
                              setSevereFeverTemp(is109 ? '109.0' : '104.2')
                              setSevereDiagnosis(
                                patient.symptoms.toLowerCase().includes('fever')
                                  ? 'High-Grade Pyrexia (109.0°F Fever) & Severe Dehydration'
                                  : `Acute Urgent ${patient.symptoms} (Nurse Triage Protocol)`
                              )
                              setShowSevereModal(true)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-900 shadow-xs hover:bg-rose-100 transition"
                          >
                            <Flame className="size-3.5 text-rose-600 animate-pulse" />
                            <span>⚡ Severe / Fever Care</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setTriagePatient(patient)
                            }}
                            className="inline-flex items-center gap-1 rounded-xl border border-[var(--care-border)] bg-[var(--care-surface)] px-3 py-1.5 text-xs font-semibold text-[var(--care-ink)] hover:bg-[var(--care-highlight)]"
                          >
                            <HeartPulse className="size-3.5 text-red-500" />
                            <span>Vitals</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setAssigningPatient(patient)
                            }}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--care-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--care-primary-dark)]"
                          >
                            <DoorOpen className="size-3.5" />
                            <span>Assign to Doctor</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: WRITE & SHARE PRESCRIPTION TIMETABLE (FEATURE REQUIREMENT) */}
          {activeTab === 'prescriptions' && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              {/* Prescription Builder */}
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm space-y-5">
                <div className="border-b border-[var(--care-border)] pb-4">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-xl bg-teal-100 text-teal-800 font-bold">
                      <Pill className="size-4" />
                    </span>
                    <h2 className="text-base font-bold text-[var(--care-ink)] sm:text-lg">
                      Write & Share Medication Prescription
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-[var(--care-muted)]">
                    Create the exact timing schedule for all medicines prescribed during consultation and dispatch directly to Medicine Staff and Patient.
                  </p>
                </div>

                <form onSubmit={handleSharePrescription} className="space-y-4">
                  {/* Select Patient & Consulting Doctor */}
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                      Select Patient
                      <select
                        value={rxPatientId}
                        onChange={(e) => setRxPatientId(e.target.value)}
                        className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-semibold"
                        required
                      >
                        {patients.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.mrn}) · {p.status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                      Consulting Physician
                      <select
                        value={rxDoctorName}
                        onChange={(e) => setRxDoctorName(e.target.value)}
                        className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-semibold"
                      >
                        {availableDoctors.map((doc) => (
                          <option key={doc.id} value={doc.name}>
                            {doc.name} ({doc.specialization || 'Cardiology'})
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  {/* Diagnosis */}
                  <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                    Clinical Diagnosis & Findings
                    <input
                      type="text"
                      value={rxDiagnosis}
                      onChange={(e) => setRxDiagnosis(e.target.value)}
                      placeholder="e.g. Supraventricular Tachycardia & Hypertension Stage I"
                      className="h-11 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-medium"
                      required
                    />
                  </label>

                  {/* Medication Items List inside this Prescription */}
                  <div className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-bg)] p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--care-border)] pb-2">
                      <span className="text-xs font-bold text-[var(--care-ink)] flex items-center gap-1.5">
                        <Clock className="size-3.5 text-[var(--care-primary)]" />
                        Medication Timetable Schedule ({rxMedications.length} Medicines)
                      </span>
                    </div>

                    {rxMedications.length === 0 ? (
                      <p className="text-xs text-[var(--care-muted)] italic">No medications added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {rxMedications.map((med, idx) => (
                          <div
                            key={med.id}
                            className="flex items-start justify-between rounded-xl border border-[var(--care-border)] bg-[var(--care-surface)] p-3 text-xs shadow-xs"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[var(--care-ink)]">
                                  {idx + 1}. {med.name}
                                </span>
                                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                                  {med.dosage} ({med.form})
                                </span>
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                                  {med.timingInstructions}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 text-[11px] text-[var(--care-muted)]">
                                <span>
                                  <strong>Exact Timings:</strong> {med.scheduleTimes.join(', ')}
                                </span>
                                <span>• Duration: {med.durationDays} days</span>
                              </div>
                              {med.instructions && (
                                <p className="text-[11px] text-teal-800 font-medium">
                                  Instructions: {med.instructions}
                                </p>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveMedicationFromRx(med.id)}
                              className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg"
                              title="Remove medication"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add New Medicine Widget */}
                  <div className="rounded-2xl border border-teal-200 bg-teal-50/50 p-4 space-y-3">
                    <span className="text-xs font-bold text-teal-950 flex items-center gap-1.5">
                      <PlusCircle className="size-4 text-teal-700" />
                      Add Medicine to Timetable
                    </span>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                        Select Medicine
                        <select
                          value={newMedLibSelected}
                          onChange={(e) => {
                            const val = e.target.value
                            setNewMedLibSelected(val)
                            const found = AVAILABLE_MEDICINES_LIBRARY.find((m) => m.name === val)
                            if (found) {
                              setNewMedDosage(found.defaultDosage)
                              setNewMedForm(found.form)
                              setNewMedTiming(found.timing)
                              setNewMedFrequency(found.frequency)
                              setNewMedTimes(found.timeSlots.join(', '))
                            }
                          }}
                          className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs font-semibold text-teal-950"
                        >
                          {AVAILABLE_MEDICINES_LIBRARY.map((m) => (
                            <option key={m.name} value={m.name}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                        Dosage
                        <input
                          type="text"
                          value={newMedDosage}
                          onChange={(e) => setNewMedDosage(e.target.value)}
                          className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs"
                          placeholder="e.g. 25mg"
                        />
                      </label>

                      <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                        Meal Timing
                        <select
                          value={newMedTiming}
                          onChange={(e) => setNewMedTiming(e.target.value as any)}
                          className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs font-semibold text-teal-950"
                        >
                          <option value="After Food">After Food</option>
                          <option value="Before Food">Before Food</option>
                          <option value="With Food">With Food</option>
                          <option value="At Bedtime">At Bedtime</option>
                          <option value="As Needed (SOS)">As Needed (SOS)</option>
                        </select>
                      </label>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                        Exact Timetable Hours (Comma-separated)
                        <input
                          type="text"
                          value={newMedTimes}
                          onChange={(e) => setNewMedTimes(e.target.value)}
                          placeholder="e.g. 08:30 AM, 08:30 PM"
                          className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs"
                        />
                      </label>

                      <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                        Duration (Days)
                        <input
                          type="number"
                          min={1}
                          max={90}
                          value={newMedDuration}
                          onChange={(e) => setNewMedDuration(e.target.value)}
                          className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs"
                        />
                      </label>
                    </div>

                    <label className="grid gap-1 text-[11px] font-bold text-teal-950">
                      Specific Instructions
                      <input
                        type="text"
                        value={newMedCustomInstructions}
                        onChange={(e) => setNewMedCustomInstructions(e.target.value)}
                        placeholder="e.g. Drink full glass of water, avoid grapefruit juice"
                        className="h-10 rounded-xl border border-teal-300 bg-white px-2.5 text-xs"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={handleAddMedicationToRx}
                      className="w-full rounded-xl bg-teal-700 py-2 text-xs font-bold text-white shadow-xs hover:bg-teal-800 transition"
                    >
                      + Add This Medicine to Schedule
                    </button>
                  </div>

                  {/* Nurse Notes */}
                  <label className="grid gap-1.5 text-xs font-bold text-[var(--care-ink)]">
                    Nurse Consultation & Follow-up Notes
                    <textarea
                      value={rxNurseNotes}
                      onChange={(e) => setRxNurseNotes(e.target.value)}
                      rows={2}
                      placeholder="e.g. Advised patient to check pulse before morning dose and log blood pressure."
                      className="rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 py-2 text-xs"
                    />
                  </label>

                  {/* Dispatch Button */}
                  <div className="flex justify-end pt-3 border-t border-[var(--care-border)]">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-2xl bg-[var(--care-primary)] px-6 py-3 text-xs font-bold text-white shadow-md hover:bg-[var(--care-primary-dark)] transition"
                    >
                      <Share2 className="size-4" />
                      <span>Share with Medicine Staff & Patient</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Real-time Patient Timetable Preview */}
              <div className="space-y-4">
                <div className="rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/80 to-indigo-50/60 p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-blue-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="size-4 text-blue-700" />
                      <h3 className="font-bold text-sm text-blue-950">Patient Live Medication Timetable</h3>
                    </div>
                    <span className="rounded-md bg-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-900">
                      Live Preview
                    </span>
                  </div>

                  <div className="space-y-3 text-xs text-blue-950">
                    <div className="rounded-xl bg-white p-3 border border-blue-200">
                      <div className="font-bold text-[var(--care-ink)]">Target Patient:</div>
                      <div className="text-[11px] text-[var(--care-muted)]">
                        {patients.find((p) => p.id === rxPatientId)?.name || 'Selected Patient'} (
                        {patients.find((p) => p.id === rxPatientId)?.mrn || 'MRN-84920'})
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="font-bold text-xs text-blue-900">Daily Timing Schedule:</div>
                      {rxMedications.map((m) => (
                        <div
                          key={m.id}
                          className="rounded-xl border border-blue-200 bg-white p-3 shadow-xs space-y-1"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[var(--care-ink)]">{m.name}</span>
                            <span className="rounded bg-teal-100 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                              {m.dosage}
                            </span>
                          </div>
                          <div className="text-[11px] text-blue-800">
                            <strong>Take at:</strong> {m.scheduleTimes.join(', ')} ({m.timingInstructions})
                          </div>
                          {m.instructions && (
                            <div className="text-[10px] text-[var(--care-muted)] italic">{m.instructions}</div>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-[11px] text-emerald-900">
                      <strong>Automatic Delivery Channels:</strong>
                      <ul className="list-disc pl-4 mt-1 space-y-0.5">
                        <li>Medicine Staff: Instant electronic prescription order sent for dispensing.</li>
                        <li>Patient Portal: Real-time schedule saved in patient's CareLink portal.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ACTIVE DOCTOR CONSULTATION ROOMS */}
          {activeTab === 'active-consultations' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
                <h2 className="text-base font-bold text-[var(--care-ink)]">Active Consultation Rooms</h2>
                <p className="text-xs text-[var(--care-muted)]">
                  Real-time status of patients currently inside doctors' consultation rooms.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {diagnosingPatients.length === 0 ? (
                  <div className="col-span-2 rounded-2xl border border-dashed border-[var(--care-border)] bg-[var(--care-surface)] p-10 text-center text-xs text-[var(--care-muted)]">
                    All consultation rooms are currently vacant. Use "Patient Queue Controller" to call the next patient.
                  </div>
                ) : (
                  diagnosingPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="rounded-3xl border border-emerald-300 bg-[var(--care-surface)] p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-[var(--care-border)] pb-3">
                        <div className="flex items-center gap-2">
                          <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-800 font-bold">
                            <DoorOpen className="size-4" />
                          </span>
                          <div>
                            <div className="font-bold text-sm text-[var(--care-ink)]">{patient.name}</div>
                            <div className="text-[10px] font-mono text-[var(--care-muted)]">{patient.mrn}</div>
                          </div>
                        </div>
                        <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 animate-pulse">
                          IN CONSULTATION
                        </span>
                      </div>

                      <div className="text-xs text-[var(--care-muted)] space-y-1">
                        <div>
                          <strong>Assigned Doctor:</strong> {patient.assignedDoctor}
                        </div>
                        <div>
                          <strong>Symptoms:</strong> {patient.symptoms}
                        </div>
                        {patient.notes && (
                          <div className="rounded-lg bg-[var(--care-bg)] p-2 text-[11px] text-[var(--care-ink)]">
                            {patient.notes}
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t border-[var(--care-border)] flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => {
                            setRxPatientId(patient.id)
                            setRxDoctorName(patient.assignedDoctor)
                            setActiveTab('prescriptions')
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[var(--care-primary)] hover:underline"
                        >
                          <Pill className="size-3.5" />
                          <span>Write Prescription Schedule</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCompletePatient(patient)}
                          className="rounded-xl bg-emerald-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-800"
                        >
                          Conclude Visit
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: TRIAGE & VITALS INTAKE */}
          {activeTab === 'triage-vitals' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm">
                <h2 className="text-base font-bold text-[var(--care-ink)]">Patient Triage & Vital Signs Intake</h2>
                <p className="text-xs text-[var(--care-muted)]">
                  Measure blood pressure, heart rate, SpO2, and categorize triage priority.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {patients.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-2xl border border-[var(--care-border)] bg-[var(--care-surface)] p-4 shadow-sm space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-sm text-[var(--care-ink)]">{p.name}</div>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          p.triagePriority === 'STAT'
                            ? 'bg-red-100 text-red-800'
                            : p.triagePriority === 'Urgent'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {p.triagePriority} Triage
                      </span>
                    </div>

                    <div className="text-xs text-[var(--care-muted)]">
                      <div>
                        {p.age} yrs · {p.gender} · {p.mrn}
                      </div>
                      <div>
                        <strong>Chief Complaint:</strong> {p.symptoms}
                      </div>
                      {p.notes && (
                        <div className="mt-1 text-[11px] text-teal-800 font-medium bg-teal-50 p-2 rounded-lg">
                          {p.notes}
                        </div>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[var(--care-border)] flex justify-end">
                      <button
                        type="button"
                        onClick={() => setTriagePatient(p)}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--care-highlight)] px-3 py-1.5 text-xs font-bold text-[var(--care-primary-dark)] hover:bg-[var(--care-primary)] hover:text-white transition"
                      >
                        <HeartPulse className="size-3.5" />
                        <span>Update Vitals</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: DISPATCHED PHARMACY ORDERS LOG */}
          {activeTab === 'shared-orders' && (
            <div className="space-y-6">
              <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-base font-bold text-[var(--care-ink)]">Dispatched Prescriptions Log</h2>
                  <p className="text-xs text-[var(--care-muted)]">
                    Electronic prescriptions shared with Medicine Staff (Pharmacy) and Patient Portal.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('prescriptions')}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--care-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-[var(--care-primary-dark)]"
                >
                  <Plus className="size-3.5" />
                  <span>Write New Prescription</span>
                </button>
              </div>

              <div className="space-y-4">
                {prescriptions.map((rx) => (
                  <div
                    key={rx.id}
                    className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-5 shadow-sm space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--care-border)] pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[var(--care-ink)]">{rx.patientName}</span>
                          <span className="font-mono text-xs text-[var(--care-muted)]">{rx.mrn}</span>
                        </div>
                        <p className="text-xs text-[var(--care-muted)]">
                          Prescribed by <strong>{rx.doctorName}</strong> · Recorded by <strong>{rx.nurseName}</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          ✓ Sent to Medicine Staff
                        </span>
                        <span className="rounded-md bg-blue-100 border border-blue-200 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          ✓ Sent to Patient Portal
                        </span>
                      </div>
                    </div>

                    <div className="text-xs">
                      <strong>Diagnosis:</strong> <span className="text-blue-900 font-semibold">{rx.diagnosis}</span>
                    </div>

                    {/* Medications Table */}
                    <div className="overflow-x-auto rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)]">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-[var(--care-border)] text-[var(--care-muted)] font-bold">
                            <th className="p-2.5">Medicine Name</th>
                            <th className="p-2.5">Dosage</th>
                            <th className="p-2.5">Schedule Timing</th>
                            <th className="p-2.5">Meal Instruction</th>
                            <th className="p-2.5">Duration</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--care-border)]">
                          {rx.medications.map((m) => (
                            <tr key={m.id}>
                              <td className="p-2.5 font-bold text-[var(--care-ink)]">{m.name}</td>
                              <td className="p-2.5">{m.dosage}</td>
                              <td className="p-2.5 font-semibold text-blue-800">{m.scheduleTimes.join(', ')}</td>
                              <td className="p-2.5">
                                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                                  {m.timingInstructions}
                                </span>
                              </td>
                              <td className="p-2.5">{m.durationDays} Days</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {rx.nurseNotes && (
                      <div className="text-xs text-[var(--care-muted)] bg-[var(--care-bg)] p-2.5 rounded-xl">
                        <strong>Nurse Advice:</strong> {rx.nurseNotes}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LEAVE REQUESTS & TIME-OFF PORTAL */}
          {activeTab === 'leave-requests' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="rounded-3xl border border-teal-200 bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 p-6 text-white shadow-lg">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Calendar className="size-5 text-teal-300" />
                  Nurse Leave Application & Shift Governance
                </h2>
                <p className="text-xs text-teal-200 mt-1 max-w-xl">
                  Submit time-off and sick leave requests to the Hospital Administration. Admin approvals and shift replacement coverage sync in real-time.
                </p>
              </div>

              <div className="grid gap-6 lg:grid-cols-3">
                {/* Leave Application Form */}
                <div className="lg:col-span-1 rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-xs">
                  <h3 className="text-sm font-bold text-[var(--care-ink)] mb-1 flex items-center gap-2">
                    <PlusCircle className="size-4 text-teal-600" />
                    New Leave Request
                  </h3>
                  <p className="text-xs text-[var(--care-muted)] mb-4">Submit days and details for admin authorization.</p>

                  <form onSubmit={handleSubmitLeaveRequest} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">Leave Type</label>
                      <select
                        value={leaveType}
                        onChange={(e) => setLeaveType(e.target.value as LeaveRequest['leaveType'])}
                        className="w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                      >
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Annual Leave">Annual Leave (Vacation)</option>
                        <option value="Emergency Leave">Emergency Leave</option>
                        <option value="Medical Conference">Medical Conference / Training</option>
                        <option value="Maternity / Paternity">Maternity / Paternity</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="flex h-5 items-center font-bold text-slate-800 mb-1.5 truncate">
                          Start Date <span className="ml-1 text-[10px] font-normal text-teal-700">(From Tomorrow)</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            ref={leaveStartRef}
                            type="date"
                            min={getTomorrowIsoString()}
                            value={leaveStartDate}
                            onChange={(e) => handleStartDateChange(e.target.value)}
                            className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white pl-3 pr-9 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 cursor-pointer"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                leaveStartRef.current?.showPicker()
                              } catch {
                                leaveStartRef.current?.focus()
                              }
                            }}
                            className="absolute right-2 flex size-7 items-center justify-center rounded-lg text-teal-700 hover:bg-teal-50 hover:text-teal-900 transition"
                            title="Click calendar to pick start date"
                          >
                            <Calendar className="size-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="flex h-5 items-center font-bold text-slate-800 mb-1.5 truncate">
                          End Date <span className="ml-1 text-[10px] font-normal text-teal-700">(To Date)</span>
                        </label>
                        <div className="relative flex items-center">
                          <input
                            ref={leaveEndRef}
                            type="date"
                            min={leaveStartDate || getTomorrowIsoString()}
                            value={leaveEndDate}
                            onChange={(e) => handleEndDateChange(e.target.value)}
                            className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white pl-3 pr-9 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 cursor-pointer"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                leaveEndRef.current?.showPicker()
                              } catch {
                                leaveEndRef.current?.focus()
                              }
                            }}
                            className="absolute right-2 flex size-7 items-center justify-center rounded-lg text-teal-700 hover:bg-teal-50 hover:text-teal-900 transition"
                            title="Click calendar to pick end date"
                          >
                            <Calendar className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="flex h-5 items-center font-bold text-slate-800 mb-1.5 truncate">
                          Total Days (Calculated)
                        </label>
                        <input
                          type="number"
                          min={1}
                          max={60}
                          value={leaveDaysCount}
                          onChange={(e) => setLeaveDaysCount(Math.max(1, Number(e.target.value)))}
                          className="h-11 w-full rounded-xl border-2 border-slate-300 bg-slate-50 px-3 text-xs font-black text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                          required
                        />
                      </div>
                      <div>
                        <label className="flex h-5 items-center font-bold text-slate-800 mb-1.5 truncate">
                          Shift Slot
                        </label>
                        <select
                          value={leaveShiftSlot}
                          onChange={(e) => setLeaveShiftSlot(e.target.value as LeaveRequest['shiftSlot'])}
                          className="h-11 w-full rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                        >
                          <option value="Morning (08:00 - 16:00)">Morning (08:00 - 16:00)</option>
                          <option value="Evening (16:00 - 00:00)">Evening (16:00 - 00:00)</option>
                          <option value="Night (00:00 - 08:00)">Night (00:00 - 08:00)</option>
                          <option value="Full Day (All Shifts)">Full Day (All Shifts)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1.5">Reason for Leave *</label>
                      <textarea
                        value={leaveReason}
                        onChange={(e) => setLeaveReason(e.target.value)}
                        placeholder="Provide details about why you need time off..."
                        rows={3}
                        className="w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-xs font-medium text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-600 hover:bg-teal-700 py-3.5 text-xs font-black text-white shadow-md transition active:scale-[0.98]"
                    >
                      <Send className="size-4" />
                      <span>Submit Request to Admin</span>
                    </button>
                  </form>
                </div>

                {/* My Leave Applications Log */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-xs">
                    <div className="flex items-center justify-between border-b border-[var(--care-border)] pb-3 mb-4">
                      <div>
                        <h3 className="text-sm font-bold text-[var(--care-ink)]">My Leave Applications & Review Status</h3>
                        <p className="text-xs text-[var(--care-muted)]">Live synchronization with Admin governance decisions</p>
                      </div>
                      <span className="rounded-full bg-[var(--care-highlight)] px-3 py-1 text-xs font-mono font-bold text-[var(--care-primary-dark)]">
                        {leaveRequests.filter((l) => l.staffRole === 'Nurse' || l.staffId === currentUser.id).length} Total
                      </span>
                    </div>

                    {leaveRequests.filter((l) => l.staffRole === 'Nurse' || l.staffId === currentUser.id).length === 0 ? (
                      <div className="text-center py-8 text-xs text-[var(--care-muted)]">
                        <Calendar className="size-8 text-teal-300 mx-auto mb-2" />
                        No leave applications filed yet. Use the form on the left to submit a time-off request.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {leaveRequests
                          .filter((l) => l.staffRole === 'Nurse' || l.staffId === currentUser.id)
                          .map((req) => (
                            <div
                              key={req.id}
                              className={`rounded-2xl border p-4 transition ${
                                req.status === 'approved'
                                  ? 'border-emerald-200 bg-emerald-50/40'
                                  : req.status === 'rejected'
                                  ? 'border-red-200 bg-red-50/40'
                                  : 'border-amber-200 bg-amber-50/30'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[var(--care-ink)] text-sm">{req.leaveType}</span>
                                    <span className="text-[11px] text-[var(--care-muted)] font-mono">
                                      {req.startDate} → {req.endDate}
                                    </span>
                                  </div>
                                  <p className="text-xs text-[var(--care-ink)] mt-1">
                                    <strong>Reason:</strong> {req.reason}
                                  </p>
                                  <p className="text-[10px] text-[var(--care-muted)] mt-0.5">
                                    Shift: {req.shiftSlot} · Submitted: {req.submittedAt}
                                  </p>
                                </div>

                                <div>
                                  {req.status === 'pending' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-900 border border-amber-300 animate-pulse">
                                      <Timer className="size-3" />
                                      Pending Admin Review
                                    </span>
                                  )}
                                  {req.status === 'approved' && (
                                    <div className="text-right">
                                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-extrabold text-emerald-900 border border-emerald-300">
                                        <Check className="size-3" />
                                        Approved by Admin
                                      </span>
                                      {req.replacementStaffName && (
                                        <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                                          Covered by: {req.replacementStaffName}
                                        </p>
                                      )}
                                    </div>
                                  )}
                                  {req.status === 'rejected' && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-extrabold text-red-900 border border-red-300">
                                      <X className="size-3" />
                                      Rejected by Admin
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* 3. ASSIGN DOCTOR & ROOM MODAL */}
      {/* ========================================================================= */}
      {assigningPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--care-border)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--care-ink)]">Assign Patient to Doctor & Room</h3>
                <p className="text-xs text-[var(--care-muted)]">
                  Route {assigningPatient.name} ({assigningPatient.mrn}) into consultation.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAssigningPatient(null)}
                className="rounded-xl p-1.5 text-[var(--care-muted)] hover:bg-[var(--care-highlight)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="mt-4 space-y-4">
              <label className="grid gap-1.5 text-xs font-bold text-slate-800">
                Select Attending Physician
                <select
                  value={selectedDoctorName}
                  onChange={(e) => setSelectedDoctorName(e.target.value)}
                  className="h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name} ({doc.specialization || 'Cardiology'})
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-800">
                Select Clinic / OPD Room
                <select
                  value={selectedRoomNumber}
                  onChange={(e) => setSelectedRoomNumber(e.target.value)}
                  className="h-11 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="OPD Room 204 (Cardiology)">OPD Room 204 (Cardiology)</option>
                  <option value="OPD Room 206 (Echo & Vitals)">OPD Room 206 (Echo & Vitals)</option>
                  <option value="Inpatient Ward 4B - Bed 02">Inpatient Ward 4B - Bed 02</option>
                  <option value="Emergency Bay 1">Emergency Bay 1</option>
                </select>
              </label>

              <label className="grid gap-1.5 text-xs font-bold text-slate-800">
                Triage Handoff Note for Doctor
                <textarea
                  value={triageNote}
                  onChange={(e) => setTriageNote(e.target.value)}
                  rows={2}
                  placeholder="e.g. Vitals stable. Chief complaint of palpitations and mild dyspnea."
                  className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                />
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--care-border)]">
                <button
                  type="button"
                  onClick={() => setAssigningPatient(null)}
                  className="rounded-xl border border-[var(--care-border)] px-4 py-2 text-xs font-semibold text-[var(--care-ink)] hover:bg-[var(--care-highlight)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
                >
                  <DoorOpen className="size-4" />
                  <span>Call & Send to Room</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. UPDATE TRIAGE VITALS MODAL */}
      {/* ========================================================================= */}
      {triagePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--care-border)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--care-ink)]">Triage & Vital Signs Intake</h3>
                <p className="text-xs text-[var(--care-muted)]">
                  Record bedside measurements for {triagePatient.name} ({triagePatient.mrn}).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTriagePatient(null)}
                className="rounded-xl p-1.5 text-[var(--care-muted)] hover:bg-[var(--care-highlight)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTriageVitals} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  Blood Pressure (mmHg)
                  <input
                    type="text"
                    value={bpInput}
                    onChange={(e) => setBpInput(e.target.value)}
                    placeholder="120/80"
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                    required
                  />
                </label>

                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  Heart Rate (BPM)
                  <input
                    type="text"
                    value={hrInput}
                    onChange={(e) => setHrInput(e.target.value)}
                    placeholder="76"
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                    required
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  SpO2 (%)
                  <input
                    type="text"
                    value={spo2Input}
                    onChange={(e) => setSpo2Input(e.target.value)}
                    placeholder="99"
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                    required
                  />
                </label>

                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  Temperature (°F)
                  <input
                    type="text"
                    value={tempInput}
                    onChange={(e) => setTempInput(e.target.value)}
                    placeholder="98.6"
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                    required
                  />
                </label>
              </div>

              <label className="grid gap-1 text-xs font-bold text-slate-800">
                Triage Priority Classification
                <select
                  value={priorityInput}
                  onChange={(e) => setPriorityInput(e.target.value as any)}
                  className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="Normal">Normal (Routine Consultation)</option>
                  <option value="Urgent">Urgent (Chest Discomfort / Elevated Vitals)</option>
                  <option value="STAT">STAT (Critical / Immediate Care)</option>
                </select>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--care-border)]">
                <button
                  type="button"
                  onClick={() => setTriagePatient(null)}
                  className="rounded-xl border border-[var(--care-border)] px-4 py-2 text-xs font-semibold text-[var(--care-ink)] hover:bg-[var(--care-highlight)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. WALK-IN PATIENT REGISTRATION MODAL */}
      {/* ========================================================================= */}
      {showWalkinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl border border-[var(--care-border)] bg-[var(--care-surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 border-b border-[var(--care-border)] pb-4">
              <div>
                <h3 className="text-base font-bold text-[var(--care-ink)]">Intake Walk-in Patient</h3>
                <p className="text-xs text-[var(--care-muted)]">Check patient directly into nurse queue station.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowWalkinModal(false)}
                className="rounded-xl p-1.5 text-[var(--care-muted)] hover:bg-[var(--care-highlight)]"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterWalkin} className="mt-4 space-y-3">
              <label className="grid gap-1 text-xs font-bold text-slate-800">
                Patient Full Name
                <input
                  type="text"
                  value={walkinName}
                  onChange={(e) => setWalkinName(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                  required
                />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  Age
                  <input
                    type="number"
                    min={1}
                    max={120}
                    value={walkinAge}
                    onChange={(e) => setWalkinAge(e.target.value)}
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </label>

                <label className="grid gap-1 text-xs font-bold text-slate-800">
                  Gender
                  <select
                    value={walkinGender}
                    onChange={(e) => setWalkinGender(e.target.value as any)}
                    className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </label>
              </div>

              <label className="grid gap-1 text-xs font-bold text-slate-800">
                Assigned Doctor
                <select
                  value={walkinDoctor}
                  onChange={(e) => setWalkinDoctor(e.target.value)}
                  className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  {availableDoctors.map((doc) => (
                    <option key={doc.id} value={doc.name}>
                      {doc.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold text-slate-800">
                Triage Priority
                <select
                  value={walkinPriority}
                  onChange={(e) => setWalkinPriority(e.target.value as any)}
                  className="h-10 rounded-xl border-2 border-slate-300 bg-white px-3 text-xs font-bold text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100"
                >
                  <option value="Normal">Normal (Routine)</option>
                  <option value="Urgent">Urgent (Chest Discomfort / Fever)</option>
                  <option value="STAT">STAT (Critical / Acute Emergency)</option>
                </select>
              </label>

              <label className="grid gap-1 text-xs font-bold text-slate-800">
                Chief Complaint / Symptoms
                <textarea
                  value={walkinSymptoms}
                  onChange={(e) => setWalkinSymptoms(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mild palpitations, post-meal dizziness"
                  className="rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-900 shadow-xs outline-none transition focus:border-teal-600 focus:ring-4 focus:ring-teal-100 placeholder:text-slate-400"
                  required
                />
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-[var(--care-border)]">
                <button
                  type="button"
                  onClick={() => setShowWalkinModal(false)}
                  className="rounded-xl border border-[var(--care-border)] px-4 py-2 text-xs font-semibold text-[var(--care-ink)] hover:bg-[var(--care-highlight)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-teal-700 transition"
                >
                  Add to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SEVERE & URGENT TRIAGE / FEVER 109°F PROTOCOL MODAL */}
      {/* ========================================================================= */}
      {showSevereModal && severePatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg rounded-3xl border border-rose-300 bg-[var(--care-surface)] p-6 shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[var(--care-border)] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-10 items-center justify-center rounded-2xl bg-rose-600 text-white font-bold shadow-sm animate-pulse">
                  <Flame className="size-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-rose-950 sm:text-lg">
                    Emergency Triage & Severe Care Protocol
                  </h3>
                  <p className="text-xs text-rose-800">
                    Patient: <strong>{severePatient.name}</strong> ({severePatient.mrn})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSevereModal(false)
                  setSeverePatient(null)
                }}
                className="rounded-xl p-1.5 text-[var(--care-muted)] hover:bg-[var(--care-highlight)]"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Critical Condition Banner */}
            <div className="mt-4 rounded-2xl border border-rose-300 bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="size-4 text-rose-600" />
                  HIGH SEVERITY ALERT (Fever: {severeFeverTemp}°F)
                </span>
                <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[10px] font-extrabold text-white">
                  STAT PRIORITY
                </span>
              </div>
              <p className="text-rose-900 leading-relaxed">
                The doctor queue currently has patients waiting. To prevent delays in critical cases, choose between <strong>Fast-Tracking to #1 in Doctor Queue</strong> or <strong>Nurse Direct Care & Immediate Fever Treatment</strong> (No doctor wait required).
              </p>
            </div>

            {/* Treatment Protocol Inputs */}
            <div className="mt-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <label className="grid gap-1 font-bold text-[var(--care-ink)]">
                  Recorded Temperature (°F)
                  <input
                    type="text"
                    value={severeFeverTemp}
                    onChange={(e) => setSevereFeverTemp(e.target.value)}
                    className="h-10 rounded-xl border border-rose-200 bg-[var(--care-bg)] px-3 text-xs font-bold text-rose-900"
                  />
                </label>
                <label className="grid gap-1 font-bold text-[var(--care-ink)]">
                  Target Doctor
                  <input
                    type="text"
                    disabled
                    value={severePatient.assignedDoctor || 'Dr. Alexander Wright'}
                    className="h-10 rounded-xl border border-[var(--care-border)] bg-slate-100 px-3 text-xs font-semibold text-slate-700"
                  />
                </label>
              </div>

              <label className="grid gap-1 font-bold text-[var(--care-ink)]">
                Clinical Diagnosis / Impression
                <input
                  type="text"
                  value={severeDiagnosis}
                  onChange={(e) => setSevereDiagnosis(e.target.value)}
                  className="h-10 rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 text-xs font-medium"
                />
              </label>

              <label className="grid gap-1 font-bold text-[var(--care-ink)]">
                Nurse Emergency Interventions Done
                <textarea
                  value={severeNurseActions}
                  onChange={(e) => setSevereNurseActions(e.target.value)}
                  rows={2}
                  className="rounded-xl border border-[var(--care-border)] bg-[var(--care-bg)] px-3 py-2 text-xs"
                />
              </label>
            </div>

            {/* Two Action Paths */}
            <div className="mt-5 space-y-2.5 pt-4 border-t border-[var(--care-border)]">
              {/* Option B: Nurse Direct Care (Recommended for fever/general) */}
              <button
                type="button"
                onClick={() => handleNurseDirectFeverProtocol(severePatient)}
                className="group flex w-full items-center justify-between rounded-2xl border-2 border-emerald-600 bg-emerald-50 p-3.5 text-left transition hover:bg-emerald-100"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-extrabold text-white">
                      RECOMMENDED
                    </span>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Nurse Direct Care & Immediate Treatment (Fever Protocol)
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-emerald-800 leading-snug">
                    Handle immediately in Nurse Station. Administers cooling & antipyretics, writes Rx timetable, concludes visit, and syncs to <strong>Patient, Pharmacy & Billing</strong>.
                  </p>
                </div>
                <ArrowRight className="size-5 text-emerald-700 transition group-hover:translate-x-1 shrink-0 ml-2" />
              </button>

              {/* Option A: Fast-Track to #1 in Doctor Queue */}
              <button
                type="button"
                onClick={() => handleBumpToTopPriority(severePatient)}
                className="group flex w-full items-center justify-between rounded-2xl border border-rose-300 bg-white p-3.5 text-left transition hover:bg-rose-50"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose-100 px-2 py-0.5 text-[10px] font-extrabold text-rose-800 border border-rose-200">
                      DOCTOR QUEUE BUMP
                    </span>
                    <h4 className="text-xs font-bold text-rose-950">
                      Fast-Track to #1 Top Priority in Doctor Queue
                    </h4>
                  </div>
                  <p className="mt-1 text-[11px] text-rose-800 leading-snug">
                    Moves patient to the front of the queue (#1 in line) with STAT triage priority for the attending doctor to see next.
                  </p>
                </div>
                <ArrowRight className="size-5 text-rose-700 transition group-hover:translate-x-1 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
