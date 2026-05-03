'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'

interface Submission {
  id: string
  content: string
  language: string
  prompt?: string
  author_id: string
  status: string
  created_at: string
  author: {
    username: string
    learning_language_level: string
  }
}

interface FormData {
  corrected_content: string
  feedback_notes: string
}

const LEVEL_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
  fluent: 'Fluent'
}

export default function CorrectPage() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<FormData>({
    corrected_content: '',
    feedback_notes: ''
  })

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const submissionId = params.id as string

  useEffect(() => {
    checkUser()
    fetchSubmission()
  }, [submissionId])

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      router.push('/auth')
      return
    }
    setUser(session.user)
  }

  const fetchSubmission = async () => {
    if (!submissionId) return

    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          author:profiles!submissions_author_id_fkey (
            username,
            learning_language_level
          )
        `)
        .eq('id', submissionId)
        .single()

      if (error) throw error
      setSubmission(data)
      setFormData(prev => ({
        ...prev,
        corrected_content: data.content || ''
      }))
    } catch (err) {
      console.error('Error fetching submission:', err)
      setError('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user || !submission || !formData.corrected_content.trim()) return

    setSubmitting(true)
    setError(null)

    try {
      // Insert correction
      const { data: correction, error: correctionError } = await supabase
        .from('corrections')
        .insert({
          submission_id: submission.id,
          corrector_id: user.id,
          corrected_content: formData.corrected_content,
          feedback_notes: formData.feedback_notes || null
        })
        .select()
        .single()

      if (correctionError) throw correctionError

      // Update submission status
      const { error: updateError } = await supabase
        .from('submissions')
        .update({ status: 'corrected' })
        .eq('id', submission.id)

      if (updateError) throw updateError

      // Award page to corrector
      const { error: transactionError } = await supabase.rpc('handle_page_transaction', {
        p_user_id: user.id,
        p_amount: 1,
        p_type: 'correction_given',
        p_reference_id: correction.id
      })

      if (transactionError) throw transactionError

      // Record user activity
      await supabase.rpc('record_user_activity', {
        p_user_id: user.id,
        p_activity_type: 'correction'
      })

      router.push('/queue')
    } catch (err) {
      console.error('Error submitting correction:', err)
      setError('Failed to submit correction. Please try again.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Submission not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Correct Submission</h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Author: <span className="font-medium text-gray-900">{submission.author.username}</span></span>
            <span>Level: <span className="font-medium text-indigo-600">{LEVEL_LABELS[submission.author.learning_language_level as keyof typeof LEVEL_LABELS]}</span></span>
            {submission.prompt && (
              <span>Prompt: <span className="font-medium text-gray-900">{submission.prompt}</span></span>
            )}
          </div>
        </div>

        {/* Two Panel Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Original Text Panel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Original Text</h2>
            <div className="bg-gray-50 p-4 rounded-md min-h-[400px]">
              <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {submission.content}
              </p>
            </div>
          </div>

          {/* Correction Panel */}
          <div className="space-y-6">
            {/* Corrected Text */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Corrected Text</h2>
              <textarea
                value={formData.corrected_content}
                onChange={(e) => setFormData(prev => ({ ...prev, corrected_content: e.target.value }))}
                className="w-full h-64 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Make your corrections here..."
              />
            </div>

            {/* Feedback Notes */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Feedback Notes <span className="text-gray-400 font-normal">(optional)</span>
              </h2>
              <textarea
                value={formData.feedback_notes}
                onChange={(e) => setFormData(prev => ({ ...prev, feedback_notes: e.target.value }))}
                rows={6}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                placeholder="Add helpful feedback about the corrections you made..."
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={submitting || !formData.corrected_content.trim()}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                !submitting && formData.corrected_content.trim()
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Submitting...' : 'Submit Correction'}
            </button>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
