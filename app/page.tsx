import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Master Writing in Your
            <span className="text-indigo-600"> Target Language</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            WriteCircle connects language learners to practice writing together. 
            Get corrections from native speakers, earn pages by helping others, 
            and improve your language skills through authentic communication.
          </p>
          
          {/* Benefits */}
          <div className="grid md:grid-cols-3 gap-8 mb-12 text-left">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Practice Writing
              </h3>
              <p className="text-gray-600">
                Write regularly in your target language with prompts and topics designed to build fluency.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Corrections
              </h3>
              <p className="text-gray-600">
                Receive helpful corrections and feedback from native speakers to improve your accuracy.
              </p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Earn Pages
              </h3>
              <p className="text-gray-600">
                Help others by correcting their writing and earn pages to get more feedback on your own.
              </p>
            </div>
          </div>
          
          {/* CTA Button */}
          <Link href="/auth">
            <button className="bg-indigo-600 hover:bg-indigo-700 text-white text-lg font-semibold px-8 py-4 rounded-lg transition-colors transform hover:scale-105 transition-transform">
              Join Now
            </button>
          </Link>
        </div>
      </main>
    </div>
  )
}
