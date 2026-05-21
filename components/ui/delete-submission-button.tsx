'use client'

import { Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function DeleteSubmissionButton({ submissionId }: { submissionId: string }) {
  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this submission?')) return
    const supabase = createClient()
    await supabase.from('submissions').delete().eq('id', submissionId)
    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 transition-colors p-1"
      title="Delete submission"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}