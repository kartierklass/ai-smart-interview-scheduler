'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Calendar, CheckCircle2, RefreshCw } from 'lucide-react'
import { signOut, signIn } from 'next-auth/react'

export default function CalendarAuthStatus() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return null
  }

  if (!session?.user) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-orange-900">
            <AlertTriangle className="h-5 w-5" />
            Authentication Required
          </CardTitle>
          <CardDescription className="text-orange-700">
            Sign in to enable Google Calendar integration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => signIn('google')} className="w-full">
            Sign In with Google
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Check for calendar access
  const hasCalendarAccess = session.accessToken && !session.error
  
  if (!hasCalendarAccess) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-red-900">
            <Calendar className="h-5 w-5" />
            Calendar Access Required
          </CardTitle>
          <CardDescription className="text-red-700">
            {session.error === 'RefreshAccessTokenError' 
              ? 'Your calendar access has expired. Please re-authenticate to continue.'
              : 'Calendar permissions are needed to create interview events. Please sign in again and grant calendar access.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-red-600">
            <AlertTriangle className="h-4 w-4" />
            <span>Calendar integration is disabled</span>
          </div>
          <Button 
            onClick={() => {
              signOut({ callbackUrl: '/dashboard' })
            }}
            variant="destructive" 
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Re-authenticate with Calendar Access
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-green-200 bg-green-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-green-900">
          <CheckCircle2 className="h-5 w-5" />
          Calendar Access Active
        </CardTitle>
        <CardDescription className="text-green-700">
          Your Google Calendar is connected and ready for interview scheduling
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Calendar className="h-3 w-3 mr-1" />
              Connected
            </Badge>
            <span className="text-sm text-green-700">
              Signed in as {session.user.email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
