# 🤖 AI Smart Interview Scheduler

**Transform your hiring process with intelligent, AI-powered interview scheduling that matches candidates to the perfect interviewers, eliminates conflicts, and accelerates your hiring timeline.**

The AI Smart Interview Scheduler is a cutting-edge web application that leverages artificial intelligence to revolutionize how companies conduct technical interviews. Built with modern web technologies and powered by Google's Gemini AI, this platform automates the complex process of scheduling interviews while ensuring optimal candidate-interviewer matching based on skills, experience, and availability.

---

## 🌐 Live Demo & Screenshots

**🔗 Live Demo:** [Coming Soon - Demo Link Placeholder](#)

**📸 Screenshots:**
<!-- Screenshots will be added here -->
- Homepage with professional landing page
- Dashboard with tabbed interface
- AI-powered scheduling in action
- Real-time collaboration features
- Mobile-responsive design

---

## ✨ Key Features

### 🚀 **Core AI-Powered Scheduling**
- **"Saturn Principle" AI Scheduling**: Revolutionary scheduling algorithm that optimizes interview time slots while considering multiple constraints
- **Intelligent Conflict Resolution**: Automatically detects and resolves scheduling conflicts across multiple interviewers and time zones
- **Batch Processing**: Schedule multiple candidates simultaneously with AI optimization
- **Smart Time Slot Allocation**: AI analyzes availability patterns to suggest optimal interview times

### 🎯 **Advanced AI Candidate-Interviewer Matching**
- **Skill Gap Analysis**: AI analyzes candidate skills against interviewer expertise to ensure perfect technical matches
- **Experience Level Matching**: Automatically pairs candidates with interviewers of appropriate seniority levels
- **Specialization Alignment**: Matches based on technical domains (Frontend, Backend, Full-Stack, DevOps, etc.)
- **Dynamic Scoring System**: Real-time compatibility scoring for optimal interview outcomes

### 📅 **Seamless Google Calendar Integration**
- **Automated Calendar Events**: Automatically creates Google Calendar events for all scheduled interviews
- **Real-time Availability Sync**: Integrates with Google Calendar to check interviewer availability
- **Cross-Platform Notifications**: Sends calendar invitations to all participants
- **Conflict Prevention**: Prevents double-booking by checking existing calendar entries

### 🔥 **Real-time Database & Collaboration**
- **Firestore Integration**: Real-time data synchronization across all users and devices
- **Live Interview Notes**: Collaborative note-taking during interviews with real-time updates
- **Team Collaboration**: Multiple team members can view and contribute to candidate evaluations
- **Data Persistence**: Automatic saving and backup of all interview data and notes

### 🔐 **Modern Authentication & Security**
- **Auth.js v5 Integration**: Latest authentication framework with Google OAuth
- **Secure Session Management**: JWT-based session handling with automatic token refresh
- **Google Calendar API Access**: Secure OAuth flow for calendar integration
- **Protected Routes**: Role-based access control and authentication guards

### 🎨 **Professional UI/UX Design**
- **shadcn/ui Components**: Modern, accessible UI components with consistent design system
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices
- **Framer Motion Animations**: Smooth page transitions and micro-interactions
- **Tabbed Dashboard Interface**: Organized workspace with AI Scheduler, Team Management, Analytics, and Settings
- **Dark/Light Mode Support**: Adaptive theme based on user preference

### 📧 **AI-Generated Communication**
- **Smart Email Follow-ups**: AI-generated personalized follow-up emails for candidates
- **Interview Confirmation**: Automated confirmation emails with meeting details
- **Reminder System**: Smart reminder notifications before scheduled interviews
- **Custom Templates**: AI adapts email tone and content based on interview context

### 📊 **Analytics & Insights**
- **Scheduling Analytics**: Track interview volume, success rates, and timing patterns
- **Interviewer Performance**: Monitor interviewer availability and participation rates
- **Candidate Journey Tracking**: Follow candidates through the entire interview process
- **AI Effectiveness Metrics**: Measure the success of AI-powered matching and scheduling

### 🔄 **Advanced Workflow Management**
- **Multi-stage Interview Process**: Support for multiple interview rounds and types
- **Candidate Status Tracking**: Real-time updates on interview progress and outcomes
- **Automated Follow-up Workflows**: Triggered actions based on interview outcomes
- **Integration Ready**: API endpoints for connecting with existing HR systems

---

## 🛠️ Tech Stack

### **Frontend Framework**
- **Next.js 14** - React framework with App Router for server-side rendering and routing
- **React 18** - Component-based UI library with hooks and context
- **TypeScript** - Type-safe JavaScript for better development experience

### **UI & Styling**
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **shadcn/ui** - Modern React component library with consistent design system
- **Framer Motion** - Animation library for smooth transitions and micro-interactions
- **Lucide React** - Beautiful icon library with extensive icon collection

### **Authentication & Security**
- **Auth.js (NextAuth.js v5)** - Complete authentication solution with OAuth providers
- **Google OAuth 2.0** - Secure authentication with Google accounts
- **JWT Tokens** - JSON Web Tokens for secure session management

### **Database & Backend**
- **Firebase Firestore** - NoSQL real-time database for scalable data storage
- **Firebase Admin SDK** - Server-side Firebase operations and security rules
- **Next.js API Routes** - Serverless API endpoints for backend logic

### **AI & External APIs**
- **Google Generative AI (Gemini 1.5 Flash)** - Advanced AI model for scheduling optimization and content generation
- **Google Calendar API** - Calendar integration for event creation and availability checking
- **Google APIs (googleapis)** - Comprehensive Google services integration

### **Development Tools**
- **ESLint** - Code linting for consistent code quality
- **Prettier** - Code formatting for consistent style
- **Git** - Version control system
- **npm** - Package management

### **Deployment & Infrastructure**
- **Vercel** (recommended) - Optimized hosting for Next.js applications
- **Environment Variables** - Secure configuration management
- **Edge Functions** - Serverless compute at the edge

---

## 🚀 Getting Started

Follow these steps to get the AI Smart Interview Scheduler running locally on your machine.

### **Prerequisites**
- Node.js 18+ installed on your machine
- npm or yarn package manager
- Google Cloud Platform account (for Calendar API and OAuth)
- Firebase project setup

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/ai-smart-interview-scheduler.git
cd ai-smart-interview-scheduler
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. Set Up Environment Variables**
Create a `.env.local` file in the root directory and add the following variables:

```env
# NextAuth.js Configuration
AUTH_SECRET=your-auth-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin SDK (for server-side operations)
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Private-Key-Here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Google Generative AI (Gemini)
GOOGLE_GENERATIVE_AI_API_KEY=your-gemini-api-key-here
```

### **4. Configure Google Cloud Platform**

#### **Enable Required APIs:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Google Calendar API
   - Google+ API (for OAuth)
   - Generative Language API (for Gemini)

#### **Set up OAuth 2.0:**
1. Go to "Credentials" in Google Cloud Console
2. Create OAuth 2.0 Client IDs
3. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - Your production domain when deploying

#### **Get Gemini API Key:**
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key for Gemini

### **5. Set Up Firebase**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firestore Database
4. Set up authentication with Google provider
5. Generate a service account key for admin operations

### **6. Configure Firestore Security Rules**
Set up the following Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Interviewers collection - authenticated users can read/write
    match /interviewers/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Interviews collection - authenticated users can read/write
    match /interviews/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Notes collection - authenticated users can read/write
    match /notes/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### **7. Run the Development Server**
```bash
npm run dev
# or
yarn dev
```

### **8. Access the Application**
Open [http://localhost:3000](http://localhost:3000) in your browser to see the application running.

### **9. Test the Features**
1. Sign in with your Google account
2. Add some interviewers in the Team Management tab
3. Upload a CSV file with candidate data
4. Generate an AI-powered interview schedule
5. Test the calendar integration and real-time notes

---

## 📝 Usage

### **Adding Interviewers**
1. Navigate to the "Team Management" tab
2. Fill in interviewer details including skills and experience level
3. Interviewers are automatically saved to Firestore

### **Scheduling Interviews**
1. Go to the "AI Scheduler" tab
2. Upload a CSV file with candidate information
3. Select your interviewers
4. Click "Generate Schedule" to let AI optimize the scheduling
5. Review and approve the generated schedule

### **Managing Interview Notes**
1. Click on any scheduled interview
2. Add real-time notes during the interview
3. Notes are automatically saved and synchronized across team members

---

## 🤝 Contributing

We welcome contributions to improve the AI Smart Interview Scheduler! Please feel free to submit issues, feature requests, or pull requests.

### **Development Guidelines**
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Google Gemini AI** for providing powerful AI capabilities
- **Vercel** for excellent Next.js hosting and deployment
- **shadcn** for the beautiful UI component library
- **Firebase** for reliable real-time database services
- **Auth.js** team for comprehensive authentication solutions

---

## 📧 Contact

**Developer:** Your Name  
**Email:** your.email@example.com  
**LinkedIn:** [Your LinkedIn Profile](#)  
**Portfolio:** [Your Portfolio Website](#)

---

## 🌟 Show Your Support

If you found this project helpful or interesting, please consider giving it a ⭐ on GitHub!

---

*Built with ❤️ using Next.js, AI, and modern web technologies*
