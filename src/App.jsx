import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import AddLaptop from './pages/AddLaptop'
import AuthGuard from './components/AuthGuard'

function App() {
  return (
    <Router>
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            fontFamily: 'Inter, sans-serif',
            fontWeight: '600',
            fontSize: '14px',
            borderRadius: '12px',
            background: '#FAFAFA',
            color: '#1A1A1A',
            border: '1px solid rgba(116, 119, 117, 0.3)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          },
          success: { iconTheme: { primary: '#19722b', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ba1a1a', secondary: '#fff' } }
        }} 
      />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected Routes */}
        <Route element={<AuthGuard />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-laptop" element={<AddLaptop />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App
