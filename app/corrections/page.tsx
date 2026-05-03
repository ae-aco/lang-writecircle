import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

import { LANGUAGE_NAMES } from '@/lib/languages'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'

interface Correction {
  id: string
  corrected_content: string
  feedback_notes?: string
  created_at: string
  submission: {
    content: string
    language: string
    prompt?: string
    author: {
      username: string
    }
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
        prompt,
        author:profiles!submissions_author_id_fkey (
          username
        )
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
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Corrections</h1>
          <p className="text-gray-600">
            Track all the corrections you've made to help other language learners.
          </p>
        </div>

        {/* Corrections List */}
        {corrections && corrections.length > 0 ? (
          <div className="space-y-3">
            {corrections.map((correction: Correction) => (
              <div
                key={correction.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
              >
                {/* Top row: avatar, username, language badge */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">
                      {correction.submission?.author?.username?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900">
                      {correction.submission?.author?.username || 'Unknown'}
                    </span>
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {LANGUAGE_NAMES[correction.submission.language] || correction.submission.language}
                  </span>
                </div>

                {/* Second row: original submission content */}
                <div className="mb-3">
                  <p className="text-gray-500 italic">
                    {truncateContent(correction.submission.content, 100)}
                  </p>
                </div>

                {/* Bottom row: date and feedback badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {formatDate(correction.created_at)}
                  </span>
                  {correction.feedback_notes && (
                    <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm">
                      With feedback
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="flex justify-center">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 text-center max-w-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No corrections yet</h3>
              <p className="text-gray-600 mb-6">
                You haven't made any corrections yet. Head to the queue to get started!
              </p>
              <Link
                href="/queue"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Go to Queue
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
