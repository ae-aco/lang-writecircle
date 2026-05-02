import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LANGUAGE_NAMES } from '@/lib/languages'

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'corrected':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Submissions</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track all your writing submissions and their correction status.
          </p>
        </div>

        {submissions && submissions.length > 0 ? (
          <div className="space-y-12">
            {/* Awaiting Correction Section */}
            {awaitingCorrection.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Awaiting Correction ({awaitingCorrection.length})
                </h2>
                <div className="grid gap-6">
                  {awaitingCorrection.map((submission: Submission) => (
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

                          {/* Status Badge */}
                          <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(submission.status)}`}>
                              {getStatusText(submission.status)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Corrected Submissions Section */}
            {correctedSubmissions.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Corrected ({correctedSubmissions.length})
                </h2>
                <div className="grid gap-6">
                  {correctedSubmissions.map((submission: Submission) => (
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

                          {/* View Details Link */}
                          <Link
                            href={`/submissions/${submission.id}`}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
                          >
                            View Details
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600 mb-6">
                Ready to start writing and improving your language skills? Write your first post to get corrections from native speakers!
              </p>
              <Link
                href="/write"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md transition-colors"
              >
                Write Your First Post
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
