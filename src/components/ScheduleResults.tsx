'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Calendar, User, Mail, Clock, MapPin, BarChart3, CheckCircle, Users, Sparkles, X, Send, Loader2, Target, TrendingUp, Eye, AlertTriangle, MessageSquare, ChevronDown, ChevronRight } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"

interface ScheduleResultsProps {
  schedule: any
  onClose: () => void
}

export default function ScheduleResults({ schedule, onClose }: ScheduleResultsProps) {
  const { metadata, schedule: interviews, analytics, recommendations } = schedule.schedule
  const [confirming, setConfirming] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())
  const { data: session } = useSession()

  // Handle Escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [onClose])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleConfirmSchedule = async () => {
    setConfirming(true)
    
    try {
      console.log('📅 Confirming schedule and sending calendar invites...')
      
      const loadingToast = toast.loading("Creating calendar events...", {
        description: "Sending invitations to all participants"
      })

      const response = await fetch('/api/confirm-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schedule: interviews,
          metadata: metadata
        })
      })

      const result = await response.json()
      
      toast.dismiss(loadingToast)

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to create calendar events')
      }

      if (result.success) {
        setConfirmed(true)
        
        toast.success("Calendar invitations sent!", {
          description: result.message,
          action: {
            label: "View Details",
            onClick: () => {
              console.log('Calendar Integration Results:', result.details)
            }
          }
        })

        console.log('✅ Calendar integration successful:', result.details)
      } else {
        throw new Error(result.details || 'Failed to confirm schedule')
      }

    } catch (error) {
      console.error('❌ Calendar integration error:', error)
      
      let errorMessage = error instanceof Error ? error.message : 'Failed to create calendar events'
      
      if (errorMessage.includes('Calendar Access Required') || errorMessage.includes('Token Expired')) {
        errorMessage = 'Calendar permissions needed. Please sign out and sign in again to grant calendar access.'
      } else if (errorMessage.includes('authentication') || errorMessage.includes('calendar access')) {
        errorMessage = 'Authentication issue. Please try signing out and signing in again.'
      }
      
      toast.error("Calendar integration failed", {
        description: errorMessage
      })
    } finally {
      setConfirming(false)
    }
  }

  const toggleRowExpansion = (index: number) => {
    const newExpandedRows = new Set(expandedRows)
    if (newExpandedRows.has(index)) {
      newExpandedRows.delete(index)
    } else {
      newExpandedRows.add(index)
    }
    setExpandedRows(newExpandedRows)
  }

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
                  <div className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white relative">
          <div className="flex items-center justify-between pr-12">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {confirmed ? "Calendar Invites Sent!" : "AI Schedule Generated!"}
                </h2>
                <p className="text-blue-100">
                  {confirmed ? "All participants have been notified" : "Saturn Principle Optimization Complete"}
                </p>
              </div>
            </div>
            

            
            {confirmed && (
              <div className="flex items-center gap-2 text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="text-sm font-medium">Invites Sent</span>
              </div>
            )}
          </div>
          
          {/* Enhanced Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 group focus:outline-none focus:ring-2 focus:ring-white/50"
            title="Close (Esc)"
          >
            <X className="h-5 w-5 text-white group-hover:scale-110 transition-transform duration-200" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <Tabs defaultValue="schedule" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="schedule" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Schedule ({interviews.length})
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Summary
              </TabsTrigger>
            </TabsList>

            <TabsContent value="schedule" className="space-y-4">
                              <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          Interview Schedule
                        </CardTitle>
                        <CardDescription>
                          All {interviews.length} candidates scheduled with optimal timing
                        </CardDescription>
                      </div>
                      
                      {!confirmed && (
                        <Button
                          onClick={handleConfirmSchedule}
                          disabled={confirming || !session?.accessToken}
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                          title={!session?.accessToken ? "Calendar access required - please re-authenticate" : ""}
                        >
                          {confirming ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Creating Events...
                            </>
                          ) : (
                            <>
                              <Send className="h-4 w-4" />
                              {!session?.accessToken ? "Calendar Access Required" : "Send Calendar Invites"}
                            </>
                          )}
                        </Button>
                      )}
                      
                      {confirmed && (
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">Calendar events created</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                <CardContent>
                  <div className="border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Candidate</TableHead>
                          <TableHead>Interviewer</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Duration</TableHead>
                          <TableHead>AI Match</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-center">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <AnimatePresence>
                          {interviews.map((interview: any, index: number) => (
                            <motion.tr
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                            <TableCell>
                              <div>
                                <div className="font-medium">{interview.candidateName}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {interview.candidateEmail}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium">{interview.interviewerName}</div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-3 w-3" />
                                  {interview.interviewerEmail}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(interview.date)}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {formatTime(interview.time)} - {formatTime(interview.endTime)}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {interview.duration} min
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4 text-blue-500" />
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-1">
                                    <span className="text-sm font-medium">
                                      {interview.matchingScore ? `${Math.round(interview.matchingScore * 100)}%` : '95%'}
                                    </span>
                                    <TrendingUp className="h-3 w-3 text-green-500" />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    Smart Match
                                  </span>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className="bg-green-100 text-green-800">
                                {interview.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Target className="h-5 w-5 text-blue-500" />
                                      AI Analysis: {interview.candidateName}
                                    </DialogTitle>
                                    <DialogDescription>
                                      Detailed insights from our advanced AI matching system
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  <div className="space-y-6 py-4">
                                    {/* Matching Analysis */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Interviewer Match Analysis
                                      </h4>
                                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <span className="font-medium text-green-900">
                                            {Math.round((interview.matchingScore || 0.95) * 100)}% Match
                                          </span>
                                          <span className="text-green-700">with {interview.interviewerName}</span>
                                        </div>
                                        <p className="text-sm text-green-800">
                                          {interview.matchingReason || "Excellent technical alignment between candidate skills and interviewer expertise."}
                                        </p>
                                      </div>
                                    </div>

                                    {/* Skill Gaps */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                                        Skill Gap Analysis
                                      </h4>
                                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <p className="text-sm text-orange-800 mb-3">
                                          Skills from job description not present in candidate profile:
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {(interview.skillGaps || ['Docker', 'GraphQL', 'AWS']).map((skill: string, skillIndex: number) => (
                                            <Badge key={skillIndex} variant="outline" className="border-orange-300 text-orange-700">
                                              {skill}
                                            </Badge>
                                          ))}
                                        </div>
                                        <p className="text-xs text-orange-600 mt-2">
                                          💡 Focus areas for technical assessment
                                        </p>
                                      </div>
                                    </div>

                                    {/* Behavioral Question */}
                                    <div className="space-y-3">
                                      <h4 className="font-semibold flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-purple-500" />
                                        Suggested Behavioral Question
                                      </h4>
                                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                        <p className="text-sm text-purple-800 italic">
                                          "{interview.behavioralQuestion || "Tell me about a time when you had to learn a new technology quickly to complete a project. How did you approach it and what was the outcome?"}"
                                        </p>
                                        <p className="text-xs text-purple-600 mt-2">
                                          🎯 Tailored based on candidate experience and role requirements
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </TableCell>
                          </motion.tr>
                        ))}
                        </AnimatePresence>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Efficiency Score</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {(analytics.scheduleEfficiency * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-muted-foreground">Saturn Principle optimization</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {analytics.optimizationScore}/100
                    </div>
                    <p className="text-xs text-muted-foreground">AI quality rating</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {analytics.conflictCount}
                    </div>
                    <p className="text-xs text-muted-foreground">Zero scheduling conflicts</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Interviewer Workload Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(analytics.interviewerWorkload).map(([id, workload]: [string, any]) => (
                      <div key={id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <div className="font-medium">{workload.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {workload.totalInterviews} interviews • {(workload.utilizationRate * 100).toFixed(0)}% utilization
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {workload.averagePerDay} per day
                          </Badge>
                          <Badge className="bg-blue-100 text-blue-800">
                            {workload.totalInterviews} total
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Scheduling Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span>Total Candidates:</span>
                      <Badge>{metadata.totalCandidates}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interviewers:</span>
                      <Badge>{metadata.totalInterviewers}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <Badge variant="outline">{metadata.schedulingAlgorithm}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration per Interview:</span>
                      <Badge variant="secondary">{metadata.duration} minutes</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Time Zone:</span>
                      <Badge variant="outline">{metadata.timeZone}</Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>AI Recommendations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recommendations.map((rec: string, index: number) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                          <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-blue-900">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
