import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User, Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignOut, CalendarDots, UserCircle } from "@phosphor-icons/react";
import BookAppointment from "./BookAppointment";
import MyAppointments from "./MyAppointments";
import { appointmentsAPI } from "@/lib/api-client";

interface PatientDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function PatientDashboard({
  user,
  onLogout,
}: PatientDashboardProps) {
  const [activeTab, setActiveTab] = useState("book");

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", "my"],
    queryFn: () => appointmentsAPI.getMyAppointments(),
  });

  const myAppointments = appointments || [];
  const upcomingCount = myAppointments.filter(
    (apt) => apt.status === "accepted" || apt.status === "pending",
  ).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-[oklch(0.96_0.02_200)] via-background to-[oklch(0.96_0.03_250)]">
      <header className="sticky top-0 z-10 border-b bg-card border-border">
        <div className="px-4 py-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                CareConnect
              </h1>
              <p className="text-sm text-muted-foreground">Patient Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="icon" onClick={onLogout}>
                <SignOut size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 py-8 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid gap-6 mb-8 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Upcoming Appointments</CardDescription>
              <CardTitle className="text-3xl">{upcomingCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Appointments</CardDescription>
              <CardTitle className="text-3xl">
                {myAppointments.length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Completed</CardDescription>
              <CardTitle className="text-3xl">
                {
                  myAppointments.filter((apt) => apt.status === "completed")
                    .length
                }
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Appointments</CardTitle>
            <CardDescription>
              Book new appointments or view your schedule
            </CardDescription>
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
  );
}
