import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, Doctor, Appointment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOut, Users, CalendarDots, Stethoscope, Database } from '@phosphor-icons/react'
import ManageDoctors from './ManageDoctors'
import ViewAllAppointments from './ViewAllAppointments'
import DatabaseStatus from './DatabaseStatus'

interface AdminDashboardProps {
  user: User
  onLogout: () => void
}

export default function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const [doctors] = useKV<Doctor[]>('doctors', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])

  const totalDoctors = doctors?.length || 0
  const totalAppointments = appointments?.length || 0
  const pendingAppointments = appointments?.filter((apt) => apt.status === 'pending').length || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CareConnect</h1>
              <p className="text-sm text-muted-foreground">Admin Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="icon" onClick={onLogout}>
                <SignOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Doctors</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Stethoscope size={32} className="text-primary" />
                {totalDoctors}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Appointments</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <CalendarDots size={32} className="text-accent" />
                {totalAppointments}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Pending Approvals</CardDescription>
              <CardTitle className="text-3xl flex items-center gap-2">
                <Users size={32} className="text-[oklch(0.75_0.15_80)]" />
                {pendingAppointments}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Management</CardTitle>
          </CardHeader>
          </CardHeader>
            <Tabs defaultValue="doctors">
              <TabsList className="grid w-full grid-cols-3">
                  <Stethoscope size={18} className="mr-2" />
                <TabsTrigger value="doctors">
                </TabsTrigger>
                <TabsTrigger value="appointments">
                  <CalendarDots size={18} className="mr-2" />
                  All Appointments
                </TabsTrigger>
                <TabsTrigger value="database">
                  <Database size={18} className="mr-2" />
                </TabsTrigger>
              </TabsList>

              <TabsContent value="doctors" className="mt-6">
              </TabsList>ctors />

              <TabsContent value="doctors" className="mt-6">
                <ManageDoctors />
              </TabsContent>


              <TabsContent value="database" className="mt-6">
                <DatabaseStatus />

              <TabsContent value="database" className="mt-6">
                <DatabaseStatus />
              </TabsContent>
      </main>
    </div>
  )
}
  )}