import { useQuery } from "@tanstack/react-query";
import { Appointment } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getStatusColor } from "@/lib/appointment-utils";
import {
  CalendarDots,
  Clock,
  UserCircle,
  Stethoscope,
} from "@phosphor-icons/react";
import { appointmentsAPI } from "@/lib/api-client";

export default function ViewAllAppointments() {
  const { data: appointments, isLoading } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsAPI.getAll(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const appointmentsList = Array.isArray(appointments) ? appointments : [];

  const sortedAppointments = [...appointmentsList].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const pendingAppointments = sortedAppointments.filter(
    (apt) => apt.status === "pending"
  );
  const acceptedAppointments = sortedAppointments.filter(
    (apt) => apt.status === "accepted"
  );
  const completedAppointments = sortedAppointments.filter(
    (apt) => apt.status === "completed"
  );
  const rejectedAppointments = sortedAppointments.filter(
    (apt) => apt.status === "rejected"
  );

  if (appointmentsList.length === 0) {
    return (
      <div className="text-center py-12">
        <CalendarDots
          size={48}
          className="mx-auto text-muted-foreground mb-4"
        />
        <p className="text-muted-foreground">No appointments in the system</p>
      </div>
    );
  }

  return (
    <div>
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({sortedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="accepted">
            Accepted ({acceptedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedAppointments.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedAppointments.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <AppointmentList appointments={sortedAppointments} />
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          <AppointmentList appointments={pendingAppointments} />
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          <AppointmentList appointments={acceptedAppointments} />
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <AppointmentList appointments={completedAppointments} />
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          <AppointmentList appointments={rejectedAppointments} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AppointmentList({ appointments }: { appointments: Appointment[] }) {
  if (appointments.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No appointments found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => (
        <AdminAppointmentCard key={appointment.id} appointment={appointment} />
      ))}
    </div>
  );
}

function AdminAppointmentCard({ appointment }: { appointment: Appointment }) {
  const date = new Date(appointment.date);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-6 flex-1">
            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-accent text-accent-foreground">
                  {appointment.patientName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {appointment.patientName}
                </CardTitle>
                <CardDescription className="text-xs">
                  <UserCircle size={14} className="inline mr-1" />
                  Patient
                </CardDescription>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {appointment.doctorName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">
                  {appointment.doctorName}
                </CardTitle>
                <CardDescription className="text-xs">
                  <Stethoscope size={14} className="inline mr-1" />
                  {appointment.doctorSpecialization}
                </CardDescription>
              </div>
            </div>
          </div>

          <Badge className={getStatusColor(appointment.status)}>
            {appointment.status.charAt(0).toUpperCase() +
              appointment.status.slice(1)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CalendarDots size={16} />
            <span>
              {date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
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
  );
}
