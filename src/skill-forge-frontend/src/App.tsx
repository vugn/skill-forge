import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Home from './components/Home';
import AccountSetup from './components/account/AccountSetup';
import Dashboard from './components/dashboard/Dashboard';
import Profile from './components/profile/Profile';
import LearningPathDetail from './components/skills/LearningPathDetail';
import Skills from './components/skills/Skills';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/setup" element={<AccountSetup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/skills/:skillTreeId" element={<Skills />} />
          <Route path="/learning-path/:id" element={<LearningPathDetail />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;