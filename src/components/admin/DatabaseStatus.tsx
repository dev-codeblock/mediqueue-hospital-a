import { useState, useEffect } from 'react'
import { useKV } from '@/hooks/use-kv'
import { User, Doctor, Appointment } from '@/lib/types'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { resetDatabase } from '@/lib/database'
import { toast } from 'sonner'
import { Database, ArrowClockwise, CheckCircle } from '@phosphor-icons/react'

export default function DatabaseStatus() {
  const [users] = useKV<User[]>('users', [])
  const [doctors] = useKV<Doctor[]>('doctors', [])
  const [appointments] = useKV<Appointment[]>('appointments', [])
  const [isResetting, setIsResetting] = useState(false)

  const handleResetDatabase = async () => {
    if (!confirm('Are you sure you want to reset the database? This will delete all data except demo accounts.')) {
      return
    }

    setIsResetting(true)
    try {
      await resetDatabase()
      toast.success('Database reset successfully!')
      window.location.reload()
    } catch (error) {
      toast.error('Failed to reset database')
      setIsResetting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle size={18} className="text-accent" />
        <AlertDescription>
          Database is active and running on persistent storage
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-3xl">{users?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Patients: {users?.filter(u => u.role === 'patient').length || 0}</p>
              <p>Doctors: {users?.filter(u => u.role === 'doctor').length || 0}</p>
              <p>Admins: {users?.filter(u => u.role === 'admin').length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Doctors</CardDescription>
            <CardTitle className="text-3xl">{doctors?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground">
              <p>Active schedules: {doctors?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Appointments</CardDescription>
            <CardTitle className="text-3xl">{appointments?.length || 0}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Pending: {appointments?.filter(a => a.status === 'pending').length || 0}</p>
              <p>Accepted: {appointments?.filter(a => a.status === 'accepted').length || 0}</p>
              <p>Completed: {appointments?.filter(a => a.status === 'completed').length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Database Management</CardTitle>
          <CardDescription>
            Reset the database to initial state with demo data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleResetDatabase}
            disabled={isResetting}
            variant="destructive"
            size="sm"
          >
            <ArrowClockwise size={16} className="mr-2" />
            {isResetting ? 'Resetting...' : 'Reset Database'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
