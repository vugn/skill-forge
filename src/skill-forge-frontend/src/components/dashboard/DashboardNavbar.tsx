import { motion } from 'framer-motion';
import {
    BookOpen,
    Hammer,
    Home,
    LogOut,
    Menu,
    X
} from 'lucide-react';
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks';

const DashboardNavbar: React.FC = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    const navLinks = [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/skills', label: 'Skills', icon: BookOpen },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <motion.header
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-deep-navy/90 backdrop-blur-md border-b border-white/10"
        >
            <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center space-x-2">
                    <div className="relative">
                        <Hammer className="w-8 h-8 text-gold rotate-45" />
                        <div className="absolute inset-0 w-8 h-8 bg-gold/20 rounded-full blur-md animate-glow" />
                    </div>
                    <span className="text-xl font-bold text-white">SkillForge</span>
                </Link>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center space-x-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${isActive(link.to)
                                ? 'bg-gold/20 text-gold'
                                : 'text-gray-300 hover:text-gold hover:bg-white/10'
                                }`}
                        >
                            <link.icon className="w-4 h-4" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    ))}
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center space-x-4">

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden text-white"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
                <div className="container mx-auto px-4 py-4 space-y-2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.to}
                            to={link.to}
                            className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${isActive(link.to)
                                ? 'bg-gold/20 text-gold'
                                : 'text-gray-300 hover:text-gold hover:bg-white/10'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <link.icon className="w-5 h-5" />
                            <span className="font-medium">{link.label}</span>
                        </Link>
                    ))}

                    <div className="border-t border-white/10 pt-4 mt-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:text-red-400 transition-colors w-full"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.header>
    );
};

export default DashboardNavbar;