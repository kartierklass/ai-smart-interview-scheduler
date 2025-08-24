'use client'

import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import AddInterviewerForm from "@/components/AddInterviewerForm"
import InterviewerList from "@/components/InterviewerList"
import BatchScheduler from "@/components/BatchScheduler"
import CalendarAuthStatus from "@/components/CalendarAuthStatus"
import CandidateFollowup from "@/components/CandidateFollowup"
import { FormPersistenceProvider } from "@/contexts/FormPersistenceContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Users, Sparkles, UserPlus, BarChart3, Settings, LogOut, Home, Zap, TrendingUp, Clock, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useSession, signOut } from "next-auth/react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  // Redirect to home if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/")
    }
  }, [status, router])

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" })
  }

  const handleHomeClick = () => {
    window.location.href = "/"
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session?.user) {
    return null
  }

  return (
    <FormPersistenceProvider>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50"
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/50 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-white shadow-lg">
                  <Sparkles className="h-6 w-6" />
                </div>
                                 <div>
                   <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent tracking-tight">
                     AI Smart Interview Scheduler
                   </h1>
                   <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                     <span>Welcome back,</span>
                     <span className="font-semibold text-slate-900">{session.user.name}</span>
                   </p>
                 </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleHomeClick}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            <Tabs defaultValue="scheduler" className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                               <div>
                 <h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h2>
                 <p className="text-sm text-slate-600 font-medium">Manage your interview scheduling workflow</p>
               </div>
                <Badge className="w-fit bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0 px-3 py-1">
                  <Zap className="h-3 w-3 mr-1" />
                  AI-Powered
                </Badge>
              </div>
              
                             <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm border border-slate-200/50 shadow-sm">
                 <TabsTrigger value="scheduler" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                   <Sparkles className="h-4 w-4" />
                   <span className="hidden sm:inline">AI Scheduler</span>
                   <span className="sm:hidden">Schedule</span>
                 </TabsTrigger>
                                 <TabsTrigger value="team" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                   <Users className="h-4 w-4" />
                   <span className="hidden sm:inline">Team Management</span>
                   <span className="sm:hidden">Team</span>
                 </TabsTrigger>
                 <TabsTrigger value="analytics" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                   <BarChart3 className="h-4 w-4" />
                   <span className="hidden sm:inline">Analytics</span>
                   <span className="sm:hidden">Stats</span>
                 </TabsTrigger>
                 <TabsTrigger value="settings" className="flex items-center gap-2 font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-500 data-[state=active]:to-gray-600 data-[state=active]:text-white data-[state=active]:shadow-md">
                   <Settings className="h-4 w-4" />
                   <span className="hidden sm:inline">Settings</span>
                   <span className="sm:hidden">Config</span>
                 </TabsTrigger>
              </TabsList>

            <TabsContent value="scheduler" className="space-y-6">
              <CalendarAuthStatus />
              <BatchScheduler />
            </TabsContent>

            <TabsContent value="team" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Add Interviewer */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                                       <CardTitle className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                     <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-emerald-600 rounded-full"></div>
                     <UserPlus className="h-5 w-5 text-green-600" />
                     Add New Interviewer
                   </CardTitle>
                    <CardDescription className="text-slate-600">
                      Add team members who will conduct interviews. They'll be available for scheduling immediately.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddInterviewerForm />
                  </CardContent>
                </Card>

                {/* Interviewer List */}
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                                       <CardTitle className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                     <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                     <Users className="h-5 w-5 text-blue-600" />
                     Interview Team
                   </CardTitle>
                    <CardDescription className="text-slate-600">
                      Manage your current team of interviewers and their availability.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div data-testid="interviewer-list">
                      <InterviewerList />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

                         <TabsContent value="analytics" className="space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                         <CardTitle className="text-sm font-bold text-slate-700">Total Interviews</CardTitle>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">0</div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      No interviews scheduled yet
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                         <CardTitle className="text-sm font-bold text-slate-700">Active Interviewers</CardTitle>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                      <Users className="h-4 w-4 text-green-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">0</div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <UserPlus className="h-3 w-3" />
                      Add team members to get started
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                         <CardTitle className="text-sm font-bold text-slate-700">Efficiency Score</CardTitle>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-slate-900">--</div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Sparkles className="h-3 w-3" />
                      Available after first batch
                    </p>
                  </CardContent>
                </Card>
              </div>

              <CandidateFollowup />

              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                                     <CardTitle className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                     <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                     <BarChart3 className="h-5 w-5 text-orange-600" />
                     AI Analytics
                   </CardTitle>
                  <CardDescription className="text-slate-600">
                    Advanced analytics and scheduling insights will appear here once you start using the system.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-40">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mx-auto mb-4">
                        <BarChart3 className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-600 font-medium">No data available yet</p>
                      <p className="text-sm text-slate-500">Schedule your first batch to see analytics</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader className="pb-4">
                                     <CardTitle className="flex items-center gap-2 text-slate-800 font-bold text-lg">
                     <div className="w-1 h-6 bg-gradient-to-b from-slate-500 to-gray-600 rounded-full"></div>
                     <Settings className="h-5 w-5 text-slate-600" />
                     System Configuration
                   </CardTitle>
                  <CardDescription className="text-slate-600">
                    Configure your interview scheduling preferences and system settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Default Interview Duration</h4>
                        <p className="text-sm text-slate-600">Standard length for each interview slot</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">60 minutes</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Calendar Integration</h4>
                        <p className="text-sm text-slate-600">Google Calendar sync status</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200">Coming Soon</Badge>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">AI Optimization Level</h4>
                        <p className="text-sm text-slate-600">Saturn Principle intensity</p>
                      </div>
                      <Badge className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-0">Maximum Efficiency</Badge>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                                                 <h4 className="font-bold text-blue-900 mb-2 text-lg">AI Smart Scheduling Active</h4>
                        <p className="text-sm text-blue-700 leading-relaxed">
                          Your scheduling engine is optimized for maximum efficiency with minimal conflicts.
                          Advanced AI algorithms will ensure optimal interviewer-candidate matching.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
                     </Tabs>
           </div>
         </div>
       </motion.div>
     </FormPersistenceProvider>
   )
 }
