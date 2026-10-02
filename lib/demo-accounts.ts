export interface DemoAccount {
  id: string
  roleSlug: string
  roleLabel: string
  name: string
  title: string
  department: string
  specialization?: string
  email: string
  password: string
  badge: string
  badgeColor: string
  avatarInitials: string
  summary: string
  permissions: string[]
  stats: { label: string; value: string; change?: string; tone?: 'positive' | 'warning' | 'neutral' }[]
  recentActivities: { title: string; subtitle: string; time: string; status: string; statusColor: string }[]
  quickActions: { label: string; description: string }[]
  createdAt?: string
  isCustom?: boolean
}

export interface PatientRecord {
  id: string
  mrn: string
  name: string
  age: number
  gender: 'Female' | 'Male' | 'Other'
  registeredTime: string
  status: 'registered' | 'waiting' | 'diagnosing' | 'completed'
  department: string
  assignedDoctor: string
  symptoms: string
  triagePriority: 'Normal' | 'Urgent' | 'STAT'
  completedTime?: string
  notes?: string
}

export interface LeaveRequest {
  id: string
  staffId: string
  staffName: string
  staffRole: string
  department: string
  leaveType: 'Sick Leave' | 'Annual Leave' | 'Emergency Leave' | 'Medical Conference' | 'Maternity / Paternity'
  startDate: string
  endDate: string
  shiftSlot: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)' | 'Full Day (All Shifts)'
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  replacementStaffId?: string
  replacementStaffName?: string
  adminNotes?: string
  submittedAt: string
}

export interface StaffShiftAssignment {
  id: string
  staffId: string
  staffName: string
  roleLabel: string
  department: string
  shiftSlot: 'Morning (08:00 - 16:00)' | 'Evening (16:00 - 00:00)' | 'Night (00:00 - 08:00)'
  dutyStatus: 'On Duty' | 'Absent' | 'On Leave' | 'Standby'
  replacementStaffId?: string
  replacementStaffName?: string
  coverageNotes?: string
}

export interface BillingRecord {
  id: string
  invoiceNumber: string
  patientName: string
  mrn: string
  serviceCategory: 'Inpatient Ward' | 'Cardiology Consultation' | 'Diagnostic Labs & Pathology' | 'Emergency Care' | 'Pharmacy & Medicines' | 'Surgical Procedure'
  totalAmount: number
  paidAmount: number
  balanceDue: number
  paymentStatus: 'Paid' | 'Partial' | 'Pending Insurance' | 'Overdue'
  paymentMethod: 'Insurance (BlueCross)' | 'Insurance (Aetna)' | 'Insurance (Medicare)' | 'Credit Card' | 'Cash / POS' | 'Bank Transfer (ACH)'
  date: string
  invoiceTime: string
  providerName?: string
  providerRole?: string
  items?: { description: string; amount: number }[]
  status?: 'pending' | 'paid'
  createdAt?: string
  paidAt?: string
}

export interface AppointmentRequest {
  id: string
  patientId: string
  patientName: string
  patientEmail?: string
  mrn?: string
  doctorId: string
  doctorName: string
  department: string
  requestedDate: string
  requestedTime: string
  visitType: 'Follow-up' | 'New Consultation' | 'Telehealth' | 'Post-op Review'
  reason: string
  status: 'pending' | 'approved' | 'rescheduled'
  rescheduledDate?: string
  rescheduledTime?: string
  doctorNote?: string
  submittedAt: string
}

export const APPOINTMENT_TIME_SLOTS = [
  '08:00 AM',
  '08:30 AM',
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '01:00 PM',
  '01:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:00 PM',
  '03:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM'
] as const

