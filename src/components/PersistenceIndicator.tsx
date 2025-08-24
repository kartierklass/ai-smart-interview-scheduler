'use client'

import { useFormPersistence } from '@/contexts/FormPersistenceContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Save, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PersistenceIndicator() {
  const { formData, clearFormData, lastSaved } = useFormPersistence()

  const hasData = formData.csvFileName || formData.jobDescription.trim() || formData.selectedInterviewers.length > 0

  const handleClearData = () => {
    clearFormData()
    toast.success("Form data cleared", {
      description: "All saved form data has been removed"
    })
  }

  if (!hasData) {
    return null
  }

  return (
    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 text-blue-600" />
        <div className="text-sm">
          <span className="font-medium text-blue-900">Form data saved</span>
          {lastSaved && (
            <span className="text-blue-700 ml-2">
              Last saved: {new Date(lastSaved).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="flex items-center gap-1">
          <Save className="h-3 w-3" />
          Auto-save enabled
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearData}
          className="h-8 px-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
        >
          <Trash2 className="h-3 w-3 mr-1" />
          Clear
        </Button>
      </div>
    </div>
  )
}
