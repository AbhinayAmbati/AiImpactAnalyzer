import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  GitBranch,
  Star,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  Users,
  Code,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { LoadingSpinner, Badge } from '../components'

const Repositories = () => {
  const [repositories, setRepositories] = useState([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingRepo, setEditingRepo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(8)

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    language: '',
    status: 'active',
    branch: 'main',
    lastSync: new Date().toISOString().split('T')[0]
  })

  // Mock data
  const mockRepositories = [
    {
      id: 1,
      name: 'frontend-app',
      url: 'https://github.com/company/frontend-app',
      description: 'React-based frontend application with modern UI components',
      language: 'JavaScript',
      status: 'active',
      branch: 'main',
      lastSync: '2024-01-15',
      stars: 45,
      forks: 12,
      issues: 3,
      pullRequests: 7,
      coverage: 87,
      lastCommit: '2 hours ago'
    },
    {
      id: 2,
      name: 'backend-api',
      url: 'https://github.com/company/backend-api',
      description: 'FastAPI backend service with PostgreSQL database',
      language: 'Python',
      status: 'active',
      branch: 'main',
      lastSync: '2024-01-14',
      stars: 32,
      forks: 8,
      issues: 5,
      pullRequests: 4,
      coverage: 92,
      lastCommit: '1 day ago'
    },
    {
      id: 3,
      name: 'mobile-app',
      url: 'https://github.com/company/mobile-app',
      description: 'React Native mobile application for iOS and Android',
      language: 'JavaScript',
      status: 'active',
      branch: 'develop',
      lastSync: '2024-01-13',
      stars: 28,
      forks: 6,
      issues: 2,
      pullRequests: 3,
      coverage: 78,
      lastCommit: '3 days ago'
    },
    {
      id: 4,
      name: 'data-pipeline',
      url: 'https://github.com/company/data-pipeline',
      description: 'ETL pipeline for data processing and analytics',
      language: 'Python',
      status: 'inactive',
      branch: 'main',
      lastSync: '2024-01-10',
      stars: 15,
      forks: 3,
      issues: 8,
      pullRequests: 1,
      coverage: 65,
      lastCommit: '1 week ago'
    },
    {
      id: 5,
      name: 'infrastructure',
      url: 'https://github.com/company/infrastructure',
      description: 'Terraform and Docker configurations for deployment',
      language: 'HCL',
      status: 'active',
      branch: 'main',
      lastSync: '2024-01-12',
      stars: 22,
      forks: 5,
      issues: 1,
      pullRequests: 2,
      coverage: 45,
      lastCommit: '5 days ago'
    },
    {
      id: 6,
      name: 'documentation',
      url: 'https://github.com/company/documentation',
      description: 'Project documentation and API references',
      language: 'Markdown',
      status: 'active',
      branch: 'main',
      lastSync: '2024-01-11',
      stars: 18,
      forks: 4,
      issues: 0,
      pullRequests: 1,
      coverage: 0,
      lastCommit: '6 days ago'
    }
  ]

  useEffect(() => {
    // Simulate loading
    setLoading(true)
    setTimeout(() => {
      setRepositories(mockRepositories)
      setLoading(false)
    }, 1000)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (editingRepo) {
      // Update existing repository
      setRepositories(prev => prev.map(repo => 
        repo.id === editingRepo.id 
          ? { ...formData, id: repo.id }
          : repo
      ))
      setEditingRepo(null)
    } else {
      // Add new repository
      const newRepo = {
        ...formData,
        id: Date.now(),
        stars: 0,
        forks: 0,
        issues: 0,
        pullRequests: 0,
        coverage: 0,
        lastCommit: 'Just now'
      }
      setRepositories(prev => [newRepo, ...prev])
    }
    
    resetForm()
    setShowForm(false)
  }

  const handleEdit = (repo) => {
    setEditingRepo(repo)
    setFormData({
      name: repo.name,
      url: repo.url,
      description: repo.description,
      language: repo.language,
      status: repo.status,
      branch: repo.branch,
      lastSync: repo.lastSync
    })
    setShowForm(true)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this repository?')) {
      setRepositories(prev => prev.filter(repo => repo.id !== id))
    }
  }

  const handleSync = (id) => {
    // Simulate sync operation
    setRepositories(prev => prev.map(repo => 
      repo.id === id 
        ? { ...repo, lastSync: new Date().toISOString().split('T')[0], lastCommit: 'Just now' }
        : repo
    ))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      description: '',
      language: '',
      status: 'active',
      branch: 'main',
      lastSync: new Date().toISOString().split('T')[0]
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'inactive': return 'warning'
      case 'archived': return 'danger'
      default: return 'default'
    }
  }

  const getCoverageColor = (coverage) => {
    if (coverage >= 90) return 'success'
    if (coverage >= 70) return 'warning'
    if (coverage > 0) return 'danger'
    return 'default'
  }

  const getLanguageIcon = (language) => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'typescript':
        return '🟡'
      case 'python':
        return '🔵'
      case 'java':
        return '🟠'
      case 'go':
        return '🔵'
      case 'rust':
        return '🟠'
      case 'hcl':
        return '🟣'
      case 'markdown':
        return '⚪'
      default:
        return '📄'
    }
  }

  // Filter and search
  const filteredRepositories = repositories.filter(repo => {
    const matchesSearch = 
      repo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      repo.language.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterStatus === 'all' || repo.status === filterStatus
    
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredRepositories.length / itemsPerPage)
  const paginatedRepositories = filteredRepositories.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-black">
            Repositories
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-black">
            Manage and monitor your connected repositories
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            onClick={() => {
              setShowForm(true)
              setEditingRepo(null)
              resetForm()
            }}
            className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="-ml-0.5 h-5 w-5" />
            Add Repository
          </button>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                {editingRepo ? 'Edit Repository' : 'Add New Repository'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., my-app"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repository URL
                  </label>
                  <input
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://github.com/owner/repo"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Brief description of the repository"
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Language
                    </label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={(e) => setFormData(prev => ({ ...prev, language: e.target.value }))}
                      placeholder="e.g., JavaScript"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Branch
                    </label>
                    <input
                      type="text"
                      value={formData.branch}
                      onChange={(e) => setFormData(prev => ({ ...prev, branch: e.target.value }))}
                      placeholder="main"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      setEditingRepo(null)
                      resetForm()
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {editingRepo ? 'Update' : 'Add'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-1 max-w-lg">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search repositories..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="archived">Archived</option>
          </select>

          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>

          <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </button>
        </div>
      </div>

      {/* Repositories Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedRepositories.map((repo) => (
          <div key={repo.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getLanguageIcon(repo.language)}</div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      {repo.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {repo.language}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusColor(repo.status)}>
                  {repo.status}
                </Badge>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                {repo.description}
              </p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{repo.stars}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <GitBranch className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{repo.forks}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{repo.issues}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Code className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">{repo.pullRequests}</span>
                </div>
              </div>

              {/* Coverage */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Test Coverage</span>
                  <Badge variant={getCoverageColor(repo.coverage)}>
                    {repo.coverage}%
                  </Badge>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${repo.coverage}%` }}
                  ></div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>{repo.lastCommit}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleSync(repo.id)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Sync repository"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(repo)}
                    className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                    title="Edit repository"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(repo.id)}
                    className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete repository"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                {' '}to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, filteredRepositories.length)}
                </span>
                {' '}of{' '}
                <span className="font-medium">{filteredRepositories.length}</span>
                {' '}results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === currentPage
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-600'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Repositories 