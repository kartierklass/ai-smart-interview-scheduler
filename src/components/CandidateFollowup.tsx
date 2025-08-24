'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, Mail, Calendar, User, Briefcase, CheckCircle, XCircle, Loader2, MessageSquare } from "lucide-react"
import { toast } from "sonner"
import CandidateDetailsSheet from "./CandidateDetailsSheet"

interface Interview {
  id: string
  candidateName: string
  candidateEmail: string
  jobRole: string
  interviewerName: string
  interviewerEmail: string
  date: string
  time: string
  duration: number
  status: string
  createdAt: any
}

export default function CandidateFollowup() {
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingEmail, setGeneratingEmail] = useState<string | null>(null)
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string
    body: string
    type: 'offer' | 'rejection'
    candidate: string
  } | null>(null)
  const [addingTestData, setAddingTestData] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState<Interview | null>(null)
  const [candidateSheetOpen, setCandidateSheetOpen] = useState(false)

  useEffect(() => {
    let unsubscribe: (() => void) | null = null
    
    const setupFirestoreListener = async () => {
      try {
        const q = query(
          collection(db, 'interviews'), 
          orderBy('createdAt', 'desc')
        )
        
        unsubscribe = onSnapshot(q, 
          (snapshot) => {
            try {
              const interviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
              })) as Interview[]
              
              setInterviews(interviewsData)
              setLoading(false)
            } catch (dataError) {
              console.error('Error processing interview data:', dataError)
              setInterviews([])
              setLoading(false)
            }
          }, 
          (error) => {
            console.error('Firestore listener error:', error)
            
            // Handle specific Firebase errors gracefully
            if (error.code === 'permission-denied') {
              console.warn('Firebase permissions not set up for interviews collection')
              toast.error("Database permissions needed", {
                description: "Please check Firebase security rules for the interviews collection."
              })
            } else if (error.code === 'unavailable') {
              console.warn('Firebase temporarily unavailable')
              toast.error("Database temporarily unavailable", {
                description: "Please try again in a moment."
              })
            } else {
              console.warn('Firebase error (collection may not exist yet):', error.message)
              // Don't show error toast for missing collection - it's normal when no interviews exist yet
            }
            
            setInterviews([])
            setLoading(false)
          }
        )
      } catch (setupError) {
        console.error('Error setting up Firestore listener:', setupError)
        setInterviews([])
        setLoading(false)
      }
    }

    setupFirestoreListener()

    return () => {
      if (unsubscribe) {
        try {
          unsubscribe()
        } catch (cleanupError) {
          console.error('Error cleaning up Firestore listener:', cleanupError)
        }
      }
    }
  }, [])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const generateEmail = async (interview: Interview, emailType: 'offer' | 'rejection') => {
    const emailKey = `${interview.id}-${emailType}`
    setGeneratingEmail(emailKey)
    
    try {
      const loadingToast = toast.loading(`Generating ${emailType} email...`, {
        description: `Creating professional email draft for ${interview.candidateName}`
      })

      const response = await fetch('/api/generate-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          candidateName: interview.candidateName,
          jobRole: interview.jobRole,
          interviewerName: interview.interviewerName,
          emailType: emailType,
          interviewDate: interview.date,
          interviewTime: interview.time
        })
      })

      const result = await response.json()
      
      toast.dismiss(loadingToast)

      if (!response.ok) {
        throw new Error(result.details || result.error || `Failed to generate ${emailType} email`)
      }

      if (result.success) {
        setGeneratedEmail({
          subject: result.email.subject,
          body: result.email.body,
          type: emailType,
          candidate: interview.candidateName
        })
        setEmailDialogOpen(true)
        
        toast.success(`${emailType === 'offer' ? 'Offer' : 'Rejection'} email generated!`, {
          description: "Professional email draft is ready for review"
        })
      } else {
        throw new Error(result.details || `Failed to generate ${emailType} email`)
      }

    } catch (error) {
      console.error(`Email generation error:`, error)
      
      toast.error(`Failed to generate ${emailType} email`, {
        description: error instanceof Error ? error.message : "Please try again"
      })
    } finally {
      setGeneratingEmail(null)
    }
  }

  const copyToClipboard = async (text: string, type: 'subject' | 'body') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${type === 'subject' ? 'Subject' : 'Email body'} copied!`, {
        description: "Ready to paste into your email client"
      })
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const handleCandidateClick = (interview: Interview) => {
    setSelectedCandidate(interview)
    setCandidateSheetOpen(true)
  }

  const handleCloseSheet = () => {
    setCandidateSheetOpen(false)
    setSelectedCandidate(null)
  }

  const addTestData = async () => {
    setAddingTestData(true)
    try {
      const testInterviews = [
        {
          candidateId: 'test-1',
          candidateName: 'John Smith',
          candidateEmail: 'john.smith@email.com',
          interviewerId: 'test-interviewer-1',
          interviewerName: 'Alice Johnson',
          interviewerEmail: 'alice.johnson@company.com',
          jobRole: 'Senior Software Engineer',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          endTime: '11:00',
          duration: 60,
          status: 'scheduled',
          meetingRoom: 'Virtual Room 1',
          notes: 'Test interview data',
          matchingScore: 0.95,
          matchingReason: 'Excellent match with React and Node.js skills',
          skillGaps: ['GraphQL', 'Docker'],
          behavioralQuestion: 'Tell me about a time when you had to learn a new technology quickly.',
          createdBy: 'test@example.com',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        },
        {
          candidateId: 'test-2',
          candidateName: 'Sarah Williams',
          candidateEmail: 'sarah.williams@email.com',
          interviewerId: 'test-interviewer-2',
          interviewerName: 'Bob Chen',
          interviewerEmail: 'bob.chen@company.com',
          jobRole: 'Frontend Developer',
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '14:00',
          endTime: '15:00',
          duration: 60,
          status: 'scheduled',
          meetingRoom: 'Virtual Room 2',
          notes: 'Test interview data',
          matchingScore: 0.88,
          matchingReason: 'Good fit for frontend role with strong CSS and JavaScript background',
          skillGaps: ['TypeScript', 'Testing'],
          behavioralQuestion: 'Describe a challenging project you worked on and how you handled it.',
          createdBy: 'test@example.com',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }
      ]

      for (const interview of testInterviews) {
        await addDoc(collection(db, 'interviews'), interview)
      }

      toast.success("Test data added successfully!", {
        description: "Sample interviews have been created for testing."
      })
    } catch (error) {
      console.error('Error adding test data:', error)
      toast.error("Failed to add test data", {
        description: "Please check Firebase permissions and try again."
      })
    } finally {
      setAddingTestData(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Candidate Follow-up
          </CardTitle>
          <CardDescription>
            Generate professional offer and rejection emails for interviewed candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <div className="space-x-2">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Candidate Follow-up
              </CardTitle>
              <CardDescription>
                Generate professional offer and rejection emails for interviewed candidates
              </CardDescription>
            </div>
            {interviews.length === 0 && (
              <Button
                onClick={addTestData}
                disabled={addingTestData}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                {addingTestData ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                Add Test Data
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {interviews.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews scheduled yet</h3>
              <p className="text-gray-500">
                Once you confirm schedules, interviewed candidates will appear here for follow-up.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Candidate</TableHead>
                    <TableHead>Job Role</TableHead>
                    <TableHead>Interview Date</TableHead>
                    <TableHead>Interviewer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Notes</TableHead>
                    <TableHead className="text-center">Follow-up Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {interviews.map((interview) => (
                    <TableRow key={interview.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <Button
                              variant="link"
                              className="p-0 h-auto font-medium text-left justify-start hover:text-blue-600"
                              onClick={() => handleCandidateClick(interview)}
                            >
                              {interview.candidateName}
                            </Button>
                            <div className="text-sm text-muted-foreground">{interview.candidateEmail}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{interview.jobRole || 'Software Engineer'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(interview.date)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatTime(interview.time)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{interview.interviewerName}</div>
                          <div className="text-sm text-muted-foreground">{interview.interviewerEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-100 text-green-800">
                          {interview.status || 'scheduled'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCandidateClick(interview)}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                        >
                          <MessageSquare className="h-3 w-3" />
                          View Notes
                        </Button>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateEmail(interview, 'offer')}
                            disabled={generatingEmail === `${interview.id}-offer`}
                            className="flex items-center gap-1 border-green-300 text-green-700 hover:bg-green-50"
                          >
                            {generatingEmail === `${interview.id}-offer` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <CheckCircle className="h-3 w-3" />
                            )}
                            Offer Email
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => generateEmail(interview, 'rejection')}
                            disabled={generatingEmail === `${interview.id}-rejection`}
                            className="flex items-center gap-1 border-red-300 text-red-700 hover:bg-red-50"
                          >
                            {generatingEmail === `${interview.id}-rejection` ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <XCircle className="h-3 w-3" />
                            )}
                            Rejection Email
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Generation Dialog */}
      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {generatedEmail?.type === 'offer' ? 'Job Offer Email' : 'Interview Rejection Email'}
            </DialogTitle>
            <DialogDescription>
              Professional email draft for {generatedEmail?.candidate}. Review and copy to your email client.
            </DialogDescription>
          </DialogHeader>
          
          {generatedEmail && (
            <div className="space-y-6">
              {/* Subject Line */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Subject Line</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedEmail.subject, 'subject')}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <p className="text-sm font-medium">{generatedEmail.subject}</p>
                </div>
              </div>

              {/* Email Body */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Email Body</label>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(generatedEmail.body, 'body')}
                    className="h-8 px-2"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
                  <pre className="text-sm whitespace-pre-wrap font-sans">{generatedEmail.body}</pre>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setEmailDialogOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    copyToClipboard(`${generatedEmail.subject}\n\n${generatedEmail.body}`, 'body')
                    setEmailDialogOpen(false)
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Full Email
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Candidate Details Sheet */}
      <CandidateDetailsSheet
        interview={selectedCandidate}
        isOpen={candidateSheetOpen}
        onClose={handleCloseSheet}
      />
    </>
  )
}
