'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function StreakToggle({ initialValue, userId }: { initialValue: boolean, userId: string }) {
  const [hideStreak, setHideStreak] = useState(initialValue)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function toggle() {
    setSaving(true)
    const newValue = !hideStreak
    await supabase
      .from('profiles')
      .update({ hide_streak: newValue })
      .eq('id', userId)
    setHideStreak(newValue)
    setSaving(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        hideStreak ? 'bg-indigo-600' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        hideStreak ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}
