import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { TrendingUp, TrendingDown, Gift } from 'lucide-react'
import Navbar from '@/components/ui/navbar'
import Footer from '@/components/ui/footer'

export default async function TransactionsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth')

  const { data: profile } = await supabase
    .from('profiles')
    .select('pages')
    .eq('id', user.id)
    .single()

  const { data: transactions } = await supabase
    .from('page_transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  function getTransactionIcon(type: string) {
    switch (type) {
      case 'correction_given':
        return <TrendingUp className="w-5 h-5 text-green-600" />
      case 'submission_made':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      case 'signup_bonus':
        return <Gift className="w-5 h-5 text-indigo-600" />
      default:
        return null
    }
  }

  function getTransactionLabel(type: string) {
    switch (type) {
      case 'correction_given':
        return 'Correction given'
      case 'submission_made':
        return 'Submission made'
      case 'signup_bonus':
        return 'Welcome bonus'
      default:
        return type
    }
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[#EDF2FB]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/profile"
            className="text-indigo-600 hover:text-indigo-700 font-medium inline-block mb-4"
          >
            ← Back to Profile
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pages History</h1>
          <p className="text-gray-600">Track your pages earned and spent</p>
        </div>

        {/* Balance Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-4xl font-bold text-indigo-600 mb-2">{profile?.pages || 0}</p>
          <p className="text-gray-600">pages available</p>
        </div>

        {/* Transaction List */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-4 flex justify-between items-center"
              >
                {/* Left: Icon + Label */}
                <div className="flex items-center gap-3">
                  {getTransactionIcon(transaction.type)}
                  <span className="font-medium text-gray-900">
                    {getTransactionLabel(transaction.type)}
                  </span>
                </div>

                {/* Center: Date */}
                <div className="text-sm text-gray-500">
                  {formatDate(transaction.created_at)}
                </div>

                {/* Right: Amount */}
                <div
                  className={`font-semibold ${
                    transaction.amount > 0
                      ? 'text-green-600'
                      : 'text-red-500'
                  }`}
                >
                  {transaction.amount > 0 ? '+' : ''}{transaction.amount} page
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
