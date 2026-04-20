import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

import { LANGUAGE_NAMES } from '@/lib/languages'

  en: 'English',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Mandarin Chinese',
  ar: 'Arabic',
  ru: 'Russian',
  hi: 'Hindi',
}

interface Submission {
  id: string
  content: string
  language: string
  created_at: string
  author_id: string
  prompt?: string
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
    .select('id, content, language, created_at, author_id, prompt')
    .eq('status', 'pending')
    .eq('language', profile.native_language)
    .neq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Corrections Queue</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Help others by correcting submissions written in your native language: 
            <span className="font-semibold text-teal-600"> {LANGUAGE_NAMES[profile.native_language] || profile.native_language}</span>
          </p>
        </div>

        {/* Submissions List */}
        {submissions && submissions.length > 0 ? (
          <div className="space-y-6">
            {submissions.map((submission: Submission) => (
              <div
                key={submission.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Content Preview */}
                  <div>
                    {submission.prompt && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Prompt:</span>
                        <p className="text-gray-700 italic">{submission.prompt}</p>
                      </div>
                    )}
                    <p className="text-gray-800 leading-relaxed">
                      {truncateContent(submission.content)}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {LANGUAGE_NAMES[submission.language] || submission.language}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(submission.created_at)}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link href={`/correct/${submission.id}`}>
                      <button className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-md text-sm font-medium transition-colors">
                        Correct This
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