export interface MedicineInventory {
  id: string
  sku: string
  name: string
  genericName: string
  category: 'Antibiotics' | 'Cardiovascular' | 'Diabetes & Endocrine' | 'Pain Relief & Analgesics' | 'Respiratory' | 'Inpatient Injectables' | 'Emergency Medicine'
  unitsSoldToday: number
  currentStock: number
  reorderThreshold: number
  unitPrice: number
  unitType: 'Capsules' | 'Tablets' | 'Vials' | 'Inhalers' | 'Bottles'
  stockStatus: 'Optimal' | 'Moderate' | 'Low Stock' | 'Critical'
  expiryDate: string
  batchNumber: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: 'demo-admin',
    roleSlug: 'admin',
    roleLabel: 'Admin',
    name: 'Sarah Jenkins',
    title: 'Chief Information & Systems Administrator',
    department: 'Hospital IT & Security Governance',
    email: 'admin@carelink.health',
    password: 'AdminPassword123!',
    badge: 'Super Admin Access',
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    avatarInitials: 'SJ',
    summary: 'Full administrative control over user access, security compliance, server nodes, and clinical subsystem configurations.',
    permissions: [
      'Role-based access control (RBAC) management',
      'HIPAA / GDPR audit logs & telemetry monitoring',
      'Staff account provisioning & de-provisioning',
      'System integrations & EHR API gateway config'
    ],
    stats: [
      { label: 'Active Staff Users', value: '1,428', change: '+12% this month', tone: 'positive' },
      { label: 'System Uptime', value: '99.98%', change: 'Last 90 days', tone: 'positive' },
      { label: 'Pending Access Requests', value: '6', change: 'Requires review', tone: 'warning' },
      { label: 'Security Status', value: 'All Nodes Secure', change: 'Zero breaches', tone: 'positive' }
    ],
    recentActivities: [
      { title: 'Provisioned Doctor account', subtitle: 'Dr. Alexander Wright assigned to Cardiology', time: '12 mins ago', status: 'Completed', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'SSO Certificate Renewal', subtitle: 'OAuth2 / SAML provider key rotated successfully', time: '1 hour ago', status: 'Success', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Routine Audit Log Export', subtitle: 'Compliance report archived to secure cold storage', time: '3 hours ago', status: 'Archived', statusColor: 'bg-slate-100 text-slate-800' }
    ],
    quickActions: [
      { label: 'Provision New Staff Member', description: 'Create verified clinical or administrative credentials' },
      { label: 'Audit Security Logs', description: 'Review authentication attempts and API token usage' },
      { label: 'Manage Department Permissions', description: 'Modify access controls across hospital wings' }
    ]
  },
  {
    id: 'demo-doctor',
    roleSlug: 'doctor',
    roleLabel: 'Doctor',
    name: 'Dr. Alexander Wright, MD',
    title: 'Attending Physician & Cardiologist',
    department: 'Cardiology & Internal Medicine',
    specialization: 'Cardiology',
    email: 'doctor@carelink.health',
    password: 'DoctorPassword123!',
    badge: 'Clinical Provider · Cardiology',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    avatarInitials: 'AW',
    summary: 'Authorized prescriber and primary diagnostic lead for inpatient admissions, clinical treatment plans, and telehealth consults.',
    permissions: [
      'Electronic Health Record (EHR) chart read & write',
      'Prescription & e-Rx pharmacy routing',
      'Diagnostic lab and imaging order dispatch',
      'Care plan sign-off and clinical discharge approval'
    ],
    stats: [
      { label: "Today's Consultations", value: '14 Patients', change: '4 completed', tone: 'positive' },
      { label: 'Urgent Diagnostic Reviews', value: '3 Pending', change: '2 Troponin, 1 ECG', tone: 'warning' },
      { label: 'Active Inpatients', value: '9 Patients', change: 'Ward 4B & 3A', tone: 'neutral' },
      { label: 'Prescription Refills', value: '6 Pending', change: 'Awaiting signature', tone: 'warning' }
    ],
    recentActivities: [
      { title: 'Cardiac Consult - Amara Okafor', subtitle: 'Post-procedure review, BP 122/78 mmHg stable', time: '25 mins ago', status: 'Reviewed', statusColor: 'bg-blue-100 text-blue-800' },
      { title: 'Electronic Rx Dispatched', subtitle: 'Lisinopril 10mg prescribed to Patient #4829', time: '45 mins ago', status: 'Sent', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Diagnostic Lab Ordered', subtitle: 'Comprehensive Metabolic Panel + Lipid Panel', time: '2 hours ago', status: 'In Lab', statusColor: 'bg-amber-100 text-amber-800' }
    ],
    quickActions: [
      { label: 'Start Telehealth Consultation', description: 'Open high-definition encrypted video visit' },
      { label: 'Order Diagnostic Lab / Imaging', description: 'Create lab order for bloodwork, X-Ray or MRI' },
      { label: 'Sign Pending Prescriptions', description: 'Review and approve digital prescriptions for pharmacy dispatch' }
    ]
  },
  {
    id: 'demo-nurse',
    roleSlug: 'nurse',
    roleLabel: 'Nurse',
    name: 'Elena Rostova, RN, BSN',
    title: 'Charge Nurse & Clinical Care Specialist',
    department: 'Inpatient Medical/Surgical Ward 4B',
    email: 'nurse@carelink.health',
    password: 'NursePassword123!',
    badge: 'Vitals & Medication Lead',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    avatarInitials: 'ER',
    summary: 'Bedside care coordination, medication administration schedules, telemetry monitoring, and immediate patient triage.',
    permissions: [
      'Medication administration logging (eMAR)',
      'Real-time vitals recording & smart monitor syncing',
      'Shift handoff reporting & nursing notes',
      'Rapid response & bedside nurse call coordination'
    ],
    stats: [
      { label: 'Assigned Beds', value: '8 Beds', change: 'Full capacity in Ward 4B', tone: 'neutral' },
      { label: 'Medications Due (<1 hr)', value: '4 Doses', change: 'eMAR updated', tone: 'warning' },
      { label: 'Vitals Checked Today', value: '32 / 32', change: '100% on schedule', tone: 'positive' },
      { label: 'Shift Transition', value: '2.5 hrs', change: 'Night handover ready', tone: 'neutral' }
    ],
    recentActivities: [
      { title: 'Administered IV Antibiotic', subtitle: 'Patient in Room 412 (Bed B) - Ceftriaxone 1g', time: '10 mins ago', status: 'Logged', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Recorded Vital Signs', subtitle: 'Amara Okafor - Temp: 98.6°F, HR: 72 bpm, SpO2: 99%', time: '35 mins ago', status: 'Normal', statusColor: 'bg-teal-100 text-teal-800' },
      { title: 'Shift Handoff Note Created', subtitle: 'Summary prepared for Incoming RN shift lead', time: '1.5 hours ago', status: 'Drafted', statusColor: 'bg-slate-100 text-slate-800' }
    ],
    quickActions: [
      { label: 'Record Patient Vitals', description: 'Enter blood pressure, pulse, temperature, and SpO2' },
      { label: 'Dispense & Scan Medication', description: 'Barcode medication administration (BCMA) workflow' },
      { label: 'Log Bedside Clinical Note', description: 'Add shift observations and patient progress notes' }
    ]
  },
  {
    id: 'demo-medical-staff',
    roleSlug: 'medical-staff',
    roleLabel: 'Medicine Staff',
    name: 'Marcus Vance, MLS',
    title: 'Chief Medicine & Laboratory Technologist',
    department: 'Central Medicine & Pathology Diagnostics',
    email: 'medicalstaff@carelink.health',
    password: 'StaffPassword123!',
    badge: 'Medicine & Diagnostics',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    avatarInitials: 'MV',
    summary: 'Specimen processing, automated analyzer quality control, pharmacy dispensing support, and diagnostic verification.',
    permissions: [
      'Laboratory Information System (LIS) processing',
      'Specimen barcoding & bio-repository tracking',
      'Diagnostic report upload & doctor notification',
      'Critical lab value escalation & panic alerts'
    ],
    stats: [
      { label: 'Specimens in Queue', value: '23 Orders', change: 'Avg turnaround: 28 mins', tone: 'positive' },
      { label: 'STAT Lab Requests', value: '2 Urgent', change: 'Cardiac troponin assays', tone: 'warning' },
      { label: 'Completed Tests Today', value: '184', change: '+18% vs daily baseline', tone: 'positive' },
      { label: 'Equipment Calibration', value: '100% OK', change: 'All analyzers calibrated', tone: 'positive' }
    ],
    recentActivities: [
      { title: 'Verified Lipid Panel Results', subtitle: 'Specimen #LP-9021 verified for Dr. Wright', time: '18 mins ago', status: 'Dispatched', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'STAT CBC & Blood Gas Analysis', subtitle: 'Emergency Department requisition completed', time: '40 mins ago', status: 'Complete', statusColor: 'bg-indigo-100 text-indigo-800' },
      { title: 'Reagent Quality Control Test', subtitle: 'Spectrophotometer batch QC pass verified', time: '3 hours ago', status: 'Passed', statusColor: 'bg-emerald-100 text-emerald-800' }
    ],
    quickActions: [
      { label: 'Process Specimen Batch', description: 'Scan tube barcodes and send to automated analyzer' },
      { label: 'Approve & Release Lab Report', description: 'Finalize diagnostic values and push to EHR' },
      { label: 'Broadcast Critical STAT Alert', description: 'Instantly notify attending physician of panic values' }
    ]
  },
  {
    id: 'demo-billing',
    roleSlug: 'billing',
    roleLabel: 'Billing Staff',
    name: 'Patricia Hayes, CPC',
    title: 'Senior Revenue Cycle & Insurance Specialist',
    department: 'Patient Financial Services & Claims',
    email: 'billing@carelink.health',
    password: 'BillingPassword123!',
    badge: 'Revenue & Claims',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    avatarInitials: 'PH',
    summary: 'Insurance claim adjudication, ICD-10 / CPT medical coding, co-pay reconciliation, and patient payment plans.',
    permissions: [
      'Insurance claim submission (EDI 837) & ERA processing',
      'Prior-authorization submission & denial appeals',
      'Itemized patient bill generation & financial counseling',
      'Payment gateway reconciliation & refund processing'
    ],
    stats: [
      { label: 'Claims Processed (Week)', value: '₹1,48,250', change: '98.6% clean claim rate', tone: 'positive' },
      { label: 'Pending Prior-Auths', value: '7 In Review', change: 'Avg response 24h', tone: 'warning' },
      { label: 'Reconciled Invoices', value: '412 Bills', change: 'Zero outstanding errors', tone: 'positive' },
      { label: 'Denied Claims Queue', value: '3 Claims', change: 'Appeals in progress', tone: 'neutral' }
    ],
    recentActivities: [
      { title: 'Claim Adjudication Approved', subtitle: 'Aetna Inpatient Claim #CL-98441 - ₹14,200', time: '14 mins ago', status: 'Paid', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Prior-Authorization Cleared', subtitle: 'BlueCross Cardiology procedure authorized', time: '1.2 hours ago', status: 'Authorized', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Generated Itemized Statement', subtitle: 'Patient Amara Okafor - Outpatient consultation', time: '2.5 hours ago', status: 'Sent', statusColor: 'bg-blue-100 text-blue-800' }
    ],
    quickActions: [
      { label: 'Submit Insurance Batch (EDI)', description: 'Send clean electronic claim files to clearinghouse' },
      { label: 'Verify Patient Eligibility', description: 'Run real-time 270/271 insurance coverage checks' },
      { label: 'Create Flexible Payment Plan', description: 'Set up automated monthly installment schedule' }
    ]
  },
  {
    id: 'demo-receptionist',
    roleSlug: 'receptionist',
    roleLabel: 'Receptionist',
    name: 'David Chen',
    title: 'Lead Patient Intake & Front Desk Coordinator',
    department: 'Central Admissions & Patient Services',
    email: 'receptionist@carelink.health',
    password: 'ReceptionPassword123!',
    badge: 'Front Desk & Triage',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    avatarInitials: 'DC',
    summary: 'Patient check-in, identity verification, insurance card scanning, appointment scheduling, and room allocation.',
    permissions: [
      'Master patient index (MPI) lookup & registration',
      'Appointment calendar scheduling & SMS reminders',
      'Visitor badge issuance & waiting room queue management',
      'Direct provider messaging for arrival notifications'
    ],
    stats: [
      { label: 'Checked In Today', value: '46 Patients', change: 'Avg wait: 7 mins', tone: 'positive' },
      { label: 'In Waiting Area', value: '4 Patients', change: 'Rooms assigned', tone: 'neutral' },
      { label: 'Upcoming Today', value: '18 Appointments', change: 'Next 3 hours', tone: 'neutral' },
      { label: 'No-Show Rate', value: '2.1%', change: '-0.8% this week', tone: 'positive' }
    ],
    recentActivities: [
      { title: 'Patient Check-In Completed', subtitle: 'Amara Okafor arrived for 2:30 PM Cardiology visit', time: '5 mins ago', status: 'In Waiting', statusColor: 'bg-amber-100 text-amber-800' },
      { title: 'New Appointment Booked', subtitle: 'Dr. Wright consultation booked for Oct 4, 10:00 AM', time: '22 mins ago', status: 'Confirmed', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Issued Visitor Badge', subtitle: 'Guest registered for Room 412 (Ward 4B)', time: '50 mins ago', status: 'Active', statusColor: 'bg-slate-100 text-slate-800' }
    ],
    quickActions: [
      { label: 'Fast Patient Check-In', description: 'Scan QR code or search by DOB and ID' },
      { label: 'Book New Appointment', description: 'Find open doctor slots and schedule consultation' },
      { label: 'Issue Visitor / Guest Pass', description: 'Print visitor badge and register emergency contact' }
    ]
  },
  {
    id: 'demo-patient',
    roleSlug: 'patient',
    roleLabel: 'Patient / User',
    name: 'Amara Okafor',
    title: 'Registered CareLink Patient',
    department: 'Personal Health Portal',
    email: 'patient@carelink.health',
    password: 'PatientPassword123!',
    badge: 'Patient Portal',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    avatarInitials: 'AO',
    summary: 'Personal health portal access for medical records, lab reports, doctor messaging, and appointment scheduling.',
    permissions: [
      'Personal medical records & test history access',
      'Direct secure messaging with assigned care team',
      'Online appointment booking & check-in',
      'Prescription refill requests & payment management'
    ],
    stats: [
      { label: 'Next Appointment', value: 'Tomorrow, 10:30 AM', change: 'Dr. Alexander Wright', tone: 'positive' },
      { label: 'New Test Results', value: '1 Lab Report', change: 'Lipid Panel Ready', tone: 'positive' },
      { label: 'Active Prescriptions', value: '2 Medications', change: 'Refill due in 12 days', tone: 'neutral' },
      { label: 'Outstanding Balance', value: '₹0.00', change: 'Insurance covered 100%', tone: 'positive' }
    ],
    recentActivities: [
      { title: 'Lab Results Uploaded', subtitle: 'Lipid & Metabolic Panel signed by Dr. Wright', time: '1 hour ago', status: 'Available', statusColor: 'bg-purple-100 text-purple-800' },
      { title: 'Appointment Reminder', subtitle: 'Cardiology Follow-up confirmed for tomorrow morning', time: '4 hours ago', status: 'Confirmed', statusColor: 'bg-emerald-100 text-emerald-800' },
      { title: 'Secure Message Received', subtitle: 'Nurse Elena sent pre-visit instructions', time: '1 day ago', status: 'Read', statusColor: 'bg-slate-100 text-slate-800' }
    ],
    quickActions: [
      { label: 'Book Doctor Appointment', description: 'Select your preferred physician and clinic time' },
      { label: 'View Latest Lab Results', description: 'Download PDF or review clinical breakdown' },
      { label: 'Message Care Team', description: 'Send secure inquiry to your doctor or nurse' }
    ]
  }
]

export const ROLE_DEFINITIONS = [
  { slug: 'doctor', label: 'Doctor', icon: 'stethoscope', badge: 'Clinical Provider', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { slug: 'nurse', label: 'Nurse', icon: 'heart-pulse', badge: 'Bedside Care & Vitals', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { slug: 'medical-staff', label: 'Medicine Staff', icon: 'flask-conical', badge: 'Medicine & Diagnostics', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { slug: 'billing', label: 'Billing Staff', icon: 'receipt', badge: 'Revenue Cycle & Claims', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { slug: 'receptionist', label: 'Receptionist', icon: 'calendar-check', badge: 'Admissions & Front Desk', color: 'bg-amber-100 text-amber-800 border-amber-200' },
]

export const INITIAL_PATIENTS: PatientRecord[] = [
  {
    id: 'pt-101',
    mrn: 'MRN-84920',
    name: 'Amara Okafor',
    age: 34,
    gender: 'Female',
    registeredTime: '08:15 AM',
    status: 'diagnosing',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Alexander Wright',
    symptoms: 'Palpitations & mild chest tightness',
    triagePriority: 'Urgent',
    notes: 'ECG in progress. Vitals stable.'
  },
  {
    id: 'pt-102',
    mrn: 'MRN-84921',
    name: 'Robert Miller',
    age: 58,
    gender: 'Male',
    registeredTime: '08:30 AM',
    status: 'waiting',
    department: 'Internal Medicine',
    assignedDoctor: 'Dr. Alexander Wright',
    symptoms: 'Routine diabetes check-up & fasting bloodwork',
    triagePriority: 'Normal'
  },
  {
    id: 'pt-103',
    mrn: 'MRN-84922',
    name: 'Sophia Patel',
    age: 27,
    gender: 'Female',
    registeredTime: '08:45 AM',
    status: 'diagnosing',
    department: 'Medicine Diagnostics',
    assignedDoctor: 'Dr. Alexander Wright',
    symptoms: 'Allergic reaction & skin rash',
    triagePriority: 'Normal',
    notes: 'Antihistamine administered.'
  },
  {
    id: 'pt-104',
    mrn: 'MRN-84923',
    name: 'David Gomez',
    age: 45,
    gender: 'Male',
    registeredTime: '07:30 AM',
    status: 'completed',
    department: 'Cardiology',
    assignedDoctor: 'Dr. Alexander Wright',
    symptoms: 'Post-operative follow up',
    triagePriority: 'Normal',
    completedTime: '09:15 AM',
    notes: 'Discharged with prescription refill.'
  },
  {
    id: 'pt-105',
    mrn: 'MRN-84924',
    name: 'Emma Watson-Lee',
    age: 62,
    gender: 'Female',
    registeredTime: '07:15 AM',
    status: 'completed',
    department: 'General Medicine',
    assignedDoctor: 'Dr. Alexander Wright',
    symptoms: 'Hypertension evaluation',
    triagePriority: 'Normal',
    completedTime: '08:50 AM',
    notes: 'Treatment plan adjusted.'
  },
  {
    id: 'pt-106',
    mrn: 'MRN-84925',
    name: 'Liam Zhang',
    age: 19,
    gender: 'Male',
    registeredTime: '09:10 AM',
    status: 'registered',
    department: 'Emergency & Triage',
    assignedDoctor: 'Awaiting Assignment',
    symptoms: 'Ankle sprain after soccer match',
    triagePriority: 'Normal'
  },
  {
    id: 'pt-107',
    mrn: 'MRN-84926',
    name: 'Clara Johansson',
    age: 41,
    gender: 'Female',
    registeredTime: '09:25 AM',
    status: 'waiting',
    department: 'Medicine Diagnostics',
    assignedDoctor: 'Marcus Vance, MLS',
    symptoms: 'Thyroid panel & hormone profile review',
    triagePriority: 'Normal'
  },
  {
    id: 'pt-108',
    mrn: 'MRN-84927',
    name: 'Julian Vance',
    age: 50,
    gender: 'Male',
    registeredTime: '06:50 AM',
    status: 'completed',
    department: 'Inpatient Ward 4B',
    assignedDoctor: 'Elena Rostova, RN',
    symptoms: 'Overnight vitals observation',
    triagePriority: 'Normal',
    completedTime: '08:10 AM',
    notes: 'Cleared for home discharge.'
  }
]

export const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'leave-1',
    staffId: 'demo-nurse',
    staffName: 'Elena Rostova, RN',
    staffRole: 'Nurse',
    department: 'Inpatient Medical/Surgical Ward 4B',
    leaveType: 'Sick Leave',
    startDate: 'Tomorrow',
    endDate: 'Day After Tomorrow',
    shiftSlot: 'Morning (08:00 - 16:00)',
    reason: 'Acute respiratory flu; doctor advised 48hr isolation',
    status: 'pending',
    submittedAt: 'Today at 07:45 AM'
  },
  {
    id: 'leave-2',
    staffId: 'demo-medical-staff',
    staffName: 'Marcus Vance, MLS',
    staffRole: 'Medicine Staff',
    department: 'Central Medicine & Pathology',
    leaveType: 'Medical Conference',
    startDate: 'Next Monday',
    endDate: 'Next Wednesday',
    shiftSlot: 'Full Day (All Shifts)',
    reason: 'Presenting laboratory automation research at National Pathology Symposium',
    status: 'approved',
    replacementStaffId: 'staff-demo-backup-lab',
    replacementStaffName: 'Rachel Green, MLS (Backup Medicine Staff)',
    adminNotes: 'Coverage confirmed for automated analyzer queues.',
    submittedAt: 'Yesterday at 03:20 PM'
  },
  {
    id: 'leave-3',
    staffId: 'demo-billing',
    staffName: 'Patricia Hayes, CPC',
    staffRole: 'Billing Staff',
    department: 'Patient Financial Services',
    leaveType: 'Annual Leave',
    startDate: 'Oct 12',
    endDate: 'Oct 16',
    shiftSlot: 'Morning (08:00 - 16:00)',
    reason: 'Scheduled annual family vacation',
    status: 'pending',
    submittedAt: 'Yesterday at 11:00 AM'
  }
]

export const INITIAL_SHIFT_ROSTER: StaffShiftAssignment[] = [
  {
    id: 'shift-1',
    staffId: 'demo-doctor',
    staffName: 'Dr. Alexander Wright, MD',
    roleLabel: 'Doctor',
    department: 'Cardiology',
    shiftSlot: 'Morning (08:00 - 16:00)',
    dutyStatus: 'On Duty'
  },
  {
    id: 'shift-2',
    staffId: 'demo-nurse',
    staffName: 'Elena Rostova, RN',
    roleLabel: 'Nurse',
    department: 'Ward 4B',
    shiftSlot: 'Morning (08:00 - 16:00)',
    dutyStatus: 'Absent',
    replacementStaffId: 'rep-nurse-1',
    replacementStaffName: 'Nurse Samantha Cole, RN',
    coverageNotes: 'Covering Morning ICU & Inpatient Vitals slot'
  },
  {
    id: 'shift-3',
    staffId: 'demo-medical-staff',
    staffName: 'Marcus Vance, MLS',
    roleLabel: 'Medicine Staff',
    department: 'Central Medicine Diagnostics',
    shiftSlot: 'Morning (08:00 - 16:00)',
    dutyStatus: 'On Duty'
  },
  {
    id: 'shift-4',
    staffId: 'demo-billing',
    staffName: 'Patricia Hayes, CPC',
    roleLabel: 'Billing Staff',
    department: 'Revenue & Claims',
    shiftSlot: 'Morning (08:00 - 16:00)',
    dutyStatus: 'On Duty'
  },
  {
    id: 'shift-5',
    staffId: 'demo-receptionist',
    staffName: 'David Chen',
    roleLabel: 'Receptionist',
    department: 'Central Admissions',
    shiftSlot: 'Morning (08:00 - 16:00)',
    dutyStatus: 'On Duty'
  }
]

export const INITIAL_BILLINGS: BillingRecord[] = [
  {
    id: 'bill-1',
    invoiceNumber: 'INV-2026-9041',
    patientName: 'Amara Okafor',
    mrn: 'MRN-84920',
    serviceCategory: 'Cardiology Consultation',
    totalAmount: 1850.00,
    paidAmount: 1850.00,
    balanceDue: 0.00,
    paymentStatus: 'Paid',
    paymentMethod: 'Insurance (BlueCross)',
    date: 'Today',
    invoiceTime: '09:30 AM'
  },
  {
    id: 'bill-2',
    invoiceNumber: 'INV-2026-9042',
    patientName: 'David Gomez',
    mrn: 'MRN-84923',
    serviceCategory: 'Inpatient Ward',
    totalAmount: 4200.00,
    paidAmount: 3800.00,
    balanceDue: 400.00,
    paymentStatus: 'Partial',
    paymentMethod: 'Insurance (Aetna)',
    date: 'Today',
    invoiceTime: '08:45 AM'
  },
  {
    id: 'bill-3',
    invoiceNumber: 'INV-2026-9043',
    patientName: 'Robert Miller',
    mrn: 'MRN-84921',
    serviceCategory: 'Pharmacy & Medicines',
    totalAmount: 340.00,
    paidAmount: 340.00,
    balanceDue: 0.00,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    date: 'Today',
    invoiceTime: '08:55 AM'
  },
  {
    id: 'bill-4',
    invoiceNumber: 'INV-2026-9044',
    patientName: 'Sophia Patel',
    mrn: 'MRN-84922',
    serviceCategory: 'Diagnostic Labs & Pathology',
    totalAmount: 920.00,
    paidAmount: 0.00,
    balanceDue: 920.00,
    paymentStatus: 'Pending Insurance',
    paymentMethod: 'Insurance (Medicare)',
    date: 'Today',
    invoiceTime: '09:10 AM'
  },
  {
    id: 'bill-5',
    invoiceNumber: 'INV-2026-9045',
    patientName: 'Emma Watson-Lee',
    mrn: 'MRN-84924',
    serviceCategory: 'Cardiology Consultation',
    totalAmount: 680.00,
    paidAmount: 680.00,
    balanceDue: 0.00,
    paymentStatus: 'Paid',
    paymentMethod: 'Credit Card',
    date: 'Today',
    invoiceTime: '07:45 AM'
  },
  {
    id: 'bill-6',
    invoiceNumber: 'INV-2026-9046',
    patientName: 'Julian Vance',
    mrn: 'MRN-84927',
    serviceCategory: 'Emergency Care',
    totalAmount: 2650.00,
    paidAmount: 2650.00,
    balanceDue: 0.00,
    paymentStatus: 'Paid',
    paymentMethod: 'Insurance (BlueCross)',
    date: 'Today',
    invoiceTime: '07:20 AM'
  },
  {
    id: 'bill-7',
    invoiceNumber: 'INV-2026-9047',
    patientName: 'Clara Johansson',
    mrn: 'MRN-84926',
    serviceCategory: 'Diagnostic Labs & Pathology',
    totalAmount: 510.00,
    paidAmount: 255.00,
    balanceDue: 255.00,
    paymentStatus: 'Partial',
    paymentMethod: 'Cash / POS',
    date: 'Today',
    invoiceTime: '09:40 AM'
  }
]

export const INITIAL_MEDICINES: MedicineInventory[] = [
  {
    id: 'med-1',
    sku: 'MED-AMX-500',
    name: 'Amoxicillin 500mg',
    genericName: 'Amoxicillin Trihydrate',
    category: 'Antibiotics',
    unitsSoldToday: 184,
    currentStock: 1450,
    reorderThreshold: 300,
    unitPrice: 12.50,
    unitType: 'Capsules',
    stockStatus: 'Optimal',
    expiryDate: '12/2027',
    batchNumber: 'AMX-9482-A'
  },
  {
    id: 'med-2',
    sku: 'MED-LSN-010',
    name: 'Lisinopril 10mg',
    genericName: 'Lisinopril Dihydrate',
    category: 'Cardiovascular',
    unitsSoldToday: 215,
    currentStock: 920,
    reorderThreshold: 250,
    unitPrice: 18.00,
    unitType: 'Tablets',
    stockStatus: 'Optimal',
    expiryDate: '09/2028',
    batchNumber: 'LSN-4012-B'
  },
  {
    id: 'med-3',
    sku: 'MED-MET-850',
    name: 'Metformin 850mg',
    genericName: 'Metformin Hydrochloride',
    category: 'Diabetes & Endocrine',
    unitsSoldToday: 160,
    currentStock: 80,
    reorderThreshold: 200,
    unitPrice: 14.20,
    unitType: 'Tablets',
    stockStatus: 'Low Stock',
    expiryDate: '05/2027',
    batchNumber: 'MET-8821-C'
  },
  {
    id: 'med-4',
    sku: 'MED-ATV-020',
    name: 'Atorvastatin 20mg',
    genericName: 'Atorvastatin Calcium',
    category: 'Cardiovascular',
    unitsSoldToday: 140,
    currentStock: 1100,
    reorderThreshold: 250,
    unitPrice: 22.00,
    unitType: 'Tablets',
    stockStatus: 'Optimal',
    expiryDate: '11/2027',
    batchNumber: 'ATV-3310-A'
  },
  {
    id: 'med-5',
    sku: 'MED-CFT-001',
    name: 'Ceftriaxone 1g IV',
    genericName: 'Ceftriaxone Sodium',
    category: 'Inpatient Injectables',
    unitsSoldToday: 48,
    currentStock: 35,
    reorderThreshold: 100,
    unitPrice: 45.00,
    unitType: 'Vials',
    stockStatus: 'Critical',
    expiryDate: '03/2027',
    batchNumber: 'CFT-7721-D'
  },
  {
    id: 'med-6',
    sku: 'MED-PAR-650',
    name: 'Paracetamol 650mg',
    genericName: 'Acetaminophen',
    category: 'Pain Relief & Analgesics',
    unitsSoldToday: 320,
    currentStock: 3400,
    reorderThreshold: 500,
    unitPrice: 6.50,
    unitType: 'Tablets',
    stockStatus: 'Optimal',
    expiryDate: '10/2028',
    batchNumber: 'PAR-1192-A'
  },
  {
    id: 'med-7',
    sku: 'MED-SLB-100',
    name: 'Salbutamol HFA Inhaler',
    genericName: 'Albuterol Sulfate',
    category: 'Respiratory',
    unitsSoldToday: 62,
    currentStock: 140,
    reorderThreshold: 120,
    unitPrice: 32.00,
    unitType: 'Inhalers',
    stockStatus: 'Moderate',
    expiryDate: '08/2027',
    batchNumber: 'SLB-5541-C'
  },
  {
    id: 'med-8',
    sku: 'MED-INS-100',
    name: 'Insulin Glargine 100U/ml',
    genericName: 'Insulin Glargine',
    category: 'Diabetes & Endocrine',
    unitsSoldToday: 35,
    currentStock: 45,
    reorderThreshold: 80,
    unitPrice: 78.00,
    unitType: 'Vials',
    stockStatus: 'Low Stock',
    expiryDate: '01/2027',
    batchNumber: 'INS-9002-E'
  }
]

export const INITIAL_APPOINTMENTS: AppointmentRequest[] = [
  {
    id: 'appt-1',
    patientId: 'demo-patient',
    patientName: 'Amara Okafor',
    patientEmail: 'patient@carelink.health',
    mrn: 'MRN-84920',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    department: 'Cardiology',
    requestedDate: '2026-10-06',
    requestedTime: '10:30 AM',
    visitType: 'Follow-up',
    reason: 'Post-procedure review and blood pressure check after last cardiology consult.',
    status: 'pending',
    submittedAt: 'Today at 08:12 AM'
  },
  {
    id: 'appt-2',
    patientId: 'pt-102',
    patientName: 'Robert Miller',
    mrn: 'MRN-84921',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    department: 'Internal Medicine',
    requestedDate: '2026-10-07',
    requestedTime: '09:00 AM',
    visitType: 'New Consultation',
    reason: 'Diabetes follow-up with fasting bloodwork review.',
    status: 'pending',
    submittedAt: 'Yesterday at 04:40 PM'
  },
  {
    id: 'appt-3',
    patientId: 'pt-103',
    patientName: 'Sophia Patel',
    mrn: 'MRN-84922',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    department: 'Cardiology',
    requestedDate: '2026-10-08',
    requestedTime: '02:00 PM',
    visitType: 'Telehealth',
    reason: 'Discuss allergy symptoms and whether cardiology clearance is needed.',
    status: 'pending',
    submittedAt: 'Yesterday at 11:05 AM'
  },
  {
    id: 'appt-4',
    patientId: 'pt-104',
    patientName: 'David Gomez',
    mrn: 'MRN-84923',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    department: 'Cardiology',
    requestedDate: '2026-10-03',
    requestedTime: '11:00 AM',
    visitType: 'Post-op Review',
    reason: 'Surgical follow-up and prescription refill check.',
    status: 'approved',
    submittedAt: '2 days ago'
  },
  {
    id: 'appt-5',
    patientId: 'pt-105',
    patientName: 'Emma Watson-Lee',
    mrn: 'MRN-84924',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    department: 'Cardiology',
    requestedDate: '2026-10-04',
    requestedTime: '08:30 AM',
    visitType: 'Follow-up',
    reason: 'Hypertension medication adjustment review.',
    status: 'rescheduled',
    rescheduledDate: '2026-10-09',
    rescheduledTime: '01:30 PM',
    doctorNote: 'Morning clinic is fully booked. Please confirm the afternoon slot.',
    submittedAt: '3 days ago'
  }
]

// LocalStorage helpers for custom staff accounts
export function getStoredAccounts(): DemoAccount[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem('carelink_custom_accounts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveNewStaffAccount(newAccount: DemoAccount): DemoAccount {
  if (typeof window !== 'undefined') {
    const existing = getStoredAccounts()
    const updated = [newAccount, ...existing.filter(a => a.id !== newAccount.id)]
    localStorage.setItem('carelink_custom_accounts', JSON.stringify(updated))
  }
  return newAccount
}

export function deleteStaffAccount(accountId: string): void {
  if (typeof window !== 'undefined') {
    const existing = getStoredAccounts()
    const updated = existing.filter(a => a.id !== accountId)
    localStorage.setItem('carelink_custom_accounts', JSON.stringify(updated))
  }
}

export function getAllAccounts(): DemoAccount[] {
  const custom = getStoredAccounts()
  return [...custom, ...DEMO_ACCOUNTS]
}

export function findDemoAccount(email: string, password?: string): DemoAccount | undefined {
  const normalizedEmail = email.trim().toLowerCase()
  const all = getAllAccounts()
  const account = all.find(acc => acc.email.toLowerCase() === normalizedEmail)
  if (!account) return undefined
  if (password && password !== account.password && password !== 'DemoPass2026!') {
    return undefined
  }
  return account
}

export function getDemoAccountByRole(roleSlug: string): DemoAccount | undefined {
  const cleanSlug = roleSlug.replace(/^\//, '').trim().toLowerCase()
  const all = getAllAccounts()
  return all.find(acc => acc.roleSlug.toLowerCase() === cleanSlug)
}

// LocalStorage helpers for Leave Requests
export function getStoredLeaveRequests(): LeaveRequest[] {
  if (typeof window === 'undefined') return INITIAL_LEAVE_REQUESTS
  try {
    const raw = localStorage.getItem('carelink_leave_requests')
    return raw ? JSON.parse(raw) : INITIAL_LEAVE_REQUESTS
  } catch {
    return INITIAL_LEAVE_REQUESTS
  }
}

export function saveLeaveRequests(requests: LeaveRequest[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_leave_requests', JSON.stringify(requests))
  }
}

// LocalStorage helpers for Shift Roster
export function getStoredShiftRoster(): StaffShiftAssignment[] {
  if (typeof window === 'undefined') return INITIAL_SHIFT_ROSTER
  try {
    const raw = localStorage.getItem('carelink_shift_roster')
    return raw ? JSON.parse(raw) : INITIAL_SHIFT_ROSTER
  } catch {
    return INITIAL_SHIFT_ROSTER
  }
}

export function saveShiftRoster(roster: StaffShiftAssignment[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_shift_roster', JSON.stringify(roster))
  }
}

// LocalStorage helpers for Patients
export function getStoredPatients(): PatientRecord[] {
  if (typeof window === 'undefined') return INITIAL_PATIENTS
  try {
    const raw = localStorage.getItem('carelink_patients')
    return raw ? JSON.parse(raw) : INITIAL_PATIENTS
  } catch {
    return INITIAL_PATIENTS
  }
}

export function savePatients(patients: PatientRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_patients', JSON.stringify(patients))
  }
}

// LocalStorage helpers for Billings
export function getStoredBillings(): BillingRecord[] {
  if (typeof window === 'undefined') return INITIAL_BILLINGS
  try {
    const raw = localStorage.getItem('carelink_billings')
    return raw ? JSON.parse(raw) : INITIAL_BILLINGS
  } catch {
    return INITIAL_BILLINGS
  }
}

export function saveBillings(billings: BillingRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_billings', JSON.stringify(billings))
  }
}

// LocalStorage helpers for Medicines
export function getStoredMedicines(): MedicineInventory[] {
  if (typeof window === 'undefined') return INITIAL_MEDICINES
  try {
    const raw = localStorage.getItem('carelink_medicines')
    return raw ? JSON.parse(raw) : INITIAL_MEDICINES
  } catch {
    return INITIAL_MEDICINES
  }
}

export function saveMedicines(medicines: MedicineInventory[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_medicines', JSON.stringify(medicines))
  }
}

export function getStoredAppointments(): AppointmentRequest[] {
  if (typeof window === 'undefined') return INITIAL_APPOINTMENTS
  try {
    const raw = localStorage.getItem('carelink_appointments')
    return raw ? JSON.parse(raw) : INITIAL_APPOINTMENTS
  } catch {
    return INITIAL_APPOINTMENTS
  }
}

export function saveAppointments(appointments: AppointmentRequest[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_appointments', JSON.stringify(appointments))
  }
}

export interface DoctorAvailability {
  doctorId: string
  doctorName: string
  isAvailable: boolean
  availableDays: string[]
  startTime: string
  endTime: string
  breakStartTime?: string
  breakEndTime?: string
  slotDurationMinutes: number
  maxDailyPatients: number
  statusNote?: string
  lastUpdated?: string
}

export const DEFAULT_DOCTOR_AVAILABILITY: DoctorAvailability = {
  doctorId: 'demo-doctor',
  doctorName: 'Dr. Alexander Wright, MD',
  isAvailable: true,
  availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  startTime: '09:00 AM',
  endTime: '05:00 PM',
  breakStartTime: '01:00 PM',
  breakEndTime: '02:00 PM',
  slotDurationMinutes: 30,
  maxDailyPatients: 16,
  statusNote: 'Consulting in OPD Clinic Room 204 (Cardiology)',
  lastUpdated: 'Today'
}

export function getStoredDoctorAvailabilities(): Record<string, DoctorAvailability> {
  if (typeof window === 'undefined') return { 'demo-doctor': DEFAULT_DOCTOR_AVAILABILITY }
  try {
    const raw = localStorage.getItem('carelink_doctor_availabilities')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (!parsed['demo-doctor']) {
        parsed['demo-doctor'] = DEFAULT_DOCTOR_AVAILABILITY
      }
      return parsed
    }
    return { 'demo-doctor': DEFAULT_DOCTOR_AVAILABILITY }
  } catch {
    return { 'demo-doctor': DEFAULT_DOCTOR_AVAILABILITY }
  }
}

export function getDoctorAvailability(doctorId: string, doctorName?: string): DoctorAvailability {
  const all = getStoredDoctorAvailabilities()
  if (all[doctorId]) return all[doctorId]
  return {
    ...DEFAULT_DOCTOR_AVAILABILITY,
    doctorId,
    doctorName: doctorName || 'Attending Physician'
  }
}

export function saveDoctorAvailability(availability: DoctorAvailability): void {
  if (typeof window !== 'undefined') {
    const all = getStoredDoctorAvailabilities()
    all[availability.doctorId] = availability
    localStorage.setItem('carelink_doctor_availabilities', JSON.stringify(all))
  }
}

export interface MedicationItem {
  id: string
  name: string
  dosage: string
  form: 'Tablet' | 'Capsule' | 'Syrup' | 'Injection' | 'Inhaler'
  frequency: string
  scheduleTimes: string[]
  timingInstructions: 'Before Food' | 'After Food' | 'With Food' | 'At Bedtime' | 'As Needed (SOS)'
  durationDays: number
  instructions?: string
}

export interface PrescriptionRecord {
  id: string
  patientId: string
  patientName: string
  mrn: string
  doctorId: string
  doctorName: string
  nurseId: string
  nurseName: string
  diagnosis: string
  vitals?: {
    bloodPressure?: string
    heartRate?: string
    spO2?: string
    temperature?: string
  }
  medications: MedicationItem[]
  nurseNotes?: string
  status: 'active' | 'dispensed' | 'completed'
  sharedWithPharmacy: boolean
  sharedWithPatient: boolean
  sharedWithBilling: boolean
  isNurseDirectCare?: boolean
  treatmentType?: 'Doctor Consult' | 'Nurse Direct Fever/General Protocol' | 'Emergency Triage'
  createdAt: string
  // Medicine Staff & Billing Staff Sync Fields:
  fulfillmentStatus?: 'pending_prep' | 'preparing' | 'ready_for_billing' | 'ready_to_collect' | 'dispensed'
  isReady?: boolean
  readyAt?: string
  billingStatus?: 'pending' | 'paid'
  billPaidAt?: string
  dispensedAt?: string
  dispensedBy?: string
  pickupCounter?: string
  pickupNotificationSent?: boolean
}

export const INITIAL_PRESCRIPTIONS: PrescriptionRecord[] = [
  {
    id: 'rx-101',
    patientId: 'demo-patient',
    patientName: 'Amara Okafor',
    mrn: 'MRN-84920',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    nurseId: 'demo-nurse',
    nurseName: 'Elena Rostova, RN',
    diagnosis: 'Sinus Arrhythmia & Mild Hypertension',
    vitals: {
      bloodPressure: '128/84 mmHg',
      heartRate: '78 bpm',
      spO2: '98%',
      temperature: '98.6 °F'
    },
    medications: [
      {
        id: 'med-item-1',
        name: 'Metoprolol Succinate',
        dosage: '25mg',
        form: 'Tablet',
        frequency: 'Once Daily (Morning)',
        scheduleTimes: ['08:30 AM'],
        timingInstructions: 'After Food',
        durationDays: 14,
        instructions: 'Take 30 minutes after breakfast with plenty of water.'
      },
      {
        id: 'med-item-2',
        name: 'Atorvastatin',
        dosage: '20mg',
        form: 'Tablet',
        frequency: 'Once Daily (Night)',
        scheduleTimes: ['09:00 PM'],
        timingInstructions: 'At Bedtime',
        durationDays: 30,
        instructions: 'Take right before going to sleep.'
      }
    ],
    nurseNotes: 'Patient advised on regular pulse checks and low-sodium hydration.',
    status: 'active',
    sharedWithPharmacy: true,
    sharedWithPatient: true,
    sharedWithBilling: true,
    treatmentType: 'Doctor Consult',
    createdAt: 'Today at 09:15 AM',
    fulfillmentStatus: 'pending_prep',
    billingStatus: 'pending'
  },
  {
    id: 'rx-102',
    patientId: 'pt-104',
    patientName: 'David Gomez',
    mrn: 'MRN-84923',
    doctorId: 'demo-doctor',
    doctorName: 'Dr. Alexander Wright, MD',
    nurseId: 'demo-nurse',
    nurseName: 'Elena Rostova, RN',
    diagnosis: 'Post-CABG Recovery Stage II',
    vitals: {
      bloodPressure: '120/76 mmHg',
      heartRate: '72 bpm',
      spO2: '99%',
      temperature: '98.4 °F'
    },
    medications: [
      {
        id: 'med-item-3',
        name: 'Aspirin Cardio',
        dosage: '81mg',
        form: 'Tablet',
        frequency: 'Once Daily (Morning)',
        scheduleTimes: ['09:00 AM'],
        timingInstructions: 'After Food',
        durationDays: 30,
        instructions: 'Take after breakfast.'
      }
    ],
    nurseNotes: 'Wound healing well. Follow cardiac rehab walking schedule.',
    status: 'active',
    sharedWithPharmacy: true,
    sharedWithPatient: true,
    sharedWithBilling: true,
    treatmentType: 'Doctor Consult',
    createdAt: 'Today at 08:45 AM',
    fulfillmentStatus: 'ready_for_billing',
    isReady: true,
    readyAt: 'Today at 09:00 AM',
    billingStatus: 'paid',
    billPaidAt: 'Today at 09:20 AM'
  }
]

export function getStoredPrescriptions(): PrescriptionRecord[] {
  if (typeof window === 'undefined') return INITIAL_PRESCRIPTIONS
  try {
    const raw = localStorage.getItem('carelink_prescriptions')
    return raw ? JSON.parse(raw) : INITIAL_PRESCRIPTIONS
  } catch {
    return INITIAL_PRESCRIPTIONS
  }
}

export function savePrescriptions(prescriptions: PrescriptionRecord[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('carelink_prescriptions', JSON.stringify(prescriptions))
  }
}

export function syncPrescriptionToBillingRecord(rx: PrescriptionRecord): BillingRecord {
  const medicineItems = rx.medications.map((m) => ({
    description: `${m.name} (${m.dosage}, ${m.frequency}) - ${m.durationDays}d`,
    amount: 45.0
  }))
  const consultItem = rx.isNurseDirectCare
    ? { description: 'Nurse Direct Care & Immediate Fever Protocol', amount: 60.0 }
    : { description: 'Attending Physician Clinical Consultation Fee', amount: 120.0 }

  const allItems = [...medicineItems, consultItem]
  const totalAmount = allItems.reduce((acc, it) => acc + it.amount, 0)

  return {
    id: `bill-rx-${rx.id}`,
    invoiceNumber: `INV-RX-${rx.id.toUpperCase().replace(/[^A-Z0-9]/g, '')}`,
    patientName: rx.patientName,
    mrn: rx.mrn,
    serviceCategory: 'Pharmacy & Medicines',
    totalAmount,
    paidAmount: 0,
    balanceDue: totalAmount,
    paymentStatus: 'Pending Insurance',
    paymentMethod: 'Insurance (BlueCross)',
    date: 'Today',
    invoiceTime: rx.createdAt.includes('at') ? rx.createdAt.split('at')[1].trim() : 'Just now',
    providerName: rx.isNurseDirectCare ? rx.nurseName : rx.doctorName,
    providerRole: rx.isNurseDirectCare ? 'Registered Nurse (Urgent Care)' : 'Attending Physician',
    items: allItems,
    status: 'pending',
    createdAt: rx.createdAt
  }
}

export interface ReplacementStaffCandidate {
  id: string
  name: string
  roleSlug: string
  roleLabel: string
  department: string
  specialization?: string
}

export const BACKUP_STAFF_REPLACEMENTS: ReplacementStaffCandidate[] = [
  // Nurse Backups (for Nurse Replacement)
  {
    id: 'rep-nurse-1',
    name: 'Nurse Samantha Cole, RN',
    roleSlug: 'nurse',
    roleLabel: 'Nurse',
    department: 'Ward 4B / Inpatient Nursing',
    specialization: 'Critical Care & Bedside Vitals'
  },
  {
    id: 'rep-nurse-2',
    name: 'Nurse Kevin Brooks, BSN',
    roleSlug: 'nurse',
    roleLabel: 'Nurse',
    department: 'Outpatient Triage & Emergency Relief',
    specialization: 'Emergency Nursing & Patient Care'
  },
  {
    id: 'rep-nurse-3',
    name: 'Nurse Clara Oswald, RN',
    roleSlug: 'nurse',
    roleLabel: 'Nurse',
    department: 'Pediatrics & General Ward',
    specialization: 'Medication Administration & Vitals'
  },
  // Medicine Staff Backups (for Medicine Staff Replacement)
  {
    id: 'rep-med-1',
    name: 'Rachel Green, MLS',
    roleSlug: 'medical-staff',
    roleLabel: 'Medicine Staff',
    department: 'Central Medicine & Diagnostics',
    specialization: 'Clinical Pharmacy & Dispensing Support'
  },
  {
    id: 'rep-med-2',
    name: 'Aaron Brooks, PharmD',
    roleSlug: 'medical-staff',
    roleLabel: 'Medicine Staff',
    department: 'Central Hospital Pharmacy & Lab',
    specialization: 'Pharmacotherapy & Medication Verification'
  },
  {
    id: 'rep-med-3',
    name: 'Maya Lin, CPhT',
    roleSlug: 'medical-staff',
    roleLabel: 'Medicine Staff',
    department: 'Dispensary & Pharmaceutical Inventory',
    specialization: 'Medication Packaging & Stock Control'
  },
  // Billing Staff Backups (for Billing Staff Replacement)
  {
    id: 'rep-billing-1',
    name: 'Lisa Ray, CPC',
    roleSlug: 'billing',
    roleLabel: 'Billing Staff',
    department: 'Revenue Cycle & Claims Relief',
    specialization: 'Claims Adjudication & Insurance Reconciliation'
  },
  {
    id: 'rep-billing-2',
    name: 'Michael Chang, CPB',
    roleSlug: 'billing',
    roleLabel: 'Billing Staff',
    department: 'Patient Financial Services',
    specialization: 'Patient Accounts & Billing Gateway'
  },
  {
    id: 'rep-billing-3',
    name: 'Hannah Abbott, CPC',
    roleSlug: 'billing',
    roleLabel: 'Billing Staff',
    department: 'Invoicing & Claims Processing',
    specialization: 'ICD-10 Coding & Payment Verification'
  },
  // Receptionist Backups (for Receptionist Replacement)
  {
    id: 'rep-rec-1',
    name: 'Chloe Simmons',
    roleSlug: 'receptionist',
    roleLabel: 'Receptionist',
    department: 'Central Admissions & Front Desk',
    specialization: 'Patient Intake & Queue Management'
  },
  {
    id: 'rep-rec-2',
    name: 'Lucas Gray',
    roleSlug: 'receptionist',
    roleLabel: 'Receptionist',
    department: 'OPD Check-in & Patient Services',
    specialization: 'Registration & Appointment Scheduling'
  },
  {
    id: 'rep-rec-3',
    name: 'Emma Watson',
    roleSlug: 'receptionist',
    roleLabel: 'Receptionist',
    department: 'Admissions & Information Desk',
    specialization: 'Visitor Passes & Patient Triage Support'
  },
  // Doctor Backups (strictly for Doctor Replacement ONLY)
  {
    id: 'rep-doc-1',
    name: 'Dr. Olivia Bennett, MD',
    roleSlug: 'doctor',
    roleLabel: 'Doctor',
    department: 'Internal Medicine & Cardiology',
    specialization: 'Cardiology'
  },
  {
    id: 'rep-doc-2',
    name: 'Dr. Marcus Brody, MD',
    roleSlug: 'doctor',
    roleLabel: 'Doctor',
    department: 'General Medicine & OPD',
    specialization: 'Internal Medicine'
  }
]

export function getEligibleReplacementsForStaff(
  targetStaff: { id?: string; roleSlug?: string; roleLabel?: string; staffRole?: string; name?: string; staffName?: string } | null | undefined,
  allStaff: DemoAccount[] = []
): Array<{ id: string; name: string; roleLabel: string; department: string; roleSlug: string }> {
  if (!targetStaff) {
    // If no target specified, NEVER show doctors, patients, or admins
    const regular = allStaff
      .filter((s) => s.roleSlug !== 'patient' && s.roleSlug !== 'admin' && s.roleSlug !== 'doctor' && !s.name.startsWith('Dr.'))
      .map((s) => ({
        id: s.id,
        name: s.name,
        roleLabel: s.roleLabel,
        department: s.department,
        roleSlug: s.roleSlug
      }))
    const backups = BACKUP_STAFF_REPLACEMENTS.filter((b) => b.roleSlug !== 'doctor' && !b.name.startsWith('Dr.'))
    const combined = [...regular, ...backups]
    const seen = new Set<string>()
    return combined.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }

  const roleStr = (targetStaff.roleSlug || targetStaff.roleLabel || targetStaff.staffRole || '').toLowerCase()
  const nameStr = (targetStaff.name || targetStaff.staffName || '').toLowerCase()
  const isTargetDoctor = roleStr === 'doctor' || roleStr.includes('doctor') || roleStr.includes('physician') || nameStr.startsWith('dr.')

  if (isTargetDoctor) {
    // Only physicians/doctors can replace a doctor
    const regularDoc = allStaff
      .filter((s) => s.id !== targetStaff.id && (s.roleSlug === 'doctor' || s.roleLabel.toLowerCase().includes('doctor') || s.name.startsWith('Dr.')))
      .map((s) => ({
        id: s.id,
        name: s.name,
        roleLabel: s.roleLabel,
        department: s.department,
        roleSlug: s.roleSlug
      }))
    const backupDocs = BACKUP_STAFF_REPLACEMENTS.filter((b) => b.roleSlug === 'doctor' || b.name.startsWith('Dr.'))
    const combined = [...regularDoc, ...backupDocs]
    const seen = new Set<string>()
    return combined.filter((c) => {
      if (seen.has(c.id)) return false
      seen.add(c.id)
      return true
    })
  }

  // TARGET IS A NON-DOCTOR (Billing Staff, Nurse, Receptionist, Medicine Staff, etc.)
  // CRITICAL REQUIREMENT: Doctors' names MUST NOT be shown in replacement for any of these staff!
  const isNurse = roleStr === 'nurse' || roleStr.includes('nurse')
  const isMedicineStaff = roleStr === 'medical-staff' || roleStr.includes('medicine') || roleStr.includes('medical') || roleStr.includes('pharm') || roleStr.includes('lab')
  const isBilling = roleStr === 'billing' || roleStr.includes('billing') || roleStr.includes('claim') || roleStr.includes('finance')
  const isReceptionist = roleStr === 'receptionist' || roleStr.includes('reception') || roleStr.includes('front') || roleStr.includes('intake')

  const regularCandidates = allStaff
    .filter((s) => {
      if (s.id === targetStaff.id) return false
      if (s.roleSlug === 'patient' || s.roleSlug === 'admin') return false
      // STRICT FILTER: NEVER allow any doctor to be a replacement for nurse, medicine staff, billing staff, receptionist
      if (s.roleSlug === 'doctor' || s.name.startsWith('Dr.') || s.roleLabel.toLowerCase().includes('doctor') || s.roleLabel.toLowerCase().includes('physician')) {
        return false
      }
      if (isNurse) return s.roleSlug === 'nurse'
      if (isMedicineStaff) return s.roleSlug === 'medical-staff'
      if (isBilling) return s.roleSlug === 'billing'
      if (isReceptionist) return s.roleSlug === 'receptionist'
      return true
    })
    .map((s) => ({
      id: s.id,
      name: s.name,
      roleLabel: s.roleLabel,
      department: s.department,
      roleSlug: s.roleSlug
    }))

  const backupCandidates = BACKUP_STAFF_REPLACEMENTS.filter((b) => {
    if (b.id === targetStaff.id) return false
    // STRICT FILTER: NEVER allow any doctor
    if (b.roleSlug === 'doctor' || b.name.startsWith('Dr.') || b.roleLabel.toLowerCase().includes('doctor') || b.roleLabel.toLowerCase().includes('physician')) {
      return false
    }
    if (isNurse) return b.roleSlug === 'nurse'
    if (isMedicineStaff) return b.roleSlug === 'medical-staff'
    if (isBilling) return b.roleSlug === 'billing'
    if (isReceptionist) return b.roleSlug === 'receptionist'
    return true
  })

  const combined = [...regularCandidates, ...backupCandidates]
  const seen = new Set<string>()
  return combined.filter((c) => {
    if (seen.has(c.id)) return false
    seen.add(c.id)
    return true
  })
}


