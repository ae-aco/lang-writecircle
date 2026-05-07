import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LANGUAGE_NAMES } from '@/lib/languages'
import { MessageSquare } from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import StreakToggle from '@/components/ui/streak-toggle'

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

  // Calculate stats with new queries
  const { count: correctionsMade } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .eq('corrector_id', user.id)

  const { data: userSubmissions } = await supabase
    .from('submissions')
    .select('id')
    .eq('author_id', user.id)

  const { count: correctionsReceived } = await supabase
    .from('corrections')
    .select('*', { count: 'exact', head: true })
    .in('submission_id', 
      userSubmissions?.map(s => s.id) || []
    )

  const { count: submissionsCount } = await supabase
    .from('submissions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', user.id)

  const { data: learnersHelpedData } = await supabase
    .from('corrections')
    .select('submission:submissions!corrections_submission_id_fkey(author_id)')
    .eq('corrector_id', user.id)

  const learnersHelped = new Set(
    learnersHelpedData?.map((c: any) => c.submission?.author_id).filter(Boolean)
  ).size

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Section 1 — Profile header card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {profile.username.charAt(0).toUpperCase()}
              </div>
              
              {/* Username and handle */}
              <div>
                <h2 className="text-xl font-bold text-gray-900">{profile.username}</h2>
                <p className="text-gray-500">@{profile.username}</p>
              </div>
            </div>
            
            {/* Edit Profile button */}
            <Link 
              href="/profile/edit" 
              className="border border-gray-200 text-gray-600 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm transition-colors"
            >
              Edit Profile
            </Link>
          </div>
          
          {/* Languages section */}
          <div className="mt-6 grid grid-cols-2 gap-4">
            {/* Native / Fluent */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Native / Fluent</p>
              <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm inline-block">
                {LANGUAGE_NAMES[profile.native_language as string]}
              </div>
            </div>
            
            {/* Learning */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Learning</p>
              <div className="space-y-1">
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm inline-block">
                  {LANGUAGE_NAMES[profile.learning_language as string]} ({LEVEL_LABELS[profile.learning_language_level as keyof typeof LEVEL_LABELS]})
                </div>
                {profile.learning_language_2 && (
                  <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm inline-block">
                    {LANGUAGE_NAMES[profile.learning_language_2 as string]} ({LEVEL_LABELS[profile.learning_language_2_level as keyof typeof LEVEL_LABELS]})
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 2 — Your Stats card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Your Stats</h3>
          
          {/* 2x2 grid of stats */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{submissionsCount || 0}</p>
              <p className="text-sm text-gray-600">Posts Written</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{correctionsReceived || 0}</p>
              <p className="text-sm text-gray-600">Corrections Received</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{correctionsMade || 0}</p>
              <p className="text-sm text-gray-600">Corrections Made</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{learnersHelped}</p>
              <p className="text-sm text-gray-600">Learners Helped</p>
            </div>
          </div>
          
          {/* Your Impact card */}
          <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 mt-4">
            <div className="flex items-start gap-3">
              <MessageSquare className="w-5 h-5 text-teal-600 mt-0.5" />
              <div>
                {correctionsMade && correctionsMade > 0 ? (
                  <p className="text-teal-800">
                    You've helped <span className="font-semibold">{learnersHelped}</span> {learnersHelped === 1 ? 'learner' : 'learners'} improve their writing through <span className="font-semibold">{correctionsMade}</span> {correctionsMade === 1 ? 'correction' : 'corrections'}. Every correction you give helps someone learn!
                  </p>
                ) : (
                  <p className="text-teal-800">
                    You haven't made any corrections yet. Head to the queue to get started!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Section 3 — Pages Balance card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🪙 Pages Balance
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Pages available */}
            <div className="bg-amber-50 rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{profile.pages || 0}</p>
              <p className="text-sm text-amber-600">pages available</p>
            </div>
            
            {/* How to earn pages */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">How to earn pages</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-green-600">✓</span>
                  <span>Make corrections: +1 page</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>✓</span>
                  <span>Daily streak: +1 page (coming soon)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4 — About Me card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">About Me</h3>
          {profile.bio ? (
            <p className="text-gray-600">{profile.bio}</p>
          ) : (
            <div>
              <p className="text-gray-400 italic">No bio yet.</p>
              <Link 
                href="/profile/edit" 
                className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 inline-block"
              >
                Edit about section
              </Link>
            </div>
          )}
        </div>

        {/* Section 5 — Customisation card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customisation</h3>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Hide Streak</p>
              <p className="text-sm text-gray-500">Don't show streak counter on dashboard</p>
            </div>
            
            <StreakToggle initialValue={profile.hide_streak ?? false} userId={user.id} />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
