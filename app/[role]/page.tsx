import { notFound } from 'next/navigation'
import { roles } from '@/components/carelink-header'
import { RoleDashboard } from '@/components/role-dashboard'
import { AdminDashboard } from '@/components/admin-dashboard'
import { DoctorDashboard } from '@/components/doctor-dashboard'
import { NurseDashboard } from '@/components/nurse-dashboard'
import { MedicineStaffDashboard } from '@/components/medicine-staff-dashboard'

export function generateStaticParams() {
  return roles.map((role) => ({ role: role.path.slice(1) }))
}

export default async function RolePage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params
  const current = roles.find((item) => item.path.slice(1) === role)
  if (!current) notFound()

  if (role === 'admin') {
    return <AdminDashboard />
  }

  if (role === 'doctor') {
    return <DoctorDashboard />
  }

  if (role === 'nurse') {
    return <NurseDashboard />
  }

  if (role === 'medical-staff') {
    return <MedicineStaffDashboard />
  }

  return <RoleDashboard roleSlug={role} />
}

