import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Navbar, Sidebar } from './components'
import { Dashboard, Analysis, Coverage, Repositories, Settings } from './pages'
import { AnalysisProvider, ThemeProvider } from './context'
import './App.css'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate initial loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">AI Impact Analyzer</h2>
          <p className="text-gray-500">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <ThemeProvider>
      <AnalysisProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar onMenuClick={() => setSidebarOpen(true)} />
            <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="lg:pl-64">
              <main className="py-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/coverage" element={<Coverage />} />
                  <Route path="/repositories" element={<Repositories />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </main>
            </div>
          </div>
        </Router>
      </AnalysisProvider>
    </ThemeProvider>
  )
}

export default App
