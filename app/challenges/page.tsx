import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'
import { Heart, Music, Film, Gamepad2, Coffee, BookOpen, Plane, Sun, Lock, Sparkles } from 'lucide-react'

const CHALLENGES = [
  { id: 1, title: '30 Days of Gratitude', description: 'Write about something you\'re grateful for each day', days: 30, pages: 3, icon: 'Heart', color: 'rose' },
  { id: 2, title: 'Music & Memories', description: 'Describe songs that shaped your life', days: 7, pages: 2, icon: 'Music', color: 'purple' },
  { id: 3, title: 'Cinema Stories', description: 'Review and reflect on films you\'ve watched', days: 14, pages: 5, icon: 'Film', color: 'amber' },
  { id: 4, title: 'Gaming Chronicles', description: 'Share your gaming experiences and adventures', days: 14, pages: 5, icon: 'Gamepad2', color: 'teal' },
  { id: 5, title: 'Coffee & Conversations', description: 'Document meaningful conversations over coffee', days: 7, pages: 3, icon: 'Coffee', color: 'orange' },
  { id: 6, title: 'Reader\'s Journey', description: 'Reflect on books that changed your perspective', days: 14, pages: 5, icon: 'BookOpen', color: 'blue' },
  { id: 7, title: 'Travel Tales', description: 'Describe places you\'ve been or dream of visiting', days: 14, pages: 5, icon: 'Plane', color: 'sky' },
  { id: 8, title: 'Daily Moments', description: 'Capture the beauty in everyday life', days: 7, pages: 3, icon: 'Sun', color: 'yellow' },
]

const iconMap = {
  Heart,
  Music,
  Film,
  Gamepad2,
  Coffee,
  BookOpen,
  Plane,
  Sun,
}

const colorClasses = {
  rose: 'bg-rose-100 text-rose-600',
  purple: 'bg-purple-100 text-purple-600',
  amber: 'bg-amber-100 text-amber-600',
  teal: 'bg-teal-100 text-teal-600',
  orange: 'bg-orange-100 text-orange-600',
  blue: 'bg-blue-100 text-blue-600',
  sky: 'bg-sky-100 text-sky-600',
  yellow: 'bg-yellow-100 text-yellow-600',
}

export default async function ChallengesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Writing Challenges</h1>
          <p className="text-gray-600">
            Push your writing skills with themed challenges. Earn pages by writing and correcting to unlock them when they launch.
          </p>
        </div>

        {/* Coming soon banner */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-8 flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <span className="text-indigo-800 font-medium">Challenges launching soon! Keep earning pages to be ready.</span>
        </div>

        {/* Challenge cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CHALLENGES.map((challenge) => {
            const IconComponent = iconMap[challenge.icon as keyof typeof iconMap]
            const iconColorClass = colorClasses[challenge.color as keyof typeof colorClasses]
            
            return (
              <div key={challenge.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 opacity-75">
                {/* Top row with icon and lock badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconColorClass}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="bg-gray-100 text-gray-500 rounded-full px-3 py-1 text-xs flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {challenge.pages} pages
                  </div>
                </div>

                {/* Challenge title */}
                <h3 className="font-bold text-gray-900 mb-2">{challenge.title}</h3>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>

                {/* Duration */}
                <p className="text-gray-500 text-xs">{challenge.days} days</p>
              </div>
            )
          })}
        </div>
      </div>

      <Footer />
    </div>
  )
}
