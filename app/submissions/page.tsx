import DeleteSubmissionButton from '@/components/ui/delete-submission-button'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LANGUAGE_NAMES } from '@/lib/languages'
import { CheckCircle, Clock, PenLine } from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'

interface Submission {
  id: string
  content: string
  language: string
  prompt?: string
  status: string
  created_at: string
}

export default async function SubmissionsPage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth')
  }

  // Fetch user's submissions
  const { data: submissions, error: submissionsError } = await supabase
    .from('submissions')
    .select('*')
    .eq('author_id', user.id)
    .order('created_at', { ascending: false })

  if (submissionsError) {
    console.error('Error fetching submissions:', submissionsError)
  }

  // Group submissions by status
  const awaitingCorrection = submissions?.filter(s => s.status === 'pending' || s.status === 'in_progress') || []
  const correctedSubmissions = submissions?.filter(s => s.status === 'corrected') || []

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength).trim() + '...'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-700'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700'
      case 'corrected':
        return 'bg-green-100 text-green-700'
      case 'draft':
        return 'bg-gray-100 text-gray-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting Review'
      case 'in_progress':
        return 'In Progress'
      case 'corrected':
        return 'Corrected'
      case 'draft':
        return 'Draft'
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Submissions</h1>
          <p className="text-gray-600">Track all your writing submissions and their correction status.</p>
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="space-y-8">
            {/* Awaiting Correction Section */}
            {awaitingCorrection.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-amber-500" />
                  Awaiting Correction ({awaitingCorrection.length})
                </h2>
                <div className="space-y-3">
                  {awaitingCorrection.map((submission: Submission) => (
                    <div
                      key={submission.id}
                      className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
                    >
                      {/* Top row: title and status badge */}
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-bold text-gray-900 flex-1 mr-4">
                          {submission.prompt || truncateContent(submission.content, 50)}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                          {getStatusText(submission.status)}
                        </span>
                      </div>

                      {/* Second row: language and date */}
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span>{LANGUAGE_NAMES[submission.language] || submission.language}</span>
                        <span className="mx-2">•</span>
                        <span>{formatDate(submission.created_at)}</span>
                      </div>

                      {/* Bottom row: awaiting correction text + delete button */}
                      <div className="flex justify-between items-center">
                        <DeleteSubmissionButton submissionId={submission.id} />
                        <span className="text-gray-400 text-sm">Awaiting correction...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrected Submissions Section */}
            {correctedSubmissions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  Corrected ({correctedSubmissions.length})
                </h2>
                <div className="space-y-3">
                  {correctedSubmissions.map((submission: Submission) => (
                    <Link
                      key={submission.id}
                      href={`/submissions/${submission.id}`}
                      className="block"
                    >
                      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                        {/* Top row: title and status badge */}
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="font-bold text-gray-900 flex-1 mr-4">
                            {submission.prompt || truncateContent(submission.content, 50)}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                            {getStatusText(submission.status)}
                          </span>
                        </div>

                        {/* Second row: language and date */}
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <span>{LANGUAGE_NAMES[submission.language] || submission.language}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(submission.created_at)}</span>
                        </div>

                        {/* Bottom row: view correction link */}
                        <div className="text-right">
                          <span className="text-indigo-600 text-sm font-medium">View Correction →</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-100 shadow-sm p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <PenLine className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">You haven't written anything yet</h3>
              <p className="text-gray-600 mb-6">
                Start writing in your target language and submit for correction.
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
              >
                Write Something
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
