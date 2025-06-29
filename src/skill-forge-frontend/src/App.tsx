import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import AccountSetup from './components/account/AccountSetup';
import Dashboard from './components/dashboard/Dashboard';
import LearningPathDetail from './components/skills/LearningPathDetail';
import Skills from './components/skills/Skills';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { AuthProvider } from './contexts';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          
          {/* Setup route - for authenticated users who haven't set up their profile */}
          <Route 
            path="/setup" 
            element={
              <PublicRoute>
                <AccountSetup />
              </PublicRoute>
            } 
          />
          
          {/* Protected routes - requires authentication and profile */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/skills" 
            element={
              <ProtectedRoute>
                <Skills />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/skills/:skillTreeId" 
            element={
              <ProtectedRoute>
                <Skills />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/learning-path/:id" 
            element={
              <ProtectedRoute>
                <LearningPathDetail />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;