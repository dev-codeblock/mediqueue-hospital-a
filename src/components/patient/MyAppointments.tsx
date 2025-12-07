import { Appointment } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { getStatusColor } from '@/lib/appointment-utils'
import { CalendarDots, Clock, Stethoscope } from '@phosphor-icons/react'

interface MyAppointmentsProps {
  appointments: Appointment[]
}

export default function MyAppointments({ appointments }: MyAppointmentsProps) {
  const sortedAppointments = [...appointments].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  const upcomingAppointments = sortedAppointments.filter(
    (apt) => apt.status === 'accepted' || apt.status === 'pending'
  )

  const pastAppointments = sortedAppointments.filter(
    (apt) => apt.status === 'completed' || apt.status === 'rejected'
  )

  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDots size={48} className="mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No appointments yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Book your first appointment to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {upcomingAppointments.length > 0 && (
        <div>
          <h3 className="font-semibold mb-4">Upcoming & Pending</h3>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      )}

      {pastAppointments.length > 0 && (
        <>
          {upcomingAppointments.length > 0 && <Separator className="my-6" />}
          <div>
            <h3 className="font-semibold mb-4">Past Appointments</h3>
            <div className="space-y-4">
              {pastAppointments.map((appointment) => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.date)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {appointment.doctorName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">{appointment.doctorName}</CardTitle>
              <CardDescription className="text-xs">
                <Stethoscope size={14} className="inline mr-1" />
                {appointment.doctorSpecialization}
              </CardDescription>
            </div>
          </div>
          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
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
      </CardContent>
    </Card>
  )
}
