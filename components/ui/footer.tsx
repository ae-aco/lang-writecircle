export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          {/* Left side - Copyright and version */}
          <div className="mb-4 md:mb-0">
            <p className="text-sm">
              © 2024 WriteCircle. Version 1.0.0
            </p>
            <p className="text-xs mt-1 text-gray-400">
              Built by Amanda
            </p>
          </div>

          {/* Right side - Links */}
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-sm hover:text-teal-400 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-sm hover:text-teal-400 transition-colors"
            >
              FAQ
            </a>
            <a
              href="#"
              className="text-sm hover:text-teal-400 transition-colors"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
