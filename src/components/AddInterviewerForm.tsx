'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, User, Loader2, CheckCircle, AlertCircle, Briefcase } from 'lucide-react'
import { toast } from "sonner"
import { motion } from "framer-motion"

export default function AddInterviewerForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [specialization, setSpecialization] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name.trim() || !email.trim() || !specialization) {
      toast.error("Missing information", {
        description: "Please fill in all fields including specialization"
      })
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address"
      })
      return
    }

    setIsSubmitting(true)

    try {
      await addDoc(collection(db, 'interviewers'), {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        specialization: specialization,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Reset form
      setName('')
      setEmail('')
      setSpecialization('')
      
      toast.success("Interviewer added successfully!", {
        description: `${name.trim()} has been added to your team`,
        action: {
          label: "View List",
          onClick: () => {
            // Scroll to interviewer list or switch tabs
            const listElement = document.querySelector('[data-testid="interviewer-list"]')
            if (listElement) {
              listElement.scrollIntoView({ behavior: 'smooth' })
            }
          }
        }
      })
      
    } catch (error) {
      console.error('Error adding interviewer:', error)
      toast.error("Failed to add interviewer", {
        description: "Please try again or contact support"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter interviewer's full name"
                disabled={isSubmitting}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter interviewer's email"
                disabled={isSubmitting}
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialization" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Technical Specialization
              </Label>
              <Select value={specialization} onValueChange={setSpecialization} disabled={isSubmitting}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Select interviewer's expertise area" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frontend">Frontend Development</SelectItem>
                  <SelectItem value="backend">Backend Development</SelectItem>
                  <SelectItem value="fullstack">Full-Stack Development</SelectItem>
                  <SelectItem value="mobile">Mobile Development</SelectItem>
                  <SelectItem value="devops">DevOps & Infrastructure</SelectItem>
                  <SelectItem value="data">Data Science & Analytics</SelectItem>
                  <SelectItem value="ai-ml">AI & Machine Learning</SelectItem>
                  <SelectItem value="security">Cybersecurity</SelectItem>
                  <SelectItem value="qa">Quality Assurance</SelectItem>
                  <SelectItem value="product">Product Management</SelectItem>
                  <SelectItem value="design">UI/UX Design</SelectItem>
                  <SelectItem value="leadership">Technical Leadership</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isSubmitting || !name.trim() || !email.trim() || !specialization}
                className="w-full h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                size="lg"
              >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding Interviewer...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add to Team
                </>
              )}
            </Button>
            </motion.div>
            
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>New interviewers will be available immediately</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
