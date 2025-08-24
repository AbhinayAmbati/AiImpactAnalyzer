import { createContext, useContext, useReducer, useEffect } from 'react'

const AnalysisContext = createContext()

const initialState = {
  analyses: [],
  currentAnalysis: null,
  loading: false,
  error: null,
  repositories: [],
  coverageMappings: [],
  stats: {
    totalAnalyses: 0,
    totalTimeSaved: 0,
    averageRiskScore: 0,
    totalTestsSelected: 0
  }
}

const analysisReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false }
    
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    
    case 'SET_ANALYSES':
      return { ...state, analyses: action.payload }
    
    case 'ADD_ANALYSIS':
      return { 
        ...state, 
        analyses: [action.payload, ...state.analyses],
        currentAnalysis: action.payload
      }
    
    case 'SET_CURRENT_ANALYSIS':
      return { ...state, currentAnalysis: action.payload }
    
    case 'SET_REPOSITORIES':
      return { ...state, repositories: action.payload }
    
    case 'SET_COVERAGE_MAPPINGS':
      return { ...state, coverageMappings: action.payload }
    
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } }
    
    default:
      return state
  }
}

export const AnalysisProvider = ({ children }) => {
  const [state, dispatch] = useReducer(analysisReducer, initialState)

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

  const apiCall = async (endpoint, options = {}) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      const errorMessage = error.message || 'An error occurred'
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      throw error
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }

  const analyzeImpact = async (analysisRequest) => {
    try {
      const result = await apiCall('/api/v1/analyze', {
        method: 'POST',
        body: JSON.stringify(analysisRequest)
      })
      
      dispatch({ type: 'ADD_ANALYSIS', payload: result })
      return result
    } catch (error) {
      console.error('Analysis failed:', error)
      throw error
    }
  }

  const getAnalyses = async () => {
    try {
      const result = await apiCall('/api/v1/analyses')
      dispatch({ type: 'SET_ANALYSES', payload: result })
      return result
    } catch (error) {
      console.error('Failed to fetch analyses:', error)
      throw error
    }
  }

  const getRepositories = async () => {
    try {
      const result = await apiCall('/api/v1/repositories')
      dispatch({ type: 'SET_REPOSITORIES', payload: result })
      return result
    } catch (error) {
      console.error('Failed to fetch repositories:', error)
      throw error
    }
  }

  const getCoverageMappings = async () => {
    try {
      const result = await apiCall('/api/v1/coverage-mappings')
      dispatch({ type: 'SET_COVERAGE_MAPPINGS', payload: result })
      return result
    } catch (error) {
      console.error('Failed to fetch coverage mappings:', error)
      throw error
    }
  }

  const createCoverageMapping = async (mappingData) => {
    try {
      const result = await apiCall('/api/v1/coverage-mappings', {
        method: 'POST',
        body: JSON.stringify(mappingData)
      })
      
      // Refresh coverage mappings
      await getCoverageMappings()
      return result
    } catch (error) {
      console.error('Failed to create coverage mapping:', error)
      throw error
    }
  }

  const getHealthStatus = async () => {
    try {
      const result = await apiCall('/api/v1/health')
      return result
    } catch (error) {
      console.error('Health check failed:', error)
      throw error
    }
  }

  const getMetrics = async () => {
    try {
      const result = await apiCall('/api/v1/metrics')
      dispatch({ type: 'UPDATE_STATS', payload: result })
      return result
    } catch (error) {
      console.error('Failed to fetch metrics:', error)
      throw error
    }
  }

  // Load initial data - only when explicitly requested
  useEffect(() => {
    // Don't auto-load data on mount to prevent infinite loops
    // Data will be loaded when components explicitly request it
  }, [])

  const value = {
    ...state,
    analyzeImpact,
    getAnalyses,
    getRepositories,
    getCoverageMappings,
    createCoverageMapping,
    getHealthStatus,
    getMetrics,
    setCurrentAnalysis: (analysis) => dispatch({ type: 'SET_CURRENT_ANALYSIS', payload: analysis }),
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  }

  return (
    <AnalysisContext.Provider value={value}>
      {children}
    </AnalysisContext.Provider>
  )
}

export const useAnalysis = () => {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysis must be used within an AnalysisProvider')
  }
  return context
} 