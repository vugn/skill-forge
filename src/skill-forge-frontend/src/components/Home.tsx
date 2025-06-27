import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth';
import CallToAction from './CallToAction';
import FAQ from './FAQ';
import Footer from './Footer';
import Hero from './Hero';
import KeyFeatures from './KeyFeatures';
import Navbar from './Navbar';
import ProblemSolution from './ProblemSolution';

const Home: React.FC = () => {
  const { isAuthenticated, user, checkingProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      if (isAuthenticated && !checkingProfile) {
        if (user) {
          // User has profile, go to dashboard
          navigate('/dashboard');
        } else {
          // Check if user has profile in storage
          const principal = authService.getPrincipalText();
          if (principal) {
            const hasProfile = await authService.hasUserProfile(principal);
            if (hasProfile) {
              navigate('/dashboard');
            } else {
              navigate('/setup');
            }
          }
        }
      }
    };

    checkUserStatus();
  }, [isAuthenticated, user, checkingProfile, navigate]);

  return (
    <div className="font-display bg-deep-navy overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <ProblemSolution />
        <KeyFeatures />
        <FAQ />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
};

export default Home;