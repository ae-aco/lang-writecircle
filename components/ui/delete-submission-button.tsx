'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this submission?')) return
    setDeleting(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('submissions')
      .delete()
      .eq('id', submissionId)
    
    if (error) {
      alert('Failed to delete. Please try again.')
      setDeleting(false)
      return
    }
    
    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-400 hover:text-red-600 transition-colors p-1 disabled:opacity-50"
      title="Delete submission"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}