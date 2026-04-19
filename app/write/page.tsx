'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'

interface UserProfile {
  pages: number
  learning_language: string
  learning_language_2?: string
}

interface FormData {
  content: string
  language: string
  prompt: string
}

const LANGUAGES = [
  // English variants
  { code: 'en-gb', label: 'English (British)' },
  { code: 'en-us', label: 'English (American)' },
  // Spanish variants
  { code: 'es-es', label: 'Spanish (Spain)' },
  { code: 'es-latam', label: 'Spanish (Latin American)' },
  // Arabic variants
  { code: 'ar-msa', label: 'Arabic (Modern Standard)' },
  { code: 'ar-lev', label: 'Arabic (Levantine)' },
  { code: 'ar-egy', label: 'Arabic (Egyptian)' },
  // Portuguese variants
  { code: 'pt-pt', label: 'Portuguese (European)' },
  { code: 'pt-br', label: 'Portuguese (Brazilian)' },
  // African languages
  { code: 'am', label: 'Amharic' },
  { code: 'ee', label: 'Ewe' },
  { code: 'ga', label: 'Ga' },
  { code: 'ig', label: 'Igbo' },
  { code: 'ln', label: 'Lingala' },
  { code: 'nd', label: 'Ndebele' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'so', label: 'Somali' },
  { code: 'st', label: 'Sesotho' },
  { code: 'sn', label: 'Shona' },
  { code: 'sw', label: 'Swahili' },
  { code: 'ber', label: 'Tamazight' },
  { code: 'tw', label: 'Twi' },
  { code: 'wo', label: 'Wolof' },
  { code: 'xh', label: 'Xhosa' },
  { code: 'yo', label: 'Yoruba' },
  { code: 'zu', label: 'Zulu' },
  // South & Southeast Asian languages
  { code: 'bn', label: 'Bengali' },
  { code: 'my', label: 'Burmese' },
  { code: 'hi', label: 'Hindi' },
  { code: 'id', label: 'Indonesian' },
  { code: 'fa', label: 'Persian (Farsi)' },
  { code: 'sa', label: 'Sanskrit (Classical)' },
  { code: 'si', label: 'Sinhala' },
  { code: 'tl', label: 'Tagalog' },
  { code: 'ta', label: 'Tamil' },
  { code: 'th', label: 'Thai' },
  { code: 'bo', label: 'Tibetan' },
  { code: 'ur', label: 'Urdu' },
  { code: 'vi', label: 'Vietnamese' },
  // East Asian languages
  { code: 'yue', label: 'Cantonese' },
  { code: 'zh', label: 'Mandarin Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  // Middle Eastern languages
  { code: 'he', label: 'Hebrew' },
  { code: 'ku-ckb', label: 'Kurdish (Sorani)' },
  { code: 'tr', label: 'Turkish' },
  // European languages
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
]

export default function WritePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    content: '',
    language: '',
    prompt: ''
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadDraft()
    }
  }, [user])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/auth')
      return
    }
    
    setUser(session.user)
    await fetchProfile(session.user.id)
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('pages, learning_language, learning_language_2')
        .eq('id', userId)
        .single()

      if (error) throw error
      setProfile(data)
    } catch (err) {
      console.error('Error fetching profile:', err)
      setError('Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const loadDraft = async () => {
    const draftId = searchParams.get('draft')
    if (!draftId) return

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('content, language, prompt')
        .eq('id', draftId)
        .eq('author_id', user?.id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          content: data.content || '',
          language: data.language || '',
          prompt: data.prompt || ''
        })
      }
    } catch (err) {
      console.error('Error loading draft:', err)
    }
  }

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length
  const isOverLimit = wordCount > 500
  const canSubmit = !isOverLimit && wordCount > 0 && formData.language && profile?.pages! > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canSubmit || !user || !profile) return

    setSubmitting(true)
    setError(null)

    try {
      // Insert submission
      const { data: submission, error: submissionError } = await supabase
        .from('submissions')
        .insert({
          author_id: user.id,
          content: formData.content,
          language: formData.language,
          prompt: formData.prompt || null,
          status: 'pending'
        })
        .select()
        .single()

      if (submissionError) throw submissionError

      // Handle page transaction
      const { error: transactionError } = await supabase.rpc('handle_page_transaction', {
        p_user_id: user.id,
        p_amount: -1,
        p_type: 'submission_made',
        p_reference_id: submission.id
      })

      if (transactionError) throw transactionError

      router.push('/dashboard')
    } catch (err) {
      console.error('Error submitting:', err)
      setError('Failed to submit. Please try again.')
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !formData.content.trim()) return

    setSavingDraft(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const { data, error } = await supabase
        .from('submissions')
        .insert({
          author_id: user.id,
          content: formData.content,
          language: formData.language,
          prompt: formData.prompt || null,
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      setSuccessMessage('Draft saved!')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving draft:', err)
      setError('Failed to save draft. Please try again.')
    } finally {
      setSavingDraft(false)
    }
  }

  const getAvailableLanguages = () => {
    if (!profile) return []
    
    const languages = []
    const mainLang = LANGUAGES.find(l => l.code === profile.learning_language)
    if (mainLang) languages.push(mainLang)
    
    if (profile.learning_language_2) {
      const secondLang = LANGUAGES.find(l => l.code === profile.learning_language_2)
      if (secondLang) languages.push(secondLang)
    }
    
    return languages
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Write in Your Target Language</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Language Selector */}
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              >
                <option value="">Select a language</option>
                {getAvailableLanguages().map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prompt/Title */}
            <div>
              <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                Prompt or Title <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                id="prompt"
                value={formData.prompt}
                onChange={(e) => setFormData(prev => ({ ...prev, prompt: e.target.value }))}
                placeholder="e.g. My favorite hobby, A day in my life..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Content Textarea */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Your Writing
              </label>
              <textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Start writing in your target language..."
                rows={12}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                required
              />
              
              {/* Word Count */}
              <div className="mt-2 text-right">
                <span className={`text-sm ${isOverLimit ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {wordCount} / 500 words
                  {isOverLimit && ' (exceeds limit)'}
                </span>
              </div>
            </div>

            {/* Pages Notice */}
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-sm text-gray-700">
                Submitting costs <span className="font-medium text-teal-600">1 page</span>. 
                You have <span className="font-medium text-teal-600">{profile.pages} pages</span>.
              </p>
              {profile.pages === 0 && (
                <p className="text-sm text-red-600 mt-1">
                  You need more pages to submit. Help others by correcting their writing to earn pages.
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
                {successMessage}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={savingDraft || !formData.content.trim()}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  !savingDraft && formData.content.trim()
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {savingDraft ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                  canSubmit && !submitting
                    ? 'bg-teal-600 hover:bg-teal-700 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
