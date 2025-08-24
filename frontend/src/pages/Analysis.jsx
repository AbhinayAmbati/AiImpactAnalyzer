import { useState } from 'react'
import { 
  Plus, 
  X, 
  FileText, 
  GitBranch, 
  Clock, 
  Shield, 
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Download,
  Share2
} from 'lucide-react'
import { LoadingSpinner } from '../components'

const Analysis = () => {
  const [formData, setFormData] = useState({
    repository: '',
    branch: 'main',
    pullRequestId: '',
    changedFiles: [{ path: '', type: 'source' }]
  })
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const [error, setError] = useState(null)

  const fileTypes = [
    { value: 'source', label: 'Source Code', icon: FileText },
    { value: 'test', label: 'Test File', icon: CheckCircle },
    { value: 'config', label: 'Configuration', icon: GitBranch },
    { value: 'docs', label: 'Documentation', icon: FileText }
  ]

  const addChangedFile = () => {
    setFormData(prev => ({
      ...prev,
      changedFiles: [...prev.changedFiles, { path: '', type: 'source' }]
    }))
  }

  const removeChangedFile = (index) => {
    setFormData(prev => ({
      ...prev,
      changedFiles: prev.changedFiles.filter((_, i) => i !== index)
    }))
  }

  const updateChangedFile = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      changedFiles: prev.changedFiles.map((file, i) => 
        i === index ? { ...file, [field]: value } : file
      )
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsAnalyzing(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Mock analysis result
      const mockResult = {
        selectedTests: [
          { name: 'Button.test.jsx', priority: 'high', reason: 'Direct component test', coverage: 95 },
          { name: 'helpers.test.js', priority: 'medium', reason: 'Utility function test', coverage: 87 },
          { name: 'integration.test.js', priority: 'low', reason: 'Integration test coverage', coverage: 72 }
        ],
        estimatedTimeSaved: 15.5,
        riskScore: 0.25,
        analysisReasoning: 'Based on file changes, these tests provide comprehensive coverage of the modified functionality. The risk score is low due to high test coverage and isolated changes.',
        coverageBreakdown: {
          high: 1,
          medium: 1,
          low: 1
        }
      }
      
      setAnalysisResult(mockResult)
    } catch (err) {
      setError('Analysis failed. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20'
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20'
      default: return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  const getRiskColor = (riskScore) => {
    if (riskScore < 0.3) return 'text-green-600 bg-green-50 dark:bg-green-900/20'
    if (riskScore < 0.7) return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
    return 'text-red-600 bg-red-50 dark:bg-red-900/20'
  }

  const getRiskIcon = (riskScore) => {
    if (riskScore < 0.3) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (riskScore < 0.7) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Impact Analysis
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-black">
            Analyze the impact of code changes and identify relevant tests
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Analysis Form */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">
            Analysis Configuration
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Repository
              </label>
              <input
                type="text"
                value={formData.repository}
                onChange={(e) => setFormData(prev => ({ ...prev, repository: e.target.value }))}
                placeholder="e.g., my-company/frontend-app"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Branch
                </label>
                <input
                  type="text"
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                  placeholder="main"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PR ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.pullRequestId}
                  onChange={(e) => setFormData(prev => ({ ...prev, pullRequestId: e.target.value }))}
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Changed Files
              </label>
              <div className="space-y-3">
                {formData.changedFiles.map((file, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <select
                      value={file.type}
                      onChange={(e) => updateChangedFile(index, 'type', e.target.value)}
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    >
                      {fileTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    
                    <input
                      type="text"
                      value={file.path}
                      onChange={(e) => updateChangedFile(index, 'path', e.target.value)}
                      placeholder="e.g., src/components/Button.jsx"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                      required
                    />
                    
                    {formData.changedFiles.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeChangedFile(index)}
                        className="p-2 text-gray-400 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addChangedFile}
                  className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add File
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze Impact
                </>
              )}
            </button>
          </form>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex">
                <XCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {analysisResult && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Time Saved</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {analysisResult.estimatedTimeSaved}h
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Risk Score</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {(analysisResult.riskScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tests Selected</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {analysisResult.selectedTests.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Selected Tests */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Selected Tests
                  </h3>
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {analysisResult.selectedTests.map((test, index) => (
                    <div key={index} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {test.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {test.reason}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(test.priority)}`}>
                            {test.priority}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {test.coverage}% coverage
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Reasoning */}
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Analysis Reasoning
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {analysisResult.analysisReasoning}
                </p>
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </button>
                <button className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share Results
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analysis 