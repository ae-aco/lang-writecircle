'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, PenLine, Users, Trophy, User, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user || null)
      
      // Fetch notification count if user is logged in
      if (session?.user) {
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('read', false)
        setNotificationCount(count || 0)
      }
      
      setLoading(false)
      setMounted(true)
    }

    checkSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null)
        
        // Fetch notification count if user is logged in
        if (session?.user) {
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('read', false)
          setNotificationCount(count || 0)
        } else {
          setNotificationCount(0)
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => pathname === path

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/write', label: 'Write', icon: PenLine },
    { href: '/queue', label: 'Correct Others', icon: Users },
    { href: '/challenges', label: 'Challenges', icon: Trophy },
  ]
  
  if (!mounted) return (
    <nav className="bg-white border-b border-gray-100 px-6 py-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <span className="font-bold text-indigo-600 text-xl">WriteCircle</span>
      </div>
    </nav>
  )

  return (
    <nav className="bg-white border-b border-[#E2EAFC] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="block">
              <h1 className="text-2xl font-bold text-[#6366f1] hover:text-[#4f46e5] transition-colors">WriteCircle</h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {loading ? (
              <div className="w-20 h-8 bg-gray-200 animate-pulse rounded"></div>
            ) : user ? (
              // Logged in navigation
              <>
                {navLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive(href)
                        ? 'text-[#6366f1] bg-[#EDF2FB]'
                        : 'text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB]'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Link>
                ))}
                
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center justify-center w-8 h-8 text-[#6b7280] hover:text-[#6366f1] p-2 rounded-md transition-colors relative"
                  >
                    <User className="w-5 h-5" />
                    {notificationCount > 0 && (
                      <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    )}
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E2EAFC] py-2 z-50">
                      <div className="px-4 py-2 text-sm text-[#9ca3af] border-b border-[#E2EAFC]">
                        {user.user_metadata?.username || user?.email || 'User'}
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-[#1e1b4b] hover:bg-[#F8FAFF] transition-colors"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/submissions"
                        className="block px-4 py-2 text-sm text-[#1e1b4b] hover:bg-[#F8FAFF] transition-colors"
                      >
                        My Submissions
                      </Link>
                      <Link
                        href="/corrections"
                        className="block px-4 py-2 text-sm text-[#1e1b4b] hover:bg-[#F8FAFF] transition-colors"
                      >
                        My Corrections
                      </Link>
                      <div className="border-t border-[#E2EAFC] my-2"></div>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-[#ef4444] hover:bg-[#fef2f2] transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Logged out navigation
              <>
                <Link
                  href="/auth"
                  className="text-[#6b7280] hover:text-[#6366f1] px-3 py-2 text-sm font-medium transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="bg-[#6366f1] hover:bg-[#4f46e5] text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Join
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#6b7280] hover:text-[#6366f1] hover:bg-[#F8FAFF] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#6366f1] transition-colors"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-[#E2EAFC]">
          {loading ? (
            <div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div>
          ) : user ? (
            // Logged in mobile navigation
            <>
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                    isActive(href)
                      ? 'text-[#6366f1] bg-[#EDF2FB]'
                      : 'text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB]'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {label}
                </Link>
              ))}
              <div className="border-t border-[#E2EAFC] my-2"></div>
              <Link
                href="/profile"
                className="flex items-center px-3 py-2 text-base font-medium text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB] rounded-md transition-colors"
              >
                My Profile
              </Link>
              <Link
                href="/submissions"
                className="flex items-center px-3 py-2 text-base font-medium text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB] rounded-md transition-colors"
              >
                My Submissions
              </Link>
              <Link
                href="/corrections"
                className="flex items-center px-3 py-2 text-base font-medium text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB] rounded-md transition-colors"
              >
                My Corrections
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full text-left flex items-center px-3 py-2 text-base font-medium text-[#ef4444] hover:bg-[#fef2f2] rounded-md transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            // Logged out mobile navigation
            <>
              <Link
                href="/auth"
                className="block px-3 py-2 text-base font-medium text-[#6b7280] hover:text-[#6366f1] hover:bg-[#EDF2FB] rounded-md transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth"
                className="block w-full text-left bg-[#6366f1] hover:bg-[#4f46e5] text-white px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}
