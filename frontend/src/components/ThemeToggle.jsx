import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useAuth()

  return (
    <button
      onClick={toggleTheme}
      className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-dark-bg ${theme === 'dark' ? 'bg-primary-600' : 'bg-gray-200'}`}
      aria-label="Toggle theme"
    >
      <span className="sr-only">Toggle theme</span>
      <span
        className={`inline-flex h-7 w-7 transform items-center justify-center rounded-full bg-white shadow-lg transition-transform duration-300 ${theme === 'dark' ? 'translate-x-8' : 'translate-x-0.5'}`}
      >
        {theme === 'dark' ? (
          <Moon size={14} className="text-primary-600" />
        ) : (
          <Sun size={14} className="text-amber-500" />
        )}
      </span>
    </button>
  )
}