export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">W</span>
              </div>
              <span className="font-bold text-gray-900">WriteCircle</span>
            </div>
            <p className="text-sm text-gray-500 mb-3">
              Master writing in your target language through community feedback.
            </p>
            <p className="text-xs text-gray-400">© 2026 WriteCircle. All rights reserved.</p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Product</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Features</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Languages</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">About</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-gray-500 hover:text-indigo-600">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
