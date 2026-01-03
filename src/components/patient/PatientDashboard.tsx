import { useState } from 'react'
import { useKV } from '@/hooks/use-kv'
import { User, Doctor, Appointment } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { SignOut, CalendarDots, UserCircle } from '@phosphor-icons/react'
import BookAppointment from './BookAppointment'
import MyAppointments from './MyAppointments'

interface PatientDashboardProps {
  user: User
  onLogout: () => void
}

export default function PatientDashboard({ user, onLogout }: PatientDashboardProps) {
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [activeTab, setActiveTab] = useState('book')

  const myAppointments = appointments?.filter((apt) => apt.patientId === user.id) || []
  const upcomingCount = myAppointments.filter(
    (apt) => apt.status === 'accepted' || apt.status === 'pending'
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CareConnect</h1>
              <p className="text-sm text-muted-foreground">Patient Portal</p>
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
              <CardDescription>Upcoming Appointments</CardDescription>
              <CardTitle className="text-3xl">{upcomingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Appointments</CardDescription>
              <CardTitle className="text-3xl">{myAppointments.length}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {myAppointments.filter((apt) => apt.status === 'completed').length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Appointments</CardTitle>
            <CardDescription>Book new appointments or view your schedule</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="book">
                  <CalendarDots size={18} className="mr-2" />
                  Book Appointment
                </TabsTrigger>
                <TabsTrigger value="my-appointments">
                  <UserCircle size={18} className="mr-2" />
                  My Appointments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="book" className="mt-6">
                <BookAppointment user={user} />
              </TabsContent>

              <TabsContent value="my-appointments" className="mt-6">
                <MyAppointments appointments={myAppointments} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
