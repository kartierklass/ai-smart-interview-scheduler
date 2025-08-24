'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface Interviewer {
  id: string
  name: string
  email: string
  specialization?: string
}

interface FormData {
  csvFile: File | null
  csvFileName: string
  jobDescription: string
  selectedInterviewers: Interviewer[]
  scheduleResults: any
}

interface FormPersistenceContextType {
  formData: FormData
  updateFormData: (updates: Partial<FormData>) => void
  clearFormData: () => void
  isLoading: boolean
  lastSaved: Date | null
}

const defaultFormData: FormData = {
  csvFile: null,
  csvFileName: '',
  jobDescription: '',
  selectedInterviewers: [],
  scheduleResults: null
}

const FormPersistenceContext = createContext<FormPersistenceContextType | undefined>(undefined)

export const useFormPersistence = () => {
  const context = useContext(FormPersistenceContext)
  if (!context) {
    throw new Error('useFormPersistence must be used within a FormPersistenceProvider')
  }
  return context
}

interface FormPersistenceProviderProps {
  children: ReactNode
}

export const FormPersistenceProvider: React.FC<FormPersistenceProviderProps> = ({ children }) => {
  const [formData, setFormData] = useState<FormData>(defaultFormData)
  const [isLoading, setIsLoading] = useState(true)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const stored = localStorage.getItem('saturn-scheduler-form-data')
        if (stored) {
          const parsedData = JSON.parse(stored)
          
          // Don't restore csvFile as File objects can't be serialized
          // But keep the filename for reference
          const restoredData: FormData = {
            ...defaultFormData,
            ...parsedData,
            csvFile: null // Files can't be persisted
          }
          
          setFormData(restoredData)
          
          // Set last saved time
          const lastSavedTime = localStorage.getItem('saturn-scheduler-last-saved')
          if (lastSavedTime) {
            setLastSaved(new Date(lastSavedTime))
          }
        }
      } catch (error) {
        console.error('Error loading form data from localStorage:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadStoredData()
  }, [])

  // Save to localStorage whenever formData changes
  useEffect(() => {
    if (!isLoading) {
      try {
        // Create a serializable version (excluding File objects)
        const dataToStore = {
          ...formData,
          csvFile: null // Don't store File objects
        }
        
        localStorage.setItem('saturn-scheduler-form-data', JSON.stringify(dataToStore))
        
        const now = new Date()
        localStorage.setItem('saturn-scheduler-last-saved', now.toISOString())
        setLastSaved(now)
      } catch (error) {
        console.error('Error saving form data to localStorage:', error)
      }
    }
  }, [formData, isLoading])

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const clearFormData = () => {
    setFormData(defaultFormData)
    localStorage.removeItem('saturn-scheduler-form-data')
    localStorage.removeItem('saturn-scheduler-last-saved')
    setLastSaved(null)
  }

  const value: FormPersistenceContextType = {
    formData,
    updateFormData,
    clearFormData,
    isLoading,
    lastSaved
  }

  return (
    <FormPersistenceContext.Provider value={value}>
      {children}
    </FormPersistenceContext.Provider>
  )
}
