import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { User, Appointment, AppointmentStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { getStatusColor } from '@/lib/appointment-utils'
import { toast } from 'sonner'
import { SignOut, CalendarDots, Clock, UserCircle, CheckCircle, XCircle } from '@phosphor-icons/react'

interface DoctorDashboardProps {
  user: User
  onLogout: () => void
}

export default function DoctorDashboard({ user, onLogout }: DoctorDashboardProps) {
  const [appointments, setAppointments] = useKV<Appointment[]>('appointments', [])

  const myAppointments = appointments?.filter((apt) => apt.doctorId === user.id) || []
  const pendingCount = myAppointments.filter((apt) => apt.status === 'pending').length
  const acceptedCount = myAppointments.filter((apt) => apt.status === 'accepted').length
  const completedCount = myAppointments.filter((apt) => apt.status === 'completed').length

  const handleUpdateStatus = (appointmentId: string, newStatus: AppointmentStatus) => {
    setAppointments((current) =>
      (current || []).map((apt) =>
        apt.id === appointmentId ? { ...apt, status: newStatus } : apt
      )
    )

    const statusMessages: Record<AppointmentStatus, string> = {
      pending: 'Appointment marked as pending',
      accepted: 'Appointment accepted',
      rejected: 'Appointment rejected',
      completed: 'Appointment marked as completed',
    }

    toast.success(statusMessages[newStatus])
  }

  const pendingAppointments = myAppointments.filter((apt) => apt.status === 'pending')
  const upcomingAppointments = myAppointments.filter((apt) => apt.status === 'accepted')
  const pastAppointments = myAppointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'rejected'
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">CareConnect</h1>
              <p className="text-sm text-muted-foreground">Doctor Portal</p>
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
              <CardDescription>Pending Requests</CardDescription>
              <CardTitle className="text-3xl">{pendingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Upcoming Appointments</CardDescription>
              <CardTitle className="text-3xl">{acceptedCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">{completedCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Management</CardTitle>
            <CardDescription>Review and manage your appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="pending">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="pending">
                  Pending ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="upcoming">
                  Upcoming ({acceptedCount})
                </TabsTrigger>
                <TabsTrigger value="past">
                  Past ({pastAppointments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending" className="mt-6">
                {pendingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDots size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingAppointments.map((appointment) => (
                      <DoctorAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        showActions
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="upcoming" className="mt-6">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDots size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No upcoming appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {upcomingAppointments.map((appointment) => (
                      <DoctorAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                        showComplete
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="past" className="mt-6">
                {pastAppointments.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDots size={48} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No past appointments</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pastAppointments.map((appointment) => (
                      <DoctorAppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdateStatus={handleUpdateStatus}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

interface DoctorAppointmentCardProps {
  appointment: Appointment
  onUpdateStatus: (id: string, status: AppointmentStatus) => void
  showActions?: boolean
  showComplete?: boolean
}

function DoctorAppointmentCard({
  appointment,
  onUpdateStatus,
  showActions,
  showComplete,
}: DoctorAppointmentCardProps) {
  const date = new Date(appointment.date)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <AvatarFallback className="bg-accent text-accent-foreground">
                {appointment.patientName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">{appointment.patientName}</CardTitle>
              <CardDescription className="text-xs">
                <UserCircle size={14} className="inline mr-1" />
                Patient
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDots size={16} />
            <span>
              {date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={16} />
            <span>{appointment.time}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => onUpdateStatus(appointment.id, 'accepted')}
              className="flex-1"
            >
              <CheckCircle size={16} className="mr-2" />
              Accept
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onUpdateStatus(appointment.id, 'rejected')}
              className="flex-1"
            >
              <XCircle size={16} className="mr-2" />
              Reject
            </Button>
          </div>
        )}

        {showComplete && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onUpdateStatus(appointment.id, 'completed')}
            className="w-full"
          >
            <CheckCircle size={16} className="mr-2" />
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
