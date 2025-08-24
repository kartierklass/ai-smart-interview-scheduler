'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useFormPersistence } from '@/contexts/FormPersistenceContext'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Check, ChevronsUpDown, Upload, X, FileText, Users, Sparkles, Loader2, Briefcase, Save, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from "sonner"
import ScheduleResults from './ScheduleResults'
import PersistenceIndicator from './PersistenceIndicator'

interface Interviewer {
  id: string
  name: string
  email: string
  specialization?: string
}

export default function BatchScheduler() {
  const { formData, updateFormData, isLoading: contextLoading, lastSaved } = useFormPersistence()
  const [interviewers, setInterviewers] = useState<Interviewer[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [generating, setGenerating] = useState(false)

  // Use persistent data from context
  const csvFile = formData.csvFile
  const selectedInterviewers = formData.selectedInterviewers
  const jobDescription = formData.jobDescription
  const scheduleResults = formData.scheduleResults

  // Event handlers for updating persistent data
  const handleCsvFileChange = (file: File | null) => {
    updateFormData({ csvFile: file, csvFileName: file?.name || '' })
  }

  const handleInterviewersChange = (interviewers: Interviewer[]) => {
    updateFormData({ selectedInterviewers: interviewers })
  }

  const handleJobDescriptionChange = (description: string) => {
    updateFormData({ jobDescription: description })
  }

  const handleScheduleResultsChange = (results: any) => {
    updateFormData({ scheduleResults: results })
  }

  // Load interviewers from Firestore
  useEffect(() => {
    const q = query(collection(db, 'interviewers'), orderBy('name', 'asc'))
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const interviewerData: Interviewer[] = []
      querySnapshot.forEach((doc) => {
        interviewerData.push({
          id: doc.id,
          ...doc.data()
        } as Interviewer)
      })
      setInterviewers(interviewerData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type === 'text/csv') {
      // Simulate upload progress
      setUploadProgress(0)
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
                      clearInterval(interval)
          handleCsvFileChange(file)
            toast.success(`CSV file "${file.name}" uploaded successfully!`, {
              description: `File size: ${(file.size / 1024).toFixed(1)} KB`
            })
            return 100
          }
          return prev + 10
        })
      }, 100)
    } else {
      toast.error("Invalid file type", {
        description: "Please select a valid CSV file"
      })
      event.target.value = ''
    }
  }

  const handleInterviewerSelect = (interviewer: Interviewer) => {
    const isSelected = selectedInterviewers.some(item => item.id === interviewer.id)
    
    if (isSelected) {
      const newSelection = selectedInterviewers.filter(item => item.id !== interviewer.id)
      handleInterviewersChange(newSelection)
      toast.info(`Removed ${interviewer.name} from selection`)
    } else {
      const newSelection = [...selectedInterviewers, interviewer]
      handleInterviewersChange(newSelection)
      toast.success(`Added ${interviewer.name} to selection`)
    }
  }

  const removeInterviewer = (interviewerId: string) => {
    const newSelection = selectedInterviewers.filter(item => item.id !== interviewerId)
    handleInterviewersChange(newSelection)
  }

  const handleGenerateSchedule = async () => {
    if (!csvFile || selectedInterviewers.length === 0) {
      toast.error("Missing requirements", {
        description: "Please upload a CSV file and select at least one interviewer"
      })
      return
    }

    setGenerating(true)
    
    try {
      // Read CSV file content
      const csvContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target?.result as string)
        reader.onerror = () => reject(new Error('Failed to read file'))
        reader.readAsText(csvFile)
      })

      // Log detailed information
      console.log('=== SCHEDULE GENERATION REQUEST ===')
      console.log('Selected CSV File:', {
        name: csvFile.name,
        size: csvFile.size,
        type: csvFile.type,
        lastModified: new Date(csvFile.lastModified).toISOString()
      })
      
      console.log('Selected Interviewers:', selectedInterviewers.map(interviewer => ({
        id: interviewer.id,
        name: interviewer.name,
        email: interviewer.email
      })))
      
      console.log('Total Interviewers Selected:', selectedInterviewers.length)
      console.log('================================')
      
      // Show loading state
      const loadingToast = toast.loading("Generating AI-optimized schedule...", {
        description: "Google Gemini AI is applying the Saturn Principle"
      })
      
      // Call our API
      const response = await fetch('/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          csvData: csvContent,
          interviewerIds: selectedInterviewers.map(i => i.id),
          jobDescription: jobDescription.trim(),
          preferences: {
            duration: 60,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.details || result.error || 'Failed to generate schedule')
      }

      if (!result.success) {
        throw new Error(result.details || 'Schedule generation failed')
      }

      // Success!
      console.log('🎉 AI Schedule Generated:', result.schedule)
      console.log('🔧 DEBUG: Setting generating to false...')
      
      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      
      // Show the results in the UI
      handleScheduleResultsChange(result)
      
      toast.success("Schedule generated successfully!", {
        description: `Generated ${result.schedule.schedule?.length || 0} interviews using Google Gemini AI + Saturn Principle`,
        action: {
          label: "View Results",
          onClick: () => {
            handleScheduleResultsChange(result)
          }
        }
      })

      // Log the complete response for debugging
      console.log('=== COMPLETE AI RESPONSE ===')
      console.log(JSON.stringify(result, null, 2))
      console.log('============================')
      
    } catch (error) {
      console.error('❌ Schedule generation error:', error)
      console.log('🔧 DEBUG: Error occurred, setting generating to false...')
      
      // Dismiss loading toast and show error
      toast.dismiss()
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "Please try again or contact support"
      })
    } finally {
      console.log('🔧 DEBUG: Finally block - setting generating to false...')
      setGenerating(false)
    }
  }

  return (
    <>
      {scheduleResults && (
        <ScheduleResults 
          schedule={scheduleResults} 
          onClose={() => handleScheduleResultsChange(null)} 
        />
      )}
      
      <Card className="w-full">
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          Saturn Batch Scheduler
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Upload candidate data and select interviewers to generate AI-optimized schedules.
          Our Saturn Principle ensures maximum efficiency with minimal conflicts.</span>
          {lastSaved && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Save className="h-3 w-3" />
              <span>Auto-saved {new Date(lastSaved).toLocaleTimeString()}</span>
            </div>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Persistence Indicator */}
        <PersistenceIndicator />

        {/* CSV File Upload */}
        <div className="space-y-3">
          <Label htmlFor="csv-upload" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Upload Candidate CSV File
          </Label>
          <div className="space-y-3">
            <Input
              id="csv-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="cursor-pointer"
              disabled={uploadProgress > 0 && uploadProgress < 100}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}
            
            {(csvFile || formData.csvFileName) && (
              <div className="flex items-center gap-2 p-3 rounded-lg border bg-green-50 border-green-200">
                <FileText className="h-4 w-4 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-green-900">
                    {csvFile?.name || formData.csvFileName}
                  </p>
                  <p className="text-sm text-green-600">
                    {csvFile ? `${(csvFile.size / 1024).toFixed(1)} KB • ` : ''}
                    {csvFile ? 'Ready for processing' : 'File restored from previous session'}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    handleCsvFileChange(null)
                    setUploadProgress(0)
                    updateFormData({ csvFileName: '' })
                  }}
                  className="h-8 w-8 p-0 text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Upload a CSV file with <strong>candidates who need interviews</strong> (name, email, position, etc.)
          </p>
        </div>

        <Separator />

        {/* Job Description */}
        <div className="space-y-3">
          <Label htmlFor="job-description" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Job Description
          </Label>
          <Textarea
            id="job-description"
            placeholder="Enter the detailed job description here... Include required skills, technologies, experience level, responsibilities, etc. This will help our AI perform advanced matching, skill gap analysis, and generate behavioral questions."
            value={jobDescription}
            onChange={(e) => handleJobDescriptionChange(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">
            <strong>Advanced AI Analysis:</strong> Technical matching, skill gap identification, and behavioral question generation based on job requirements and candidate profiles.
          </p>
        </div>

        <Separator />

        {/* Interviewer Selection */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Select Interviewers ({selectedInterviewers.length} selected)
          </Label>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ) : (
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between h-12"
                  disabled={interviewers.length === 0}
                >
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    {selectedInterviewers.length === 0
                      ? "Choose your interview team..."
                      : `${selectedInterviewers.length} interviewer${selectedInterviewers.length !== 1 ? 's' : ''} ready`}
                  </div>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search interviewers..." />
                <CommandList>
                  <CommandEmpty>
                    {loading ? "Loading interviewers..." : "No interviewers found."}
                  </CommandEmpty>
                  <CommandGroup>
                    {interviewers.map((interviewer) => (
                      <CommandItem
                        key={interviewer.id}
                        value={interviewer.name}
                        onSelect={() => handleInterviewerSelect(interviewer)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedInterviewers.some(item => item.id === interviewer.id)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{interviewer.name}</span>
                          <span className="text-sm text-muted-foreground">{interviewer.email}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          )}
          
          {/* Selected Interviewers Display */}
          {selectedInterviewers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Selected Team:</p>
              <div className="flex flex-wrap gap-2">
                {selectedInterviewers.map((interviewer) => (
                  <Badge 
                    key={interviewer.id} 
                    variant="default" 
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    {interviewer.name}
                    <X 
                      className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" 
                      onClick={() => removeInterviewer(interviewer.id)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          <p className="text-sm text-muted-foreground">
            Choose <strong>interviewers who will conduct</strong> the interviews. All candidates from the CSV will be scheduled with these interviewers.
          </p>
        </div>

        <Separator />

        {/* Generate Button */}
        <div className="pt-2">
          <Button 
            onClick={handleGenerateSchedule}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            size="lg"
            disabled={!csvFile || selectedInterviewers.length === 0 || generating}
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Schedule...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate AI-Optimized Schedule
              </>
            )}
          </Button>
          
          <p className="text-sm text-muted-foreground mt-2 text-center">
            {!csvFile && !formData.csvFileName && selectedInterviewers.length === 0 && !jobDescription.trim()
              ? "Upload CSV + add job description + select interviewers for AI matching"
              : !csvFile && !formData.csvFileName
              ? "Please upload a CSV file with candidates"
              : !jobDescription.trim()
              ? "Please add a job description for better AI matching"
              : selectedInterviewers.length === 0
              ? "Please select interviewers who will conduct the interviews"
              : "Ready to generate AI-optimized schedule with smart matching!"}
          </p>
        </div>
      </CardContent>
    </Card>
    </>
  )
}
