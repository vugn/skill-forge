import { motion } from 'framer-motion';
import { Hammer, Menu, X } from 'lucide-react';
import React, { useState } from 'react';
import { Link as SmoothLink } from 'react-scroll';

import ICPLogo from '../../public/icp-logo.svg';
import { useAuth } from '../contexts/AuthContext';
import { useActiveSection, useScrollPosition } from '../hooks';
import { NavLink } from '../types';
import { Button } from './ui';


/**
 * Navigation links configuration
 */
const NAV_LINKS: NavLink[] = [
  { to: 'overview', label: 'Overview' },
  { to: 'features', label: 'Features' },
  { to: 'icp-advantage', label: 'ICP Advantage' },
  { to: 'faq', label: 'FAQ' },
];

const SECTIONS = ['hero', 'overview', 'features', 'icp-advantage', 'faq'];

/**
 * Navbar component with responsive design and Internet Identity authentication
 */
const Navbar: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isScrolled } = useScrollPosition();
  const activeSection = useActiveSection(SECTIONS);
  const { login } = useAuth();

  /**
   * Handle Get Started button click
   */
  const handleGetStarted = async (): Promise<void> => {
    try {
      const success = await login();
      if (success) {
        setIsMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  /**
   * Close mobile menu
   */
  const closeMobileMenu = (): void => {
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
          ? 'bg-deep-navy/90 backdrop-blur-md border-b border-white/10'
          : 'bg-transparent'
        }`}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <SmoothLink
          to="hero"
          smooth={true}
          duration={500}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <div className="relative">
            <Hammer className="w-8 h-8 text-gold rotate-45" />
            <div className="absolute inset-0 w-8 h-8 bg-gold/20 rounded-full blur-md animate-pulse" />
          </div>
          <span className="text-xl font-bold text-white">SkillForge</span>
        </SmoothLink>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {NAV_LINKS.map((link) => (
            <SmoothLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="text-gold"
              className={`text-gray-300 hover:text-gold transition-colors cursor-pointer font-medium ${activeSection === link.to ? 'text-gold' : ''
                }`}
            >
              {link.label}
            </SmoothLink>
          ))}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          <Button
            onClick={handleGetStarted}
            className="inline-flex items-center space-x-2"
          >
            <img src={ICPLogo} alt="ICP Logo" className="w-5 h-5" />
            <span>Get Started</span>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Menu */}
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0,
        }}
        className="md:hidden bg-deep-navy/95 backdrop-blur-md border-t border-white/10 overflow-hidden"
      >
        <div className="container mx-auto px-4 py-4 space-y-4">
          {/* Mobile Navigation Links */}
          {NAV_LINKS.map((link) => (
            <SmoothLink
              key={link.to}
              to={link.to}
              smooth={true}
              duration={500}
              spy={true}
              activeClass="text-gold"
              className={`block text-gray-300 hover:text-gold transition-colors cursor-pointer font-medium ${activeSection === link.to ? 'text-gold' : ''
                }`}
              onClick={closeMobileMenu}
            >
              {link.label}
            </SmoothLink>
          ))}

          {/* Mobile Get Started Button */}
          <div className="pt-4 border-t border-white/10">
            <Button
              onClick={handleGetStarted}
              className="flex w-full items-center justify-center space-x-2"
              size="lg"
            >
              <img src={ICPLogo} alt="ICP Logo" className="w-5 h-5" />
              <span>Get Started</span>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.header>
  );
};

export default Navbar;
