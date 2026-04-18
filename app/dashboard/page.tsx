import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) redirect('/auth')

  // Fetch real stats
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

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-teal-600 mb-2">
          Welcome back, {profile.username}! 👋
        </h1>
        <p className="text-gray-500 mb-6">Your WriteCircle dashboard</p>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-teal-600">{profile.pages}</p>
            <p className="text-sm text-gray-500 mt-1">Pages</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-teal-600">{submissionCount}</p>
            <p className="text-sm text-gray-500 mt-1">Submissions</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-teal-600">{correctionCount}</p>
            <p className="text-sm text-gray-500 mt-1">Corrections</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-1">Your Languages</h2>
          <p className="text-sm text-gray-500">
            Native: <span className="font-medium text-gray-700">{profile.native_language}</span>
          </p>
          <p className="text-sm text-gray-500">
            Learning: <span className="font-medium text-gray-700">{profile.learning_language}</span>
            {' '}— {profile.learning_language_level}
          </p>
          {profile.learning_language_2 && (
            <p className="text-sm text-gray-500">
              Also learning: <span className="font-medium text-gray-700">{profile.learning_language_2}</span>
              {' '}— {profile.learning_language_2_level}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link
              href="/write"
              className="flex items-center justify-center px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Write Something
            </Link>
            <Link
              href="/queue"
              className="flex items-center justify-center px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              View Queue
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}