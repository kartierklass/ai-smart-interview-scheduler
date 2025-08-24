import { auth } from '@/lib/auth'
import { NextResponse, NextRequest } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Email generation request interface
interface EmailRequest {
  candidateName: string
  jobRole: string
  interviewerName: string
  emailType: 'offer' | 'rejection'
  interviewDate?: string
  interviewTime?: string
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized', details: 'Authentication required' },
        { status: 401 }
      )
    }

    // Validate Gemini API key
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.error('❌ GOOGLE_GEMINI_API_KEY not found in environment variables')
      return NextResponse.json(
        { success: false, error: 'Configuration Error', details: 'AI service not configured' },
        { status: 500 }
      )
    }

    // Parse and validate request body
    const requestBody: EmailRequest = await request.json()
    const { candidateName, jobRole, interviewerName, emailType, interviewDate, interviewTime } = requestBody

    // Validation
    if (!candidateName || !jobRole || !interviewerName || !emailType) {
      return NextResponse.json(
        { success: false, error: 'Invalid Request', details: 'Missing required fields: candidateName, jobRole, interviewerName, emailType' },
        { status: 400 }
      )
    }

    if (!['offer', 'rejection'].includes(emailType)) {
      return NextResponse.json(
        { success: false, error: 'Invalid Request', details: 'emailType must be either "offer" or "rejection"' },
        { status: 400 }
      )
    }

    console.log(`📧 Generating ${emailType} email for ${candidateName} (${jobRole})`)

    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json"
      }
    })

    // Construct the email generation prompt
    const emailPrompt = constructEmailPrompt(requestBody)

    console.log('🤖 Sending prompt to Gemini AI...')

    // Generate email using Gemini
    const result = await model.generateContent(emailPrompt)
    const aiResponse = result.response.text()

    console.log('✅ Received response from Gemini AI')

    // Clean the response (remove markdown code blocks if present)
    const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    let emailData
    try {
      emailData = JSON.parse(cleanResponse)
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response as JSON:', parseError)
      console.error('Raw response:', aiResponse)
      throw new Error('Invalid AI response format')
    }

    // Validate the AI response structure
    if (!emailData.subject || !emailData.body) {
      console.error('❌ Invalid email structure from AI:', emailData)
      throw new Error('AI response missing required email fields')
    }

    console.log(`✅ Successfully generated ${emailType} email for ${candidateName}`)

    return NextResponse.json({
      success: true,
      email: {
        subject: emailData.subject,
        body: emailData.body,
        type: emailType,
        generatedAt: new Date().toISOString()
      },
      metadata: {
        candidateName,
        jobRole,
        interviewerName,
        emailType,
        userId: session.user.email,
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('❌ Email generation error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Email Generation Failed', 
        details: error instanceof Error ? error.message : 'Unknown error occurred' 
      },
      { status: 500 }
    )
  }
}

function constructEmailPrompt(request: EmailRequest): string {
  const { candidateName, jobRole, interviewerName, emailType, interviewDate, interviewTime } = request
  
  const baseContext = `
Generate a professional ${emailType} email for a job interview follow-up.

CONTEXT:
- Candidate Name: ${candidateName}
- Job Role: ${jobRole}
- Interviewer: ${interviewerName}
- Interview Date: ${interviewDate || 'Recent'}
- Interview Time: ${interviewTime || 'N/A'}
- Email Type: ${emailType}
`

  if (emailType === 'offer') {
    return `${baseContext}

REQUIREMENTS FOR JOB OFFER EMAIL:
1. Professional and enthusiastic tone
2. Congratulate the candidate on their successful interview
3. Formally offer them the ${jobRole} position
4. Mention positive feedback from ${interviewerName}
5. Include next steps (HR contact, paperwork, start date discussion)
6. Express excitement about them joining the team
7. Provide a reasonable timeframe for response (e.g., 1 week)
8. Include contact information for questions

TONE: Warm, professional, congratulatory, and welcoming

REQUIRED JSON OUTPUT FORMAT:
{
  "subject": "Job Offer - ${jobRole} Position at [Company Name]",
  "body": "Professional email body content here..."
}

Generate a complete, ready-to-send job offer email. Make it personalized and professional.`

  } else {
    return `${baseContext}

REQUIREMENTS FOR REJECTION EMAIL:
1. Professional and respectful tone
2. Thank the candidate for their time and interest
3. Acknowledge their qualifications and interview performance
4. Politely inform them they will not be moving forward
5. Provide constructive but brief feedback if appropriate
6. Encourage them to apply for future opportunities
7. Wish them well in their job search
8. Keep it concise but empathetic

TONE: Respectful, empathetic, professional, and encouraging

REQUIRED JSON OUTPUT FORMAT:
{
  "subject": "Update on Your ${jobRole} Application",
  "body": "Professional email body content here..."
}

Generate a complete, ready-to-send rejection email that maintains the candidate's dignity while being clear about the decision.`
  }
}
