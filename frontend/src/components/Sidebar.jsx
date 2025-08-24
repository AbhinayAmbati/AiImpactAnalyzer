import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { Link, useLocation } from 'react-router-dom'
import { 
  X, 
  Home, 
  BarChart3, 
  Database, 
  GitBranch, 
  Settings, 
  Sun, 
  Moon,
  TrendingUp,
  Clock,
  Shield,
  Zap
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAnalysis } from '../context/AnalysisContext'

const navigation = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Analysis', href: '/analysis', icon: BarChart3 },
  { name: 'Coverage', href: '/coverage', icon: Database },
  { name: 'Repositories', href: '/repositories', icon: GitBranch },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const Sidebar = ({ open, onClose }) => {
  const { isDark, toggleTheme } = useTheme()
  const { stats } = useAnalysis()
  const location = useLocation()

  // Mock stats for the sidebar
  const mockStats = {
    totalAnalyses: 156,
    timeSaved: 2347.8,
    averageRisk: 0.35
  }

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AI</span>
                      </div>
                      <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                        Impact Analyzer
                      </span>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                to={item.href}
                                onClick={onClose}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                  ${location.pathname === item.href
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                    : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                                  }
                                `}
                              >
                                <item.icon className="h-6 w-6 shrink-0" />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      
                      {/* Stats Section */}
                      <li className="mt-auto">
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                            Quick Stats
                          </h3>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <TrendingUp className="h-4 w-4 text-indigo-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Analyses</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mockStats.totalAnalyses}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-green-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Time Saved</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {mockStats.timeSaved}h
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Shield className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm text-gray-600 dark:text-gray-400">Avg Risk</span>
                              </div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {(mockStats.averageRisk * 100).toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </li>

                      {/* Theme Toggle */}
                      <li>
                        <button
                          onClick={toggleTheme}
                          className="flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                        >
                          {isDark ? (
                            <>
                              <Sun className="h-6 w-6 shrink-0" />
                              Light Mode
                            </>
                          ) : (
                            <>
                              <Moon className="h-6 w-6 shrink-0" />
                              Dark Mode
                            </>
                          )}
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white dark:bg-gray-900 px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AI</span>
              </div>
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                Impact Analyzer
              </span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${location.pathname === item.href
                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                            : 'text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                          }
                        `}
                      >
                        <item.icon className="h-6 w-6 shrink-0" />
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
              
              {/* Stats Section */}
              <li className="mt-auto">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    Quick Stats
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-indigo-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Analyses</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mockStats.totalAnalyses}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Time Saved</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {mockStats.timeSaved}h
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Avg Risk</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {(mockStats.averageRisk * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </li>

              {/* Theme Toggle */}
              <li>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full"
                >
                  {isDark ? (
                    <>
                      <Sun className="h-6 w-6 shrink-0" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="h-6 w-6 shrink-0" />
                      Dark Mode
                    </>
                  )}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </>
  )
}

export default Sidebar 