'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useParams } from 'next/navigation'

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Submission</h1>
          {correction && (
            <p className="text-lg text-gray-600 mb-4">Corrected by: <span className="font-medium text-teal-600">{correction.corrector.username}</span></p>
          )}
          {submission.prompt && (
            <p className="text-lg text-gray-600">Prompt: {submission.prompt}</p>
          )}
        </div>

        {correction ? (
          <>
            {/* Your Original Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Original</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {submission.content}
                </p>
              </div>
            </div>

            {/* Corrected Version Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Corrected Version</h2>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="leading-relaxed whitespace-normal break-words text-lg">
                  {renderDiff(generateDiff(submission.content, correction.corrected_content))}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="inline-flex items-center">
                  <span className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></span>
                  Added
                </span>
                <span className="inline-flex items-center ml-4">
                  <span className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></span>
                  Removed
                </span>
              </div>
            </div>

            {/* Corrector's Notes Section */}
            {correction.feedback_notes && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Corrector's Notes</h2>
                <blockquote className="border-l-4 border-teal-500 pl-4 italic text-gray-700 bg-teal-50 p-4 rounded-r-md">
                  <p className="whitespace-pre-wrap">{correction.feedback_notes}</p>
                </blockquote>
                <p className="mt-3 text-sm text-gray-600">
                  From: <span className="font-medium text-teal-600">{correction.corrector.username}</span>
                </p>
              </div>
            )}

            {/* Thank You Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Was this correction helpful? Send a thank you to <span className="font-medium text-teal-600">{correction.corrector.username}</span>!
                </p>
                {!thankYouSent ? (
                  <button
                    onClick={() => setThankYouSent(true)}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
                  >
                    Thank You
                  </button>
                ) : (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md inline-block">
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Thanks sent! ✓
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Correction in Progress</h3>
            <p className="text-gray-600">
              Still awaiting correction — check back soon!
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
    </div>
  )
}
