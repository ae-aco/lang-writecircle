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

interface Correction {
  id: string
  corrected_content: string
  feedback_notes?: string
  created_at: string
  submission: {
    content: string
    language: string
    prompt?: string
  }
}

export default async function CorrectionsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth')
  }

  // Fetch user's corrections with submission data
  const { data: corrections, error: correctionsError } = await supabase
    .from('corrections')
    .select(`
      *,
      submission:submissions!corrections_submission_id_fkey (
        content,
        language,
        prompt
      )
    `)
    .eq('corrector_id', user.id)
    .order('created_at', { ascending: false })

  if (correctionsError) {
    console.error('Error fetching corrections:', correctionsError)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const month = date.toLocaleString('default', { month: 'long' })
    const day = date.getDate()
    const year = date.getFullYear()
    return `${month} ${day} ${year}`
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
          <h1 className="text-3xl font-bold text-gray-900 mb-4">My Corrections</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track all the corrections you've made to help other language learners improve their writing.
          </p>
        </div>

        {/* Corrections List */}
        {corrections && corrections.length > 0 ? (
          <div className="space-y-6">
            {corrections.map((correction: Correction) => (
              <div
                key={correction.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="space-y-4">
                  {/* Original Content Preview */}
                  <div>
                    {correction.submission.prompt && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-500">Prompt:</span>
                        <p className="text-gray-700 italic">{correction.submission.prompt}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500">Original:</span>
                      <p className="text-gray-800 leading-relaxed mt-1">
                        {truncateContent(correction.submission.content)}
                      </p>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        {LANGUAGE_NAMES[correction.submission.language] || correction.submission.language}
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDate(correction.created_at)}
                      </span>
                    </div>

                    {/* Feedback Indicator */}
                    {correction.feedback_notes && (
                      <div className="flex items-center text-sm text-teal-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                        With feedback
                      </div>
                    )}
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No corrections yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any corrections yet. Head to the Queue to get started!
              </p>
              <Link
                href="/queue"
                className="inline-flex items-center px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors"
              >
                Go to Queue
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
