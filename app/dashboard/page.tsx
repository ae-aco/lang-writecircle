import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LANGUAGE_NAMES } from '@/lib/languages'

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PROMPTS = [
  "Describe what you did this morning in as much detail as possible.",
  "Write about a place that makes you feel happy and why.",
  "Describe your favourite meal and how it is made.",
  "Write about a person who has influenced your life.",
  "Describe the view from your window right now.",
  "Write about a childhood memory that makes you smile.",
  "Describe your ideal weekend from morning to night.",
  "Write about a skill you want to learn and why.",
  "Describe the last film or show you watched.",
  "Write about what your city or town is like.",
  "Describe a tradition or celebration that is important to you.",
  "Write about an object in your home that has a story behind it.",
  "Describe the best gift you have ever received.",
  "Write about something that made you laugh recently.",
  "Describe your morning routine step by step.",
  "Write about a goal you are working towards right now.",
  "Describe the most beautiful place you have ever visited.",
  "Write about what friendship means to you.",
  "Describe a challenge you overcame and what you learned.",
  "Write about your favourite season and why you love it.",
  "Describe what a perfect day looks like to you.",
  "Write about a book or song that changed how you think.",
  "Describe your hometown to someone who has never been there.",
  "Write about something you are grateful for today.",
  "Describe a hobby you enjoy and how you got into it.",
  "Write about the most interesting person you have ever met.",
  "Describe what you would do with an unexpected free day.",
  "Write about a time you tried something new.",
  "Describe your favourite way to relax after a long day.",
  "Write about something you wish more people knew about your culture.",
]

function getTodaysPrompt(): string {
  const start = new Date('2026-01-01')
  const today = new Date()
  const dayIndex = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  return PROMPTS[dayIndex % PROMPTS.length]
}

function getWeekDates() {
  const today = new Date()
  const currentDay = today.getDay()
  const diff = today.getDate() - currentDay + (currentDay === 0 ? -6 : 1)
  const monday = new Date(today.setDate(diff))
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(monday)
    date.setDate(monday.getDate() + i)
    weekDates.push(date)
  }
  
  return weekDates
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'corrected':
      return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Corrected</span>
    case 'in_progress':
      return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>
    case 'pending':
      return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending</span>
    case 'draft':
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Draft</span>
    default:
      return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">{status}</span>
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth')

  // Fetch counts
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('author_id', user.id)
  
  const { data: corrections } = await supabase
    .from('corrections')
    .select('id')
    .eq('corrector_id', user.id)

  const submissionCount = submissions?.length || 0
  const correctionCount = corrections?.length || 0

  // Fetch recent submissions
  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select('id, content, prompt, language, status, created_at')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // Get user streak
  const { data: streakData } = await supabase.rpc('get_user_streak', { user_id: user.id })
  const currentStreak = streakData || 0

  // Get user activity for current week
  const weekDates = getWeekDates()
  const weekStart = weekDates[0].toISOString().split('T')[0]
  const weekEnd = weekDates[6].toISOString().split('T')[0]
  
  const { data: userActivity } = await supabase
    .from('user_activity')
    .select('activity_date')
    .eq('user_id', user.id)
    .gte('activity_date', weekStart)
    .lte('activity_date', weekEnd)

  const activityDates = new Set(userActivity?.map(a => a.activity_date) || [])

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="min-h-screen bg-[#EDF2FB] p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Section 1 - Welcome Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile.username}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Keep up your learning streak and help others improve
          </p>
        </div>

        {/* Section 2 - Streak Calendar */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center mb-4">
            <svg className="w-6 h-6 text-indigo-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Your Streak</h2>
          </div>
          
          <div className="grid grid-cols-7 gap-2 mb-4">
            {weekDates.map((date, index) => {
              const dateStr = date.toISOString().split('T')[0]
              const isToday = dateStr === today
              const hasActivity = activityDates.has(dateStr)
              
              return (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-500 mb-1">
                    {DAY_NAMES[date.getDay()]}
                  </div>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-1 ${
                    isToday ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {date.getDate()}
                  </div>
                  <div className={`w-2 h-2 rounded-full mx-auto ${
                    hasActivity ? 'bg-indigo-600' : 'bg-gray-300'
                  }`} />
                </div>
              )
            })}
          </div>
          
          <div className="text-center">
            <span className="text-lg font-semibold text-gray-900">
              🔥 {currentStreak} day streak
            </span>
          </div>
        </div>

        {/* Section 3 - Help Others Learn CTA */}
        <div className="bg-teal-50 border border-teal-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-teal-100 rounded-full p-3">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-teal-900 mb-1">Help Others Learn</h3>
                <p className="text-teal-700">
                  Review posts and provide corrections to fellow learners
                </p>
              </div>
            </div>
            <Link
              href="/queue"
              className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Correcting
            </Link>
          </div>
        </div>

        {/* Section 4 - Prompt of the Day */}
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-4">
            <span className="text-2xl mr-2">✨</span>
            <h2 className="text-lg font-semibold text-gray-900">Prompt of the Day</h2>
          </div>
          <p className="text-gray-700 mb-4">
            {getTodaysPrompt()}
          </p>
          <Link
            href="/write"
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Start Writing
          </Link>
        </div>

        {/* Section 5 - My Submissions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">My Submissions</h2>
            <Link
              href="/submissions"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              See all
            </Link>
          </div>
          
          {recentSubmissions && recentSubmissions.length > 0 ? (
            <div className="space-y-3">
              {recentSubmissions.map((submission) => (
                <div
                  key={submission.id}
                  className={`border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors ${
                    submission.status === 'corrected' ? 'cursor-pointer' : ''
                  }`}
                >
                  {submission.status === 'corrected' ? (
                    <Link href={`/submissions/${submission.id}`} className="block">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-gray-900 font-medium mb-1">
                            {submission.prompt || submission.content.substring(0, 40)}
                            {(!submission.prompt && submission.content.length > 40) ? '...' : ''}
                          </p>
                          <p className="text-sm text-gray-500">
                            {LANGUAGE_NAMES[submission.language] || submission.language}
                          </p>
                        </div>
                        {getStatusBadge(submission.status)}
                      </div>
                    </Link>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium mb-1">
                          {submission.prompt || submission.content.substring(0, 40)}
                          {(!submission.prompt && submission.content.length > 40) ? '...' : ''}
                        </p>
                        <p className="text-sm text-gray-500">
                          {LANGUAGE_NAMES[submission.language] || submission.language}
                        </p>
                      </div>
                      {getStatusBadge(submission.status)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                You haven't written anything yet. Start writing!
              </p>
              <Link
                href="/write"
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Start Writing
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}