import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const LANGUAGES = {
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

const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  fluent: 'Fluent'
}

export default async function ProfilePage() {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/auth')
  }

  // Fetch user's profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profileError || !profile) {
    redirect('/auth')
  }

  // Calculate stats
  const { data: submissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('author_id', user.id)

  const { data: correctionsMade } = await supabase
    .from('corrections')
    .select('id')
    .eq('corrector_id', user.id)

  const { data: correctionsReceived } = await supabase
    .from('corrections')
    .select('id')
    .in('submission_id', 
      submissions?.map(s => s.id) || []
    )

  const submissionCount = submissions?.length || 0
  const correctionsMadeCount = correctionsMade?.length || 0
  const correctionsReceivedCount = correctionsReceived?.length || 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {profile.username}
          </h1>
          <p className="text-gray-600">Language Learning Profile</p>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-500">Native:</span>
                    <p className="font-medium text-gray-900">
                      {LANGUAGES[profile.native_language as keyof typeof LANGUAGES]}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Learning:</span>
                    <p className="font-medium text-gray-900">
                      {LANGUAGES[profile.learning_language as keyof typeof LANGUAGES]} — {LEVEL_LABELS[profile.learning_language_level as keyof typeof LEVEL_LABELS]}
                    </p>
                  </div>
                  {profile.learning_language_2 && (
                    <div>
                      <span className="text-sm text-gray-500">Also Learning:</span>
                      <p className="font-medium text-gray-900">
                        {LANGUAGES[profile.learning_language_2 as keyof typeof LANGUAGES]} — {LEVEL_LABELS[profile.learning_language_2_level as keyof typeof LEVEL_LABELS]}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Bio</h3>
                  <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
                </div>
              )}
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pages Balance</h3>
                <div className="bg-teal-50 rounded-lg p-4 text-center">
                  <p className="text-3xl font-bold text-teal-600">{profile.pages}</p>
                  <p className="text-sm text-teal-700">pages available</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Statistics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-xl font-bold text-gray-900">{submissionCount}</p>
                    <p className="text-xs text-gray-500">Posts Submitted</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-xl font-bold text-gray-900">{correctionsMadeCount}</p>
                    <p className="text-xs text-gray-500">Corrections Made</p>
                  </div>
                  <div className="text-center bg-gray-50 rounded-lg p-3">
                    <p className="text-xl font-bold text-gray-900">{correctionsReceivedCount}</p>
                    <p className="text-xs text-gray-500">Corrections Received</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Button */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link href="/profile/edit" className="w-full md:w-auto inline-block px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors text-center">
              Edit Profile
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
