import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
            <p className="text-3xl font-bold text-teal-600">0</p>
            <p className="text-sm text-gray-500 mt-1">Submissions</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <p className="text-3xl font-bold text-teal-600">0</p>
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
      </div>
    </div>
  )
}