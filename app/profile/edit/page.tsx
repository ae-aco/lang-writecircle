'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'

const LANGUAGES = [
  { code: 'en-gb', label: 'English (British)' },
  { code: 'en-us', label: 'English (American)' },
  { code: 'es-es', label: 'Spanish (Spain)' },
  { code: 'es-latam', label: 'Spanish (Latin American)' },
  { code: 'ar-msa', label: 'Arabic (Modern Standard)' },
  { code: 'ar-lev', label: 'Arabic (Levantine)' },
  { code: 'ar-egy', label: 'Arabic (Egyptian)' },
  { code: 'pt-pt', label: 'Portuguese (European)' },
  { code: 'pt-br', label: 'Portuguese (Brazilian)' },
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
  { code: 'yue', label: 'Cantonese' },
  { code: 'zh', label: 'Mandarin Chinese' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'he', label: 'Hebrew' },
  { code: 'ku-ckb', label: 'Kurdish (Sorani)' },
  { code: 'tr', label: 'Turkish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'it', label: 'Italian' },
  { code: 'ru', label: 'Russian' },
]

const LEVELS = [
  { code: 'beginner', label: 'Beginner' },
  { code: 'intermediate', label: 'Intermediate' },
  { code: 'advanced', label: 'Advanced' },
  { code: 'fluent', label: 'Fluent' },
]

interface UserProfile {
  id: string
  username: string
  native_language: string
  learning_language: string
  learning_language_level: string
  learning_language_2?: string
  learning_language_2_level?: string
  bio?: string
}

function SearchableSelect({
  id, value, onChange, options, placeholder
}: {
  id: string
  value: string
  onChange: (v: string) => void
  options: { code: string; label: string }[]
  placeholder: string
}) {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

  const sorted = [...options].sort((a, b) => a.label.localeCompare(b.label))
  const filtered = sorted.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )
  const selected = options.find(o => o.code === value)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white text-left focus:outline-none focus:ring-2 focus:ring-teal-500 flex justify-between items-center"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {open && (
        <div className="absolute z-20 w-full bottom-full mb-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search languages..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              autoFocus
            />
          </div>
          <ul className="max-h-48 overflow-y-auto">
            <li>
              <button
                type="button"
                onClick={() => { onChange(''); setOpen(false); setSearch('') }}
                className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:bg-gray-50"
              >
                {placeholder}
              </button>
            </li>
            {filtered.map(o => (
              <li key={o.code}>
                <button
                  type="button"
                  onClick={() => { onChange(o.code); setOpen(false); setSearch('') }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-teal-50 hover:text-teal-700 ${
                    value === o.code ? 'bg-teal-50 text-teal-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {o.label}
                </button>
              </li>
            ))}
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-sm text-gray-400">No languages found</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function EditProfilePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // Form states
  const [nativeLanguage, setNativeLanguage] = useState('')
  const [learningLanguage, setLearningLanguage] = useState('')
  const [learningLevel, setLearningLevel] = useState('')
  const [learningLanguage2, setLearningLanguage2] = useState('')
  const [learningLevel2, setLearningLevel2] = useState('')
  const [bio, setBio] = useState('')

  // Password states
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Message states
  const [languagesMessage, setLanguagesMessage] = useState('')
  const [languagesError, setLanguagesError] = useState('')
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [bioMessage, setBioMessage] = useState('')
  const [bioError, setBioError] = useState('')

  // Loading states
  const [savingLanguages, setSavingLanguages] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingBio, setSavingBio] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth')
        return
      }

      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      setProfile(profileData)

      // Set form values
      setNativeLanguage(profileData.native_language || '')
      setLearningLanguage(profileData.learning_language || '')
      setLearningLevel(profileData.learning_language_level || '')
      setLearningLanguage2(profileData.learning_language_2 || '')
      setLearningLevel2(profileData.learning_language_2_level || '')
      setBio(profileData.bio || '')
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveLanguages = async () => {
    setSavingLanguages(true)
    setLanguagesMessage('')
    setLanguagesError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const updateData: any = {
        native_language: nativeLanguage,
        learning_language: learningLanguage,
        learning_language_level: learningLevel,
      }

      if (learningLanguage2) {
        updateData.learning_language_2 = learningLanguage2
        updateData.learning_language_2_level = learningLevel2
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (error) throw error
      setLanguagesMessage('Saved!')
      setTimeout(() => setLanguagesMessage(''), 3000)
    } catch (error) {
      console.error('Error saving languages:', error)
      setLanguagesError('Failed to save languages')
    } finally {
      setSavingLanguages(false)
    }
  }

  const savePassword = async () => {
    setSavingPassword(true)
    setPasswordMessage('')
    setPasswordError('')

    try {
      if (newPassword !== confirmPassword) {
        setPasswordError('Passwords do not match')
        setSavingPassword(false)
        return
      }

      if (newPassword.length < 6) {
        setPasswordError('Password must be at least 6 characters')
        setSavingPassword(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      setPasswordMessage('Password updated!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setTimeout(() => setPasswordMessage(''), 3000)
    } catch (error) {
      console.error('Error updating password:', error)
      setPasswordError('Failed to update password')
    } finally {
      setSavingPassword(false)
    }
  }

  const saveBio = async () => {
    setSavingBio(true)
    setBioMessage('')
    setBioError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase
        .from('profiles')
        .update({ bio })
        .eq('id', user.id)

      if (error) throw error
      setBioMessage('Saved!')
      setTimeout(() => setBioMessage(''), 3000)
    } catch (error) {
      console.error('Error saving bio:', error)
      setBioError('Failed to save bio')
    } finally {
      setSavingBio(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Edit Profile</h1>
          <p className="text-lg text-gray-600">Update your language preferences and account settings</p>
        </div>

        {/* Languages Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Languages</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Native Language
              </label>
              <SearchableSelect
                id="native"
                value={nativeLanguage}
                onChange={setNativeLanguage}
                options={LANGUAGES}
                placeholder="Select your native language"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Language 1
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  id="learning"
                  value={learningLanguage}
                  onChange={setLearningLanguage}
                  options={LANGUAGES}
                  placeholder="Select a language"
                />
                <select
                  value={learningLevel}
                  onChange={e => setLearningLevel(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select level</option>
                  {LEVELS.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Learning Language 2 (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  id="learning2"
                  value={learningLanguage2}
                  onChange={setLearningLanguage2}
                  options={LANGUAGES}
                  placeholder="None"
                />
                <select
                  value={learningLevel2}
                  onChange={e => setLearningLevel2(e.target.value)}
                  className="border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={!learningLanguage2}
                >
                  <option value="">Select level</option>
                  {LEVELS.map(l => (
                    <option key={l.code} value={l.code}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveLanguages}
                disabled={savingLanguages}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {savingLanguages ? 'Saving...' : 'Save Languages'}
              </button>
              {languagesMessage && (
                <span className="text-green-600 font-medium">{languagesMessage}</span>
              )}
              {languagesError && (
                <span className="text-red-600">{languagesError}</span>
              )}
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Password</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={savePassword}
                disabled={savingPassword || !currentPassword || !newPassword || !confirmPassword}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {savingPassword ? 'Updating...' : 'Save Password'}
              </button>
              {passwordMessage && (
                <span className="text-green-600 font-medium">{passwordMessage}</span>
              )}
              {passwordError && (
                <span className="text-red-600">{passwordError}</span>
              )}
            </div>
          </div>
        </div>

        {/* Bio Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Bio</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 200))}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                rows={4}
                placeholder="Tell us about yourself and your language learning goals..."
              />
              <div className="mt-2 text-sm text-gray-500 text-right">
                {bio.length}/200 characters
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={saveBio}
                disabled={savingBio}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {savingBio ? 'Saving...' : 'Save Bio'}
              </button>
              {bioMessage && (
                <span className="text-green-600 font-medium">{bioMessage}</span>
              )}
              {bioError && (
                <span className="text-red-600">{bioError}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
