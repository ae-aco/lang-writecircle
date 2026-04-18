'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold text-teal-600 hover:text-teal-700 transition-colors">WriteCircle</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              // Logged in navigation
              <>
                <a
                  href="/write"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Write
                </a>
                <a
                  href="/queue"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Queue
                </a>
                <a
                  href="/correct"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Corrections
                </a>
                <a
                  href="/profile"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  {user.user_metadata?.username || 'Profile'}
                </a>
                <button
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign Out
                </button>
              </>
            ) : (
              // Logged out navigation
              <>
                <a
                  href="/"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  Home
                </a>
                <a
                  href="#"
                  className="text-gray-700 hover:text-teal-600 px-3 py-2 text-sm font-medium transition-colors"
                >
                  About
                </a>
                <a
                  href="/auth"
                  className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Join
                </a>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-teal-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500 transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger icon */}
              <svg
                className={`${isMenuOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              {/* Close icon */}
              <svg
                className={`${isMenuOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
          {loading ? (
            <div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            // Logged in mobile navigation
            <>
              <a
                href="/write"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Write
              </a>
              <a
                href="/queue"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Queue
              </a>
              <a
                href="/correct"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Corrections
              </a>
              <a
                href="/profile"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {user.user_metadata?.username || 'Profile'}
              </a>
              <button
                onClick={handleSignOut}
                className="w-full text-left text-gray-700 hover:text-red-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            // Logged out mobile navigation
            <>
              <a
                href="/"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Home
              </a>
              <a
                href="#"
                className="text-gray-700 hover:text-teal-600 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                About
              </a>
              <a
                href="/auth"
                className="w-full text-left bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Join
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
