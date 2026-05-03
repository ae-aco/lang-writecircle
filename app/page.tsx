'use client'

import Link from 'next/link'
import { BookOpen, PenLine, MessageSquare, Sparkles, CheckCircle, TrendingUp, Zap, Globe, Heart } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white scroll-smooth">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">WriteCircle</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#community" className="text-gray-600 hover:text-gray-900 transition-colors">Community</a>
              <Link href="/auth">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Get Started
                </button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center space-x-2 bg-indigo-100 text-indigo-700 rounded-full px-3 py-1 text-sm w-fit mb-6">
                <Sparkles className="w-4 h-4" />
                <span>Join our growing community of language learners</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Master Writing
                <br />
                in Your Target
                <br />
                <span className="text-indigo-500">Language</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                WriteCircle connects language learners to practice writing together. Get corrections from native speakers, earn pages by helping others, and improve your language skills through authentic communication.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth">
                  <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors">
                    Start Writing Free →
                  </button>
                </Link>
                <a href="#how-it-works">
                  <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-3 rounded-lg transition-colors">
                    See How it Works
                  </button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full px-3 py-1 text-xs flex items-center space-x-1">
                  <Globe className="w-3 h-3" />
                  <span>50+ Languages</span>
                </div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-600 font-semibold">S</span>
                  </div>
                  <div>
                    <p className="text-gray-800">
                      Hier, je suis allé à Paris. C'était{" "}
                      <span className="bg-yellow-200 underline">magnifique</span>
                    </p>
                  </div>
                </div>
                <div className="text-green-600 text-sm mb-4">✓ 3 corrections received</div>
                <div className="mb-4">
                  <div className="bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="text-xs text-gray-600">Daily Progress: 75%</div>
                </div>
                <div className="bg-teal-50 rounded-lg p-3 mb-4 flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-teal-600" />
                  <span className="text-sm text-teal-800">Marie corrected your post</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="font-bold text-gray-900">12</div>
                    <div className="text-xs text-gray-600">Pages</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">7</div>
                    <div className="text-xs text-gray-600">Day Streak</div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">42</div>
                    <div className="text-xs text-gray-600">Posts</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">500+</div>
                <div className="text-gray-600">Active Learners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">2,000+</div>
                <div className="text-gray-600">Corrections Made</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-indigo-600 mb-2">50+</div>
                <div className="text-gray-600">Languages</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Improve</h2>
            <p className="text-xl text-gray-600">A complete platform designed for language learners who want to master writing</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-indigo-50 rounded-xl p-6">
              <div className="bg-indigo-100 rounded-lg p-3 w-fit mb-4">
                <PenLine className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Practice Writing</h3>
              <p className="text-gray-600">Write regularly in your target language with prompts and topics designed to build fluency.</p>
            </div>
            <div className="bg-teal-50 rounded-xl p-6">
              <div className="bg-teal-100 rounded-lg p-3 w-fit mb-4">
                <MessageSquare className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Get Corrections</h3>
              <p className="text-gray-600">Receive helpful corrections and feedback from native speakers to improve your accuracy.</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-6">
              <div className="bg-amber-100 rounded-lg p-3 w-fit mb-4">
                <Sparkles className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn Pages</h3>
              <p className="text-gray-600">Help others by correcting their work and earn pages to get more feedback on your own.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-indigo-50 rounded-3xl p-12">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How WriteCircle Works</h2>
              <p className="text-xl text-gray-600">Simple, effective, and built for learners</p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-indigo-400 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  01
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Write Your Post</h3>
                <p className="text-gray-600 text-sm">Express yourself in your target language</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-400 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  02
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Get Feedback</h3>
                <p className="text-gray-600 text-sm">Native speakers review and correct your writing</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-400 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  03
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Learn & Improve</h3>
                <p className="text-gray-600 text-sm">Apply corrections and track your progress</p>
              </div>
              <div className="text-center">
                <div className="bg-indigo-400 text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  04
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Help Others</h3>
                <p className="text-gray-600 text-sm">Correct posts in languages you know fluently</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section id="community" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div className="bg-white rounded-xl p-8 shadow-lg">
              <div className="space-y-6">
                <div className="bg-teal-50 rounded-lg p-4 flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-teal-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real Human Feedback</h3>
                    <p className="text-gray-600 text-sm">Get corrections from native speakers who understand context and nuance</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 flex items-start space-x-3">
                  <TrendingUp className="w-6 h-6 text-amber-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Track Your Progress</h3>
                    <p className="text-gray-600 text-sm">See your improvement over time with streaks, stats, and achievements</p>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4 flex items-start space-x-3">
                  <Zap className="w-6 h-6 text-indigo-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Earn as You Learn</h3>
                    <p className="text-gray-600 text-sm">Help others improve and earn pages to unlock more features</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Join a Community of Passionate Language Learners</h2>
              <p className="text-gray-600 mb-6">
                WriteCircle isn't just an app — it's a global community where learners help each other grow. Every correction you give helps someone improve, and every correction you receive brings you closer to fluency.
              </p>
              <Link href="/auth">
                <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-colors w-fit">
                  Join WriteCircle Today →
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Ready to Master Your Target Language?</h2>
            <p className="text-xl mb-8 opacity-90">Start writing today and get personalised feedback from native speakers around the world.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Link href="/auth">
                <button className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                  Get Started Free
                </button>
              </Link>
              <button className="border border-white text-white px-6 py-3 rounded-lg hover:bg-white hover:text-indigo-600 transition-colors">
                Learn More
              </button>
            </div>
            <p className="text-sm opacity-75">No credit card required · Free to start</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                <span className="text-xl font-bold text-gray-900">WriteCircle</span>
              </div>
              <p className="text-gray-600 text-sm mb-4">Master writing in your target language through community feedback.</p>
              <p className="text-gray-500 text-xs">© 2026 WriteCircle. All rights reserved.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Features</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Languages</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">About</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Contact</a>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Legal</h3>
              <div className="space-y-2">
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Privacy Policy</a>
                <a href="#" className="block text-gray-600 hover:text-gray-900 text-sm">Terms of Service</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
