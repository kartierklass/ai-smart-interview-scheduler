'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { User, Mail, Trash2, Users, Calendar, Briefcase } from 'lucide-react'
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"

interface Interviewer {
  id: string
  name: string
  email: string
  specialization?: string
  createdAt: any
}

export default function InterviewerList() {
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Create a query to get interviewers ordered by creation date
    const q = query(
      collection(db, 'interviewers'), 
      orderBy('createdAt', 'desc')
    )

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const interviewerData: Interviewer[] = []
        querySnapshot.forEach((doc) => {
          interviewerData.push({
            id: doc.id,
            ...doc.data()
          } as Interviewer)
        })
        setInterviewers(interviewerData)
        setLoading(false)
        setError('')
      },
      (error) => {
        console.error('Error fetching interviewers:', error)
        setError('Error loading interviewers')
        setLoading(false)
      }
    )

    // Cleanup subscription on unmount
    return () => unsubscribe()
  }, [])

  const handleDelete = async (id: string, name: string) => {
    try {
      await deleteDoc(doc(db, 'interviewers', id))
      toast.success(`Removed ${name}`, {
        description: "Interviewer has been successfully removed from the list"
      })
    } catch (error) {
      console.error('Error deleting interviewer:', error)
      toast.error("Failed to remove interviewer", {
        description: "Please try again or contact support"
      })
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getSpecializationLabel = (specialization: string) => {
    const labels: Record<string, string> = {
      'frontend': 'Frontend Dev',
      'backend': 'Backend Dev', 
      'fullstack': 'Full-Stack Dev',
      'mobile': 'Mobile Dev',
      'devops': 'DevOps',
      'data': 'Data Science',
      'ai-ml': 'AI/ML',
      'security': 'Security',
      'qa': 'QA',
      'product': 'Product',
      'design': 'UI/UX',
      'leadership': 'Leadership'
    }
    return labels[specialization] || specialization
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-2">{error}</div>
        <button 
          onClick={() => window.location.reload()}
          className="text-indigo-600 hover:text-indigo-800 underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (interviewers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No interviewers yet</h3>
        <p className="text-sm">Add your first interviewer to get started with scheduling.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">
            {interviewers.length} Interviewer{interviewers.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Badge variant="secondary" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Active
        </Badge>
      </div>

      {/* Interviewers Table - Desktop */}
      <div className="hidden md:block border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence>
              {interviewers.map((interviewer, index) => (
                <motion.tr
                  key={interviewer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="hover:bg-muted/50"
                >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {getInitials(interviewer.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    {interviewer.name}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {interviewer.email}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-blue-500" />
                    <Badge variant="secondary" className="font-medium">
                      {interviewer.specialization ? getSpecializationLabel(interviewer.specialization) : 'Not specified'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Interviewer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{interviewer.name}</strong> from the interviewer list? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(interviewer.id, interviewer.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </motion.tr>
            ))}
            </AnimatePresence>
          </TableBody>
                  </Table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden space-y-3">
          <AnimatePresence>
            {interviewers.map((interviewer, index) => (
              <motion.div
                key={interviewer.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="p-4 border rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                        {getInitials(interviewer.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium text-sm">{interviewer.name}</div>
                      <div className="text-xs text-muted-foreground">{interviewer.email}</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Briefcase className="h-3 w-3 text-blue-500" />
                        <Badge variant="secondary" className="text-xs">
                          {interviewer.specialization ? getSpecializationLabel(interviewer.specialization) : 'Not specified'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove Interviewer</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to remove <strong>{interviewer.name}</strong> from the interviewer list? 
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(interviewer.id, interviewer.name)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    )
  }
