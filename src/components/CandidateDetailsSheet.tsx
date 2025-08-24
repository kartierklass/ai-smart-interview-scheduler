'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useSession } from 'next-auth/react'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Calendar, Clock, MapPin, MessageSquare, Send, Loader2, Users } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

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
  meetingRoom: string
  matchingScore?: number
  matchingReason?: string
  skillGaps?: string[]
  behavioralQuestion?: string
}

interface Note {
  id: string
  content: string
  authorName: string
  authorEmail: string
  createdAt: any
}

interface CandidateDetailsSheetProps {
  interview: Interview | null
  isOpen: boolean
  onClose: () => void
}

export default function CandidateDetailsSheet({ interview, isOpen, onClose }: CandidateDetailsSheetProps) {
  const { data: session } = useSession()
  const [notes, setNotes] = useState<Note[]>([])
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notesLoading, setNotesLoading] = useState(true)

  // Load notes when interview changes
  useEffect(() => {
    if (!interview?.id) {
      setNotes([])
      setNotesLoading(false)
      return
    }

    setNotesLoading(true)
    
    const notesQuery = query(
      collection(db, 'interviews', interview.id, 'notes'),
      orderBy('createdAt', 'desc')
    )

    const unsubscribe = onSnapshot(
      notesQuery,
      (snapshot) => {
        try {
          const notesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Note[]
          
          setNotes(notesData)
          setNotesLoading(false)
        } catch (error) {
          console.error('Error processing notes data:', error)
          setNotes([])
          setNotesLoading(false)
        }
      },
      (error) => {
        console.error('Error loading notes:', error)
        
        if (error.code === 'permission-denied') {
          toast.error("Permission denied", {
            description: "Unable to load interview notes. Please check Firebase permissions."
          })
        } else {
          console.warn('Notes collection may not exist yet for this interview')
        }
        
        setNotes([])
        setNotesLoading(false)
      }
    )

    return () => unsubscribe()
  }, [interview?.id])

  const handleSubmitNote = async () => {
    if (!newNote.trim() || !interview?.id || !session?.user) {
      return
    }

    setIsSubmitting(true)
    
    try {
      await addDoc(collection(db, 'interviews', interview.id, 'notes'), {
        content: newNote.trim(),
        authorName: session.user.name || 'Anonymous',
        authorEmail: session.user.email || '',
        createdAt: serverTimestamp()
      })

      setNewNote('')
      
      toast.success("Note added successfully!", {
        description: "Your interview note has been shared with the team."
      })
    } catch (error) {
      console.error('Error adding note:', error)
      
      toast.error("Failed to add note", {
        description: "Please check your permissions and try again."
      })
    } finally {
      setIsSubmitting(false)
    }
  }

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

  const formatNoteTime = (timestamp: any) => {
    if (!timestamp) return 'Just now'
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (!interview) return null

  return (
         <Sheet open={isOpen} onOpenChange={onClose}>
       <SheetContent className="w-[800px] sm:w-[900px] lg:w-[1000px] xl:w-[1100px] overflow-hidden flex flex-col bg-gradient-to-br from-slate-50 to-white">
        <SheetHeader className="pb-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <User className="h-6 w-6" />
              </div>
              <div>
                <SheetTitle className="text-xl font-bold text-slate-900">
                  {interview.candidateName}
                </SheetTitle>
                <SheetDescription className="text-slate-600">
                  Interview details and team collaboration notes
                </SheetDescription>
              </div>
            </div>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 pt-6">
            {/* Candidate Basic Info */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  Candidate Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</p>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <p className="text-sm font-medium text-slate-900 break-all cursor-help">
                               {interview.candidateEmail}
                             </p>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>{interview.candidateEmail}</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                      <User className="h-4 w-4 text-purple-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Position</p>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <p className="text-sm font-medium text-slate-900 break-words cursor-help">
                               {interview.jobRole}
                             </p>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>{interview.jobRole}</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Calendar className="h-4 w-4 text-green-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Date</p>
                       <p className="text-sm font-medium text-slate-900">{formatDate(interview.date)}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-orange-100">
                      <Clock className="h-4 w-4 text-orange-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Time</p>
                       <p className="text-sm font-medium text-slate-900">{formatTime(interview.time)} ({interview.duration} min)</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100">
                      <MapPin className="h-4 w-4 text-indigo-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Location</p>
                       <p className="text-sm font-medium text-slate-900">{interview.meetingRoom}</p>
                     </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-pink-100">
                      <Users className="h-4 w-4 text-pink-600" />
                    </div>
                                         <div className="flex-1 min-w-0">
                       <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Interviewer</p>
                       <TooltipProvider>
                         <Tooltip>
                           <TooltipTrigger asChild>
                             <p className="text-sm font-medium text-slate-900 break-words cursor-help">
                               {interview.interviewerName}
                             </p>
                           </TooltipTrigger>
                           <TooltipContent>
                             <p>{interview.interviewerName}</p>
                           </TooltipContent>
                         </Tooltip>
                       </TooltipProvider>
                     </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0 px-3 py-1">
                    {interview.status}
                  </Badge>
                  {interview.matchingScore && (
                    <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-3 py-1">
                      {Math.round(interview.matchingScore * 100)}% AI Match
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Analysis Summary */}
            {(interview.matchingReason || interview.skillGaps || interview.behavioralQuestion) && (
              <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                    <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-teal-600 rounded-full"></div>
                    AI Analysis Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {interview.matchingReason && (
                    <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100">
                      <h4 className="font-semibold text-sm text-green-800 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Match Analysis
                      </h4>
                      <p className="text-sm text-green-700 leading-relaxed">{interview.matchingReason}</p>
                    </div>
                  )}
                  
                  {interview.skillGaps && interview.skillGaps.length > 0 && (
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-100">
                      <h4 className="font-semibold text-sm text-orange-800 mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        Skill Gaps to Assess
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {interview.skillGaps.map((skill, index) => (
                          <Badge key={index} className="bg-orange-100 text-orange-800 border-orange-200 text-xs px-2 py-1">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {interview.behavioralQuestion && (
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-100">
                      <h4 className="font-semibold text-sm text-purple-800 mb-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        Suggested Question
                      </h4>
                      <p className="text-sm text-purple-700 italic leading-relaxed">"{interview.behavioralQuestion}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Interview Notes Section */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                  <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-rose-600 rounded-full"></div>
                  Interview Notes
                  <Badge className="ml-auto bg-gradient-to-r from-pink-500 to-rose-600 text-white border-0">
                    {notes.length} {notes.length === 1 ? 'note' : 'notes'}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Collaborate with your team by sharing interview insights and observations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Note Form */}
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                    <Textarea
                      placeholder="Share your interview notes, observations, or questions about this candidate..."
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      rows={3}
                      className="resize-none border-0 bg-transparent focus:ring-0 placeholder:text-blue-600/60"
                    />
                    <div className="flex justify-between items-center pt-3 border-t border-blue-200">
                      <p className="text-xs text-blue-600 font-medium">
                        Notes are shared with all team members in real-time
                      </p>
                                          <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSubmitNote}
                        disabled={!newNote.trim() || isSubmitting}
                        size="sm"
                        className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white border-0"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Send className="h-3 w-3" />
                        )}
                        Post Note
                      </Button>
                    </motion.div>
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-200" />

                {/* Notes Feed */}
                <div className="space-y-4">
                  {notesLoading ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3">
                        <Loader2 className="h-6 w-6 animate-spin text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-600 font-medium">Loading notes...</p>
                    </div>
                  ) : notes.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 mx-auto mb-3">
                        <MessageSquare className="h-6 w-6 text-slate-600" />
                      </div>
                      <p className="text-sm text-slate-700 font-medium">No notes yet</p>
                      <p className="text-xs text-slate-500">Be the first to share insights about this candidate</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <AnimatePresence>
                        {notes.map((note, index) => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex gap-3 p-4 bg-gradient-to-r from-slate-50 to-white rounded-lg border border-slate-200 shadow-sm"
                          >
                          <Avatar className="h-10 w-10 flex-shrink-0 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                              {getInitials(note.authorName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-semibold text-sm text-slate-900">{note.authorName}</span>
                              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                                {formatNoteTime(note.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                              {note.content}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
