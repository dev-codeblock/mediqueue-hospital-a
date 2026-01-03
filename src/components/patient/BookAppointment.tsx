import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { User, Doctor, Appointment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  SPECIALIZATIONS,
  formatDate,
  isDoctorAvailableOnDate,
} from "@/lib/appointment-utils";
import {
  MagnifyingGlass,
  Clock,
  CheckCircle,
  XCircle,
  Stethoscope,
} from "@phosphor-icons/react";
import { doctorsAPI, appointmentsAPI } from "@/lib/api-client";

interface BookAppointmentProps {
  user: User;
}

export default function BookAppointment({ user }: BookAppointmentProps) {
  const queryClient = useQueryClient();

  const { data: doctors = [], isLoading: loadingDoctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => doctorsAPI.getAll(),
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments"],
    queryFn: () => appointmentsAPI.getAll(),
  });

  const createAppointmentMutation = useMutation({
    mutationFn: (data: { doctorId: string; date: string; time: string }) =>
      appointmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  const filteredDoctors = selectedSpecialization
    ? doctors.filter((d) => d.specialization === selectedSpecialization)
    : [];

  const handleDoctorSelect = async (doctorId: string) => {
    const doctor = doctors.find((d) => d.id === doctorId);
    setSelectedDoctor(doctor || null);
    setSelectedDate(undefined);
    setSelectedTime("");
    setAvailableSlots([]);
  };

  const handleDateSelect = async (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime("");

    if (date && selectedDoctor) {
      try {
        const slots = await doctorsAPI.getAvailableSlots(
          selectedDoctor.id,
          formatDate(date)
        );
        setAvailableSlots(slots);
      } catch (error) {
        toast.error("Failed to fetch available slots");
        setAvailableSlots([]);
      }
    } else {
      setAvailableSlots([]);
    }
  };

  const handleBookAppointment = () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      toast.error("Please select all required fields");
      return;
    }

    const dateStr = formatDate(selectedDate);

    createAppointmentMutation.mutate(
      {
        doctorId: selectedDoctor.id,
        date: dateStr,
        time: selectedTime,
      },
      {
        onSuccess: () => {
          toast.success(
            "Appointment request sent! Waiting for doctor approval."
          );
          setSelectedSpecialization("");
          setSelectedDoctor(null);
          setSelectedDate(undefined);
          setSelectedTime("");
          setAvailableSlots([]);
        },
        onError: (error: any) => {
          toast.error(
            error.response?.data?.message || "Failed to book appointment"
          );
        },
      }
    );
  };

  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      return true;
    }
    if (!selectedDoctor) {
      return true;
    }
    return !isDoctorAvailableOnDate(selectedDoctor, formatDate(date));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold mb-2 block">
            <MagnifyingGlass size={18} className="inline mr-2" />
            Select Specialization
          </label>
          <Select
            value={selectedSpecialization}
            onValueChange={setSelectedSpecialization}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a specialization" />
            </SelectTrigger>
            <SelectContent>
              {SPECIALIZATIONS.map((spec) => (
                <SelectItem key={spec} value={spec}>
                  {spec}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedSpecialization && (
          <div>
            <label className="text-sm font-semibold mb-2 block">
              <Stethoscope size={18} className="inline mr-2" />
              Select Doctor
            </label>
            {filteredDoctors.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No doctors available for this specialization.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {filteredDoctors.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className={`cursor-pointer transition-all ${
                      selectedDoctor?.id === doctor.id
                        ? "ring-2 ring-primary"
                        : "hover:border-accent"
                    }`}
                    onClick={() => handleDoctorSelect(doctor.id)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {doctor.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <CardTitle className="text-base">
                            {doctor.name}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            {doctor.specialization}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        Max {doctor.maxAppointmentsPerDay} appointments/day
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {selectedDoctor && (
          <div>
            <label className="text-sm font-semibold mb-2 block">
              Select Date
            </label>
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                fromDate={new Date()}
                className="rounded-md border"
              />
            </div>
          </div>
        )}

        {selectedDate && availableSlots.length > 0 && (
          <div>
            <label className="text-sm font-semibold mb-2 block">
              <Clock size={18} className="inline mr-2" />
              Select Time Slot
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {availableSlots.map((slot) => (
                <Button
                  key={slot.time}
                  variant={selectedTime === slot.time ? "default" : "outline"}
                  disabled={!slot.available}
                  onClick={() => setSelectedTime(slot.time)}
                  className="h-auto py-3"
                >
                  <div className="flex items-center gap-2">
                    {slot.available ? (
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="text-accent"
                      />
                    ) : (
                      <XCircle
                        size={16}
                        weight="fill"
                        className="text-muted-foreground"
                      />
                    )}
                    <span className="text-sm">{slot.time}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedDate && availableSlots.length === 0 && (
          <Alert>
            <AlertDescription>
              No available slots for this date. Please choose another date.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {selectedDoctor && selectedDate && selectedTime && (
        <Card className="bg-secondary border-accent">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Appointment Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <span className="font-semibold">Doctor:</span>{" "}
              {selectedDoctor.name}
            </p>
            <p>
              <span className="font-semibold">Specialization:</span>{" "}
              {selectedDoctor.specialization}
            </p>
            <p>
              <span className="font-semibold">Date:</span>{" "}
              {selectedDate.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p>
              <span className="font-semibold">Time:</span> {selectedTime}
            </p>
          </CardContent>
        </Card>
      )}

      <Button
        onClick={handleBookAppointment}
        disabled={!selectedDoctor || !selectedDate || !selectedTime}
        className="w-full"
        size="lg"
      >
        Book Appointment
      </Button>
    </div>
  );
}
