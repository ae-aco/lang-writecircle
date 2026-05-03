'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

import { LANGUAGE_NAMES } from '@/lib/languages'
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
}

interface Correction {
  id: string
  corrected_content: string
  feedback_notes?: string
  created_at: string
  corrector: {
    username: string
  }
}

interface CorrectorProfile {
  username: string
}

interface DiffWord {
  text: string
  type: 'unchanged' | 'added' | 'removed'
}

export default function SubmissionDetailPage() {
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [correction, setCorrection] = useState<Correction | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [thankYouSent, setThankYouSent] = useState(false)

  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const submissionId = params.id as string

  useEffect(() => {
    fetchSubmission()
  }, [submissionId])

  const fetchSubmission = async () => {
    if (!submissionId) return

    try {
      // Fetch submission
      const { data: submissionData, error: submissionError } = await supabase
        .from('submissions')
        .select('*')
        .eq('id', submissionId)
        .single()

      if (submissionError) throw submissionError
      setSubmission(submissionData)

      // Fetch correction with corrector info
      const { data: correctionData, error: correctionError } = await supabase
        .from('corrections')
        .select(`
          *,
          corrector:profiles!corrections_corrector_id_fkey (
            username
          )
        `)
        .eq('submission_id', submissionId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (correctionError && correctionError.code !== 'PGRST116') {
        throw correctionError
      }
      setCorrection(correctionData)

      // Fetch corrector's profile
      if (correctionData?.corrector_id) {
        const { data: correctorProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', correctionData.corrector_id)
          .single()
        
        if (correctorProfile) {
          setCorrection(prev => ({
            ...prev!,
            corrector: {
              username: correctorProfile.username
            }
          }))
        }
      }

      if (correctionError && correctionError.code !== 'PGRST116') {
        throw correctionError
      }
      setCorrection(correctionData)
    } catch (err) {
      console.error('Error fetching submission:', err)
      setError('Failed to load submission')
    } finally {
      setLoading(false)
    }
  }

  const generateDiff = (original: string, corrected: string): DiffWord[] => {
  const originalWords = original.trim().split(/\s+/)
  const correctedWords = corrected.trim().split(/\s+/)
  const m = originalWords.length
  const n = correctedWords.length

  // Build LCS table
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (originalWords[i-1].toLowerCase() === correctedWords[j-1].toLowerCase()) {
        dp[i][j] = dp[i-1][j-1] + 1
      } else {
        dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
      }
    }
  }

  // Traceback
  const result: DiffWord[] = []
  let i = m, j = n
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalWords[i-1].toLowerCase() === correctedWords[j-1].toLowerCase()) {
      result.unshift({ text: correctedWords[j-1], type: 'unchanged' })
      i--; j--
    } else if (j > 0 && (i === 0 || dp[i][j-1] >= dp[i-1][j])) {
      result.unshift({ text: correctedWords[j-1], type: 'added' })
      j--
    } else {
      result.unshift({ text: originalWords[i-1], type: 'removed' })
      i--
    }
  }
  return result
}

  const renderDiff = (diff: DiffWord[]) => {
    return diff.map((word, index) => (
      <span
        key={index}
        className={
          word.type === 'added'
            ? 'text-green-700 font-medium bg-green-100 px-1 rounded mx-0.5'
            : word.type === 'removed'
            ? 'text-red-600 line-through bg-red-100 px-1 rounded mx-0.5'
            : 'mx-0.5'
        }
      >
        {word.text}
      </span>
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EDF2FB] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submission...</p>
        </div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-[#EDF2FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Submission not found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back Link */}
        <div className="mb-6">
          <a 
            href="/submissions" 
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center"
          >
            ← Back to My Submissions
          </a>
        </div>

        {/* Submission Header Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {submission.prompt || "Untitled submission"}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{LANGUAGE_NAMES[submission.language] || submission.language}</span>
              <span>•</span>
              <span>{new Date(submission.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-3">
              {correction && (
                <span className="text-sm text-gray-500">
                  Corrected by: {correction.corrector.username}
                </span>
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                correction 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {correction ? 'Corrected' : 'Awaiting Review'}
              </span>
            </div>
          </div>
        </div>

        {correction ? (
          <>
            {/* Section 1 — Your Original */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="mb-4">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Your Original</span>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">Your Original</h2>
              </div>
              <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {submission.content}
              </div>
            </div>

            {/* Section 2 — Corrected Version */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="mb-4">
                <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Corrected Version</span>
                <h2 className="text-xl font-semibold text-gray-900 mt-1">Corrected Version</h2>
              </div>
              <div className="leading-relaxed whitespace-normal break-words text-lg mb-4">
                {renderDiff(generateDiff(submission.content, correction.corrected_content))}
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 rounded">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Added
                </span>
                <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-600 rounded">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  Removed
                </span>
              </div>
            </div>

            {/* Section 3 — Corrector's Notes (only if feedback_notes exists) */}
            {correction.feedback_notes && (
              <div className="bg-white rounded-xl border-l-4 border-l-teal-400 border border-gray-100 shadow-sm p-6 mb-6">
                <div className="mb-4">
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Feedback</span>
                  <h2 className="text-xl font-semibold text-gray-900 mt-1 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Corrector's Notes
                  </h2>
                </div>
                <blockquote className="italic text-gray-600 mb-3 whitespace-pre-wrap">
                  {correction.feedback_notes}
                </blockquote>
                <p className="text-sm text-teal-600 font-medium">
                  From: {correction.corrector.username}
                </p>
              </div>
            )}

            {/* Thank You Section */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
              <p className="text-gray-700 mb-6">
                Was this correction helpful? Send a thank you to <span className="font-semibold text-indigo-600">{correction.corrector.username}</span>!
              </p>
              {!thankYouSent ? (
                <button
                  onClick={() => setThankYouSent(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                >
                  Thank You
                </button>
              ) : (
                <div className="text-green-600 font-medium">
                  Thanks sent! ✓
                </div>
              )}
            </div>
          </>
        ) : (
          /* If no correction yet */
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Still Awaiting Correction</h3>
            <p className="text-gray-600">
              Your submission is in the queue. Check back soon!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mt-8">
            {error}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}
