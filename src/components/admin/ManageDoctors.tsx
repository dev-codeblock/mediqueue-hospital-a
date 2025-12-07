import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Doctor } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { generateId, SPECIALIZATIONS, DEFAULT_TIME_SLOTS, DAYS_OF_WEEK } from '@/lib/appointment-utils'
import { Plus, Pencil, Trash } from '@phosphor-icons/react'

export default function ManageDoctors() {
  const [doctors, setDoctors] = useKV<Doctor[]>('doctors', [])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)

  const handleAddDoctor = (doctor: Omit<Doctor, 'id'>) => {
    const newDoctor: Doctor = {
      ...doctor,
      id: generateId(),
    }
    setDoctors((current) => [...(current || []), newDoctor])
    toast.success('Doctor added successfully')
    setIsAddDialogOpen(false)
  }

  const handleUpdateDoctor = (updatedDoctor: Doctor) => {
    setDoctors((current) =>
      (current || []).map((d) => (d.id === updatedDoctor.id ? updatedDoctor : d))
    )
    toast.success('Doctor updated successfully')
    setEditingDoctor(null)
  }

  const handleDeleteDoctor = (doctorId: string) => {
    setDoctors((current) => (current || []).filter((d) => d.id !== doctorId))
    toast.success('Doctor removed')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {doctors?.length || 0} doctor(s) registered
        </p>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={18} className="mr-2" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Configure doctor details and availability
              </DialogDescription>
            </DialogHeader>
            <DoctorForm onSubmit={handleAddDoctor} />
          </DialogContent>
        </Dialog>
      </div>

      {(!doctors || doctors.length === 0) ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No doctors added yet</p>
          <p className="text-sm text-muted-foreground mt-1">Click "Add Doctor" to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {doctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Avatar>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {doctor.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{doctor.name}</CardTitle>
                      <CardDescription className="text-xs">{doctor.email}</CardDescription>
                      <Badge className="mt-2" variant="secondary">
                        {doctor.specialization}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-xs text-muted-foreground mb-4">
                  <p>Max appointments/day: {doctor.maxAppointmentsPerDay}</p>
                  <p>Available days: {doctor.availableDays.length} day(s)</p>
                  <p>Time slots: {doctor.availableTimeSlots.length} slot(s)</p>
                </div>
                <div className="flex gap-2">
                  <Dialog
                    open={editingDoctor?.id === doctor.id}
                    onOpenChange={(open) => !open && setEditingDoctor(null)}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingDoctor(doctor)}
                      >
                        <Pencil size={16} className="mr-2" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Edit Doctor</DialogTitle>
                        <DialogDescription>Update doctor details and availability</DialogDescription>
                      </DialogHeader>
                      <DoctorForm
                        initialData={doctor}
                        onSubmit={handleUpdateDoctor}
                      />
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteDoctor(doctor.id)}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

interface DoctorFormProps {
  initialData?: Doctor
  onSubmit: (doctor: any) => void
}

function DoctorForm({ initialData, onSubmit }: DoctorFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [email, setEmail] = useState(initialData?.email || '')
  const [specialization, setSpecialization] = useState(initialData?.specialization || '')
  const [maxAppointments, setMaxAppointments] = useState(
    initialData?.maxAppointmentsPerDay.toString() || '10'
  )
  const [selectedDays, setSelectedDays] = useState<number[]>(
    initialData?.availableDays || [1, 2, 3, 4, 5]
  )
  const [selectedSlots, setSelectedSlots] = useState<string[]>(
    initialData?.availableTimeSlots || DEFAULT_TIME_SLOTS
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedDays.length === 0) {
      toast.error('Please select at least one available day')
      return
    }

    if (selectedSlots.length === 0) {
      toast.error('Please select at least one time slot')
      return
    }

    const doctorData = {
      ...(initialData?.id && { id: initialData.id }),
      name,
      email,
      specialization,
      maxAppointmentsPerDay: parseInt(maxAppointments),
      availableDays: selectedDays,
      availableTimeSlots: selectedSlots,
      unavailableDates: initialData?.unavailableDates || [],
    }

    onSubmit(doctorData)
  }

  const toggleDay = (day: number) => {
    setSelectedDays((current) =>
      current.includes(day) ? current.filter((d) => d !== day) : [...current, day]
    )
  }

  const toggleSlot = (slot: string) => {
    setSelectedSlots((current) =>
      current.includes(slot) ? current.filter((s) => s !== slot) : [...current, slot]
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="doctor-name">Full Name</Label>
          <Input
            id="doctor-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-email">Email</Label>
          <Input
            id="doctor-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doctor-spec">Specialization</Label>
          <Select value={specialization} onValueChange={setSpecialization} required>
            <SelectTrigger id="doctor-spec">
              <SelectValue placeholder="Choose specialization" />
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

        <div className="space-y-2">
          <Label htmlFor="max-appointments">Max Appointments Per Day</Label>
          <Input
            id="max-appointments"
            type="number"
            min="1"
            max="50"
            value={maxAppointments}
            onChange={(e) => setMaxAppointments(e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Available Days</Label>
          <div className="grid grid-cols-2 gap-2">
            {DAYS_OF_WEEK.map((day, index) => (
              <div key={day} className="flex items-center space-x-2">
                <Checkbox
                  id={`day-${index}`}
                  checked={selectedDays.includes(index)}
                  onCheckedChange={() => toggleDay(index)}
                />
                <label
                  htmlFor={`day-${index}`}
                  className="text-sm cursor-pointer"
                >
                  {day}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Available Time Slots</Label>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-md">
            {DEFAULT_TIME_SLOTS.map((slot) => (
              <div key={slot} className="flex items-center space-x-2">
                <Checkbox
                  id={`slot-${slot}`}
                  checked={selectedSlots.includes(slot)}
                  onCheckedChange={() => toggleSlot(slot)}
                />
                <label
                  htmlFor={`slot-${slot}`}
                  className="text-xs cursor-pointer"
                >
                  {slot}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full">
        {initialData ? 'Update Doctor' : 'Add Doctor'}
      </Button>
    </form>
  )
}
