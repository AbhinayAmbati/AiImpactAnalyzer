import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Clock, 
  Shield, 
  Zap, 
  Plus, 
  ArrowRight,
  GitBranch,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { formatDistanceToNow } from 'date-fns'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts'

const Dashboard = () => {
  const { 
    analyses, 
    stats, 
    loading, 
    getAnalyses, 
    getMetrics 
  } = useAnalysis()
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(false)

  // Use mock data instead of trying to fetch from non-existent API
  const mockAnalyses = [
    {
      id: 1,
      repository: 'frontend-app',
      changedFiles: ['src/components/Button.jsx', 'src/utils/helpers.js'],
      selectedTests: ['Button.test.jsx', 'helpers.test.js'],
      timeSaved: 15.5,
      riskScore: 0.2,
      status: 'completed',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
      id: 2,
      repository: 'backend-api',
      changedFiles: ['app/models/user.py', 'app/services/auth.py'],
      selectedTests: ['test_user.py', 'test_auth.py'],
      timeSaved: 22.3,
      riskScore: 0.4,
      status: 'completed',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000) // 5 hours ago
    },
    {
      id: 3,
      repository: 'mobile-app',
      changedFiles: ['screens/Home.js', 'components/Card.js'],
      selectedTests: ['Home.test.js', 'Card.test.js'],
      timeSaved: 18.7,
      riskScore: 0.6,
      status: 'completed',
      createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000) // 8 hours ago
    }
  ]

  const mockStats = {
    totalAnalyses: 156,
    totalTimeSaved: 2347.8,
    averageRisk: 0.35,
    successRate: 94.2
  }

  // Don't call API functions on mount
  useEffect(() => {
    // Mock data is already available, no need to fetch
  }, [])

  const timeRanges = [
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: '90d', label: '90 Days' }
  ]

  const chartData = [
    { name: 'Mon', analyses: 4, timeSaved: 12.5 },
    { name: 'Tue', analyses: 6, timeSaved: 18.2 },
    { name: 'Wed', analyses: 3, timeSaved: 9.8 },
    { name: 'Thu', analyses: 8, timeSaved: 24.1 },
    { name: 'Fri', analyses: 5, timeSaved: 15.3 },
    { name: 'Sat', analyses: 2, timeSaved: 6.7 },
    { name: 'Sun', analyses: 1, timeSaved: 3.2 }
  ]

  const riskDistribution = [
    { name: 'Low Risk', value: 45, color: '#10B981' },
    { name: 'Medium Risk', value: 35, color: '#F59E0B' },
    { name: 'High Risk', value: 20, color: '#EF4444' }
  ]

  // Use mock data instead of API data
  const recentAnalyses = mockAnalyses
  const displayStats = mockStats

  const getStatusIcon = (riskScore) => {
    if (riskScore < 0.3) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (riskScore < 0.7) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (riskScore) => {
    if (riskScore < 0.3) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (riskScore < 0.7) return 'text-yellow-600 bg-yellow-50 dark:bg-green-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-black">
            Overview of your AI Impact Analyzer performance and recent analyses
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/analysis"
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="-ml-0.5 h-5 w-5" />
            New Analysis
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Analyses
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {displayStats.totalAnalyses}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Time Saved
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {displayStats.totalTimeSaved.toFixed(1)}h
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Avg Risk Score
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {(displayStats.averageRisk * 100).toFixed(0)}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Success Rate
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {displayStats.successRate}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Analysis Trends */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Analysis Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="analyses" stroke="#6366F1" strokeWidth={2} />
              <Line type="monotone" dataKey="timeSaved" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Risk Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={riskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {riskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Recent Analyses
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentAnalyses.map((analysis) => (
            <div key={analysis.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(analysis.riskScore)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {analysis.repository}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {analysis.changedFiles.length} files changed
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {analysis.timeSaved}h saved
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(analysis.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                  <Link
                    to={`/analysis/${analysis.id}`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            to="/analysis"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all analyses
            <ArrowRight className="inline ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 