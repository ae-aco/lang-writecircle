import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { LANGUAGE_NAMES } from '@/lib/languages'
import { MessageSquare, TrendingUp, BookOpen } from 'lucide-react'

interface Submission {
  id: string
  content: string
  language: string
  created_at: string
  author_id: string
  prompt?: string
  corrections: { count: number }
  author: {
    username: string
    learning_language_level: string
  }
}

export default async function QueuePage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth')
  }

  // Get user profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('native_language')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.native_language) {
    redirect('/dashboard')
  }

  // Fetch pending submissions matching user's native language
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select(`
      *,
      corrections(count),
      author:profiles!submissions_author_id_fkey(username, learning_language_level)
    `)
    .eq('language', profile.native_language)
    .neq('author_id', user.id)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  // Fetch user stats
  const { data: totalCorrections } = await supabase
    .from('corrections')
    .select('id')
    .eq('corrector_id', user.id)

  // Fetch corrections from this week (Monday to Sunday)
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - now.getDay() + 1)
  monday.setHours(0, 0, 0, 0)
  
  const { data: weekCorrections } = await supabase
    .from('corrections')
    .select('id')
    .eq('corrector_id', user.id)
    .gte('created_at', monday.toISOString())

  // Fetch distinct languages corrected
  const { data: languagesData } = await supabase
    .from('corrections')
    .select('submission:submissions!inner(language)')
    .eq('corrector_id', user.id)

  const distinctLanguages = new Set(
    languagesData?.map((item: any) => item.submission.language) || []
  )

  const getWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(Boolean).length
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
      return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`
    } else if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`
    } else {
      const diffInDays = Math.floor(diffInHours / 24)
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  const getLevelBadge = (level: string) => {
    const badges = {
      beginner: 'bg-green-100 text-green-800',
      intermediate: 'bg-amber-100 text-amber-800',
      advanced: 'bg-purple-100 text-purple-800',
      fluent: 'bg-blue-100 text-blue-800'
    }
    return badges[level as keyof typeof badges] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Help Others Learn</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Review and correct posts from fellow learners. Every correction helps someone improve!
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Corrections Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{totalCorrections?.length || 0}</div>
                <div className="text-sm text-gray-600">Corrections given</div>
              </div>
            </div>
          </div>

          {/* This Week Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-green-100 rounded-lg p-2 mr-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{weekCorrections?.length || 0}</div>
                <div className="text-sm text-gray-600">This week</div>
              </div>
            </div>
          </div>

          {/* Languages Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-purple-100 rounded-lg p-2 mr-3">
                <BookOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{distinctLanguages.size}</div>
                <div className="text-sm text-gray-600">Languages</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {submissions && submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission: Submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {/* Avatar */}
                    <div className="bg-indigo-100 text-indigo-600 rounded-full w-10 h-10 flex items-center justify-center font-semibold text-sm mr-3">
                      {submission.author.username.charAt(0).toUpperCase()}
                    </div>
                    {/* Author Info */}
                    <div>
                      <div className="font-bold text-gray-900">{submission.author.username}</div>
                      <div className="text-sm text-gray-600">
                        {LANGUAGE_NAMES[submission.language]} · {getWordCount(submission.content)} words
                      </div>
                    </div>
                  </div>
                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadge(submission.author.learning_language_level)}`}>
                      {submission.author.learning_language_level.charAt(0).toUpperCase() + submission.author.learning_language_level.slice(1)}
                    </span>
                    {submission.corrections.count > 0 && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        {submission.corrections.count} corrections
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Preview */}
                <div className="mb-4">
                  <p className="text-gray-600 italic">
                    {submission.content.substring(0, 150)}
                    {submission.content.length > 150 && '...'}
                  </p>
                </div>

                {/* Action Button */}
                <Link href={`/correct/${submission.id}`}>
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    Start Correcting
                  </button>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions to correct right now</h3>
              <p className="text-gray-600">
                Check back soon! New submissions in {LANGUAGE_NAMES[profile.native_language] || profile.native_language} will appear here.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
