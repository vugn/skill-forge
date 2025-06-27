import { motion } from 'framer-motion';
import { Github, Hammer, MessageSquare, Twitter } from 'lucide-react';
import React from 'react';
import ICPLogo from '../../public/icp-logo.svg';

const Footer: React.FC = () => {
  const footerLinks = {
    about: [
      { label: 'Overview', href: '#overview' },
      { label: 'Team', href: '#team' },
      { label: 'Contact', href: '#contact' },
    ],
    legal: [
      { label: 'Privacy Policy', href: '#privacy' },
      { label: 'Terms of Service', href: '#terms' },
      { label: 'Cookie Policy', href: '#cookies' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-blue-400' },
    { icon: MessageSquare, href: '#', label: 'Discord', color: 'hover:text-purple-400' },
    { icon: Github, href: '#', label: 'GitHub', color: 'hover:text-gray-300' },
  ];

  return (
    <footer className="bg-deep-navy border-t border-white/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center space-x-2 mb-6">
              <div className="relative">
                <Hammer className="w-8 h-8 text-gold rotate-45" />
                <div className="absolute inset-0 w-8 h-8 bg-gold/20 rounded-full blur-md animate-glow" />
              </div>
              <span className="text-2xl font-bold text-white">SkillForge</span>
            </div>

            <p className="text-gray-300 text-sm leading-relaxed mb-6">
              Platform pembelajaran AI-powered yang membantu Anda membangun karir impian dengan skill terverifikasi blockchain.
            </p>

            <div className="flex items-center space-x-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 ${social.color} transition-colors duration-300`}
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Links Columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h3 className="text-white font-semibold mb-6">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-gold transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h3 className="text-white font-semibold mb-6">Legal</h3>
            <ul className="space-y-3 mb-8">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-gray-300 hover:text-gold transition-colors duration-300 text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0"
        >
          <div className="text-gray-300 text-sm">
            © 2025 SkillForge. All rights reserved.
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-300">
            <span>Powered by</span>
            <div className="flex items-center space-x-2">
              <img src={ICPLogo} alt="ICP Logo" className="w-5 h-5" />
              <span className="text-white font-semibold">Internet Computer</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;