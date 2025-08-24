import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!)

interface Interviewer {
  id: string
  name: string
  email: string
  specialization?: string
  createdAt?: any
  updatedAt?: any
}

interface CandidateData {
  name: string
  email: string
  position?: string
  experience?: string
  skills?: string
  preferredDate?: string
  notes?: string
}

interface ScheduleRequest {
  csvData: string
  interviewerIds: string[]
  jobDescription?: string
  preferences?: {
    duration?: number
    timeSlots?: string[]
    timezone?: string
  }
}

interface ScheduleResponse {
  success: boolean
  schedule?: any
  error?: string
  details?: string
}

// Parse CSV data into candidate objects
function parseCSVData(csvData: string): CandidateData[] {
  try {
    const lines = csvData.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('CSV must contain at least a header row and one data row')
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const candidates: CandidateData[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const candidate: CandidateData = { name: '', email: '' }

      headers.forEach((header, index) => {
        const value = values[index] || ''
        switch (header) {
          case 'name':
          case 'full name':
          case 'candidate name':
            candidate.name = value
            break
          case 'email':
          case 'email address':
            candidate.email = value
            break
          case 'position':
          case 'role':
          case 'job title':
            candidate.position = value
            break
          case 'experience':
          case 'years of experience':
            candidate.experience = value
            break
          case 'skills':
          case 'technical skills':
            candidate.skills = value
            break
          case 'preferred date':
          case 'availability':
            candidate.preferredDate = value
            break
          case 'notes':
          case 'comments':
            candidate.notes = value
            break
        }
      })

      // Validate required fields
      if (candidate.name && candidate.email) {
        candidates.push(candidate)
      }
    }

    return candidates
  } catch (error) {
    throw new Error(`Failed to parse CSV data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Fetch interviewer details from Firestore
async function fetchInterviewers(interviewerIds: string[]): Promise<Interviewer[]> {
  try {
    const interviewers: Interviewer[] = []
    
    for (const id of interviewerIds) {
      const docRef = doc(db, 'interviewers', id)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        interviewers.push({
          id: docSnap.id,
          ...docSnap.data()
        } as Interviewer)
      }
    }

    return interviewers
  } catch (error) {
    throw new Error(`Failed to fetch interviewer data: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Construct the Master Prompt for AI scheduling
function constructMasterPrompt(candidates: CandidateData[], interviewers: Interviewer[], jobDescription: string, preferences: any = {}) {
  const duration = preferences.duration || 60
  const timezone = preferences.timezone || 'UTC'
  
  return `# AI Interview Scheduler - Saturn Principle

## MISSION
You are an advanced AI scheduling engine implementing the "Saturn Principle" - a sophisticated algorithm that creates optimal interview schedules with maximum efficiency and minimal conflicts. Generate a comprehensive interview schedule that balances interviewer workload, candidate preferences, and time zone considerations.

## INPUT DATA

### JOB DESCRIPTION:
${jobDescription}

### CANDIDATES (${candidates.length} total):
${candidates.map((candidate, index) => `
${index + 1}. **${candidate.name}**
   - Email: ${candidate.email}
   - Position: ${candidate.position || 'Not specified'}
   - Experience: ${candidate.experience || 'Not specified'}
   - Skills: ${candidate.skills || 'Not specified'}
   - Preferred Date: ${candidate.preferredDate || 'Flexible'}
   - Notes: ${candidate.notes || 'None'}
`).join('')}

### INTERVIEWERS (${interviewers.length} available):
${interviewers.map((interviewer, index) => `
${index + 1}. **${interviewer.name}**
   - Email: ${interviewer.email}
   - ID: ${interviewer.id}
   - Specialization: ${interviewer.specialization || 'General'}
   - Availability: Full availability (assume 9 AM - 5 PM weekdays)
`).join('')}

## SCHEDULING PARAMETERS
- **Interview Duration**: ${duration} minutes
- **Time Zone**: ${timezone}
- **Working Hours**: 9:00 AM - 5:00 PM (Monday-Friday)
- **Buffer Time**: 15 minutes between interviews
- **Max Interviews per Day per Interviewer**: 6

## SATURN PRINCIPLE RULES - ADVANCED AI MATCHING
1. **Technical Match Analysis**: For each candidate, analyze their provided skills against the Job Description. From the list of available interviewers, recommend the 2 most suitable interviewers prioritizing matching based on their specialization (e.g., if the job requires AI, prioritize the interviewer with "AI/ML" specialization).

2. **Skill Gap Analysis**: Identify up to 3 critical skills or technologies mentioned in the job description that are NOT present in the candidate's skills list. This helps interviewers focus on areas needing assessment.

3. **Behavioral Question Generation**: Based on the candidate's experience level and the job role, generate one insightful behavioral question to probe a key soft skill (e.g., teamwork, problem-solving, leadership, adaptability).

4. **Load Balancing**: Distribute interviews evenly across all interviewers while respecting AI matching recommendations
5. **Conflict Minimization**: Avoid scheduling conflicts and ensure adequate breaks  
6. **Preference Optimization**: Honor candidate preferred dates when possible
7. **Efficiency Maximization**: Minimize gaps and maximize productive time

## REQUIRED OUTPUT FORMAT
Return ONLY a valid JSON object with this exact structure:

\`\`\`json
{
  "success": true,
  "metadata": {
    "totalCandidates": ${candidates.length},
    "totalInterviewers": ${interviewers.length},
    "schedulingAlgorithm": "Saturn Principle v2.0",
    "generatedAt": "2024-08-24T20:00:00Z",
    "timeZone": "${timezone}",
    "duration": ${duration}
  },
  "schedule": [
    {
      "candidateId": "unique-id-1",
      "candidateName": "Candidate Name",
      "candidateEmail": "candidate@email.com",
      "interviewerId": "interviewer-firestore-id",
      "interviewerName": "Interviewer Name",
      "interviewerEmail": "interviewer@email.com",
      "date": "2024-08-26",
      "time": "10:00",
      "endTime": "11:00",
      "duration": ${duration},
      "status": "scheduled",
      "meetingRoom": "Virtual Room 1", 
      "notes": "Auto-generated by Saturn Principle",
      "matchingScore": 0.95,
      "matchingReason": "Excellent match: Candidate's React/Node.js skills align perfectly with interviewer's frontend/backend expertise",
      "skillGaps": ["GraphQL", "Docker", "AWS"],
      "behavioralQuestion": "Tell me about a time when you had to learn a new technology quickly to complete a project. How did you approach it?"
    }
  ],
  "analytics": {
    "interviewerWorkload": {
      "interviewer-id": {
        "name": "Interviewer Name",
        "totalInterviews": 3,
        "averagePerDay": 1.5,
        "utilizationRate": 0.75
      }
    },
    "scheduleEfficiency": 0.95,
    "conflictCount": 0,
    "optimizationScore": 98.5
  },
  "recommendations": [
    "Consider adding 30-minute breaks between consecutive interviews",
    "All candidates successfully scheduled within optimal time windows"
  ]
}
\`\`\`

## CRITICAL REQUIREMENTS
1. **ADVANCED AI MATCHING**: For each candidate, perform all three analyses:
   - Technical matching based on specializations and job requirements
   - Skill gap identification (3 missing skills from job description)
   - Behavioral question generation based on experience level and role
2. Return ONLY valid JSON - no markdown, no explanations, no additional text
3. Include ALL candidates in the schedule
4. Ensure NO time conflicts for any interviewer
5. Generate realistic dates (next 2 weeks, weekdays only)
6. Include proper analytics and efficiency metrics
7. Assign unique candidate IDs (can be generated)
8. **Required fields for each interview**:
   - matchingScore (0-1) and matchingReason
   - skillGaps (array of 1-3 missing skills from job description)
   - behavioralQuestion (one thoughtful question based on experience/role)

Generate the optimal schedule now using the Saturn Principle algorithm.`
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate Google Gemini API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Configuration Error', details: 'Google Gemini API key not configured' },
        { status: 500 }
      )
    }

    // Parse request body
    const body: ScheduleRequest = await request.json()
    const { csvData, interviewerIds, jobDescription = '', preferences = {} } = body

    // Validate request data
    if (!csvData || !interviewerIds || interviewerIds.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Request', 
          details: 'CSV data and interviewer IDs are required' 
        },
        { status: 400 }
      )
    }

    if (!jobDescription.trim()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid Request', 
          details: 'Job description is required for intelligent candidate-interviewer matching' 
        },
        { status: 400 }
      )
    }

    // Parse CSV data
    console.log('📄 Parsing CSV data...')
    const candidates = parseCSVData(csvData)
    
    if (candidates.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No Valid Candidates', 
          details: 'No valid candidates found in CSV data' 
        },
        { status: 400 }
      )
    }

    // Fetch interviewer details
    console.log('👥 Fetching interviewer details...')
    const interviewers = await fetchInterviewers(interviewerIds)
    
    if (interviewers.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No Valid Interviewers', 
          details: 'No valid interviewers found with provided IDs' 
        },
        { status: 400 }
      )
    }

    // Construct Master Prompt
    console.log('🧠 Constructing AI prompt...')
    const masterPrompt = constructMasterPrompt(candidates, interviewers, jobDescription, preferences)

    // Call Google Gemini API
    console.log('🤖 Calling Google Gemini API...')
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
      }
    })

    const fullPrompt = `You are an expert interview scheduler implementing the Saturn Principle algorithm. Always respond with valid JSON only.

${masterPrompt}

CRITICAL: Your response must be valid JSON only. Do not include any markdown formatting, explanations, or additional text outside the JSON structure.`

    const result = await model.generateContent(fullPrompt)
    const responseContent = result.response.text()

    if (!responseContent) {
      throw new Error('No response from Google Gemini')
    }

    // Parse and validate AI response
    console.log('✅ Parsing Gemini response...')
    
    // Clean the response to ensure it's valid JSON
    let cleanResponse = responseContent.trim()
    
    // Remove markdown code blocks if present
    if (cleanResponse.startsWith('```json')) {
      cleanResponse = cleanResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '')
    } else if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/^```\s*/, '').replace(/\s*```$/, '')
    }
    
    const aiSchedule = JSON.parse(cleanResponse)

    // Validate response structure
    if (!aiSchedule.success || !aiSchedule.schedule || !Array.isArray(aiSchedule.schedule)) {
      throw new Error('Invalid AI response structure')
    }

    // Log success
    console.log(`🎉 Successfully generated schedule for ${candidates.length} candidates with ${interviewers.length} interviewers`)

    // Return successful response
    return NextResponse.json({
      success: true,
      schedule: aiSchedule,
      requestInfo: {
        candidateCount: candidates.length,
        interviewerCount: interviewers.length,
        processedAt: new Date().toISOString(),
        userId: session.user.email
      }
    })

  } catch (error) {
    console.error('❌ Error in generate-schedule API:', error)
    
    // Determine error type and appropriate status code
    let statusCode = 500
    let errorMessage = 'Internal Server Error'
    let details = error instanceof Error ? error.message : 'Unknown error occurred'

    if (error instanceof SyntaxError) {
      statusCode = 400
      errorMessage = 'Invalid JSON in request'
    } else if (details.includes('Gemini') || details.includes('Google')) {
      errorMessage = 'AI Service Error'
    } else if (details.includes('Firebase') || details.includes('Firestore')) {
      errorMessage = 'Database Error'
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details,
        timestamp: new Date().toISOString()
      },
      { status: statusCode }
    )
  }
}
