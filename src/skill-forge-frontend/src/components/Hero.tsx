'use client';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Code2, Link, Play, Rocket, Sparkles, Star, Target, Trophy, Zap } from 'lucide-react';
import React from 'react';
import ICPLogo from '../../public/icp-logo.svg';


const Hero: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };


  return (
    <section id="hero" className="min-h-screen bg-gradient-to-br from-deep-navy via-dark-blue to-deep-navy relative overflow-hidden">
      {/* Background Floating Blobs */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-6rem)]">
          {/* Left Content */}
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="text-center lg:text-left">
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-gold" />
              <span className="text-sm text-gray-300">AI-Powered Learning Platform</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-4xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight">
              Forge{' '}
              <span className="relative">
                <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">Your Future Skills</span>
                <motion.div
                  animate={{ width: ['0%', '100%'] }}
                  transition={{ duration: 2, delay: 1 }}
                  className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-gold to-yellow-400 rounded-full"
                />
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg lg:text-xl text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
              Bangun jalur karir impianmu dengan AI yang memahami tujuanmu. Dapatkan skill terverifikasi blockchain dan wujudkan masa depan yang lebih cerah.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group bg-gold text-deep-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold/90 transition-all duration-300 flex items-center space-x-2"
              >
                <img src={ICPLogo} alt="ICP Logo" className="w-8 h-8" />

                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="group border-2 border-white/20 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:border-gold/50 hover:bg-gold/10 transition-all duration-300 flex items-center space-x-2"
              >
                <Play className="w-5 h-5" />
                <span>Watch Demo</span>
              </motion.button>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-center justify-center lg:justify-start space-x-8 mt-12">
              {[
                { label: 'Skills Mastered', value: '10K+' },
                { label: 'Learning Paths', value: '500+' },
                { label: 'Success Rate', value: '98%' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-bold text-gold">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
          {/* Right Visual Box - Enhanced Responsive */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative flex justify-center items-center mt-12 lg:mt-0"
          >
            {/* Main Container - Responsive Sizing */}
            <div className="relative w-full max-w-[300px] h-[400px] sm:max-w-[380px] sm:h-[480px] md:max-w-[420px] md:h-[520px] lg:max-w-[480px] lg:h-[560px] xl:max-w-[520px] xl:h-[580px] bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-white/20 rounded-3xl shadow-2xl overflow-visible mx-auto">
              {/* Enhanced Background Gradients */}
              <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-purple/5 to-cyan/10 rounded-3xl" />
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent rounded-3xl" />

              {/* Responsive Animated Background Particles */}
              <div className="absolute inset-0">
                {[...Array(15)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-gold/40 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.2, 0.8, 0.2],
                      scale: [0.5, 1, 0.5],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>

              {/* Central Hero Avatar/Logo - Responsive Size */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gradient-to-br from-gold to-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                >
                  <Code2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-deep-navy" />
                </motion.div>

                {/* Orbiting Elements - Responsive */}
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24"
                >
                  <div className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-cyan-400 rounded-full shadow-lg animate-pulse" />
                  <div className="absolute top-1/2 -right-6 sm:-right-8 transform -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-purple rounded-full shadow-lg animate-pulse" />
                  <div className="absolute -bottom-6 sm:-bottom-8 left-1/2 transform -translate-x-1/2 w-3 h-3 sm:w-4 sm:h-4 bg-green-400 rounded-full shadow-lg animate-pulse" />
                  <div className="absolute top-1/2 -left-6 sm:-left-8 transform -translate-y-1/2 w-2 h-2 sm:w-3 sm:h-3 bg-gold rounded-full shadow-lg animate-pulse" />
                </motion.div>
              </div>

              {/* Enhanced Skill Cards with Responsive Positioning */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.6 }}
                className="absolute top-4 sm:top-6 md:top-8 left-2 sm:left-4 md:left-8 bg-gradient-to-br from-cyan-500/20 to-blue-500/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-cyan-400/30 shadow-xl min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-cyan-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-cyan-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.36-.034-.47 0-.92.014-1.36.034.44-.572.895-1.096 1.36-1.564zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.36.034.47 0 .92-.014 1.36-.034-.44.572-.895 1.095-1.36 1.56-.465-.467-.92-.992-1.36-1.56z" />
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-cyan-400 font-semibold">Framework</div>
                    <div className="text-xs sm:text-sm text-white font-medium">React</div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-cyan-400 rounded-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
                className="absolute top-4 sm:top-6 md:top-8 right-2 sm:right-4 md:right-8 bg-gradient-to-br from-purple/20 to-purple/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-purple/30 shadow-xl min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-purple/20 rounded-lg flex items-center justify-center">
                    <Brain className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-purple" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-purple font-semibold">Advanced</div>
                    <div className="text-xs sm:text-sm text-white font-medium">AI/ML</div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-purple rounded-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.6, duration: 0.6 }}
                className="absolute bottom-4 sm:bottom-6 md:bottom-8 left-2 sm:left-4 md:left-8 bg-gradient-to-br from-green-500/20 to-green-400/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-green-400/30 shadow-xl min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-green-400/20 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2,17h20l-10,5L2,17z M11.2,8.2l-0.9-0.9c-0.7-0.7-0.7-1.8,0-2.5l0.9-0.9c0.7-0.7,1.8-0.7,2.5,0l0.9,0.9 c0.7,0.7,0.7,1.8,0,2.5l-0.9,0.9C12.8,8.9,11.9,8.9,11.2,8.2z M4.8,12.4l8.4-8.4c0.7-0.7,1.8-0.7,2.5,0l8.4,8.4 c0.7,0.7,0.7,1.8,0,2.5l-8.4,8.4c-0.7,0.7-1.8,0.7-2.5,0l-8.4-8.4C4.1,14.2,4.1,13.1,4.8,12.4z" />
                    </svg>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-green-400 font-semibold">Frontend</div>
                    <div className="text-xs sm:text-sm text-white font-medium">Vue.js</div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.9, duration: 0.6 }}
                className="absolute bottom-4 sm:bottom-6 md:bottom-8 right-2 sm:right-4 md:right-8 bg-gradient-to-br from-gold/20 to-yellow-400/10 backdrop-blur-lg rounded-xl sm:rounded-2xl p-2 sm:p-3 md:p-4 border border-gold/30 shadow-xl min-w-[80px] sm:min-w-[100px] md:min-w-[120px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2 md:space-x-3">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-gold/20 rounded-lg flex items-center justify-center">
                    <Link className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-gold" />
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-xs text-gold font-semibold">Web3</div>
                    <div className="text-xs sm:text-sm text-white font-medium">Blockchain</div>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-gold rounded-full"
                />
              </motion.div>

              {/* Responsive Floating Achievement Badges */}
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-12 sm:top-14 md:top-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-gold/25 to-yellow-400/20 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-gold/30 shadow-xl z-10 min-w-[100px] sm:min-w-[120px] md:min-w-[140px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Trophy className="w-3 h-3 sm:w-4 sm:h-4 text-gold" />
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-gold font-semibold">Achievement</div>
                    <div className="text-xs sm:text-sm text-white">Full Stack Pro</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-12 sm:bottom-14 md:bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-br from-purple/25 to-purple/15 backdrop-blur-md rounded-lg sm:rounded-xl p-2 sm:p-3 border border-purple/30 shadow-xl z-10 min-w-[100px] sm:min-w-[120px] md:min-w-[140px]"
              >
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple" />
                  <div className="text-center sm:text-left">
                    <div className="text-xs text-purple font-semibold">Level</div>
                    <div className="text-xs sm:text-sm text-white">Expert Coder</div>
                  </div>
                </div>
              </motion.div>

              {/* Responsive Progress Ring */}
              <div className="absolute top-1/2 right-2 sm:right-4 transform -translate-y-1/2">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="4"
                    />
                    <motion.circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 0.75 }}
                      transition={{ duration: 2, delay: 2 }}
                      strokeDasharray="175.929"
                    />
                    <defs>
                      <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#FFD44D" />
                        <stop offset="100%" stopColor="#7F61FF" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-white">75%</span>
                  </div>
                </div>
              </div>

              {/* Responsive Skill Level Indicator */}
              <div className="absolute top-1/2 left-2 sm:left-4 transform -translate-y-1/2">
                <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-lg p-2 sm:p-3 border border-white/20">
                  <div className="text-xs text-gray-400 mb-1">Skill Level</div>
                  <div className="flex items-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.div
                        key={star}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 2.5 + star * 0.1 }}
                      >
                        <Star
                          className={`w-2 h-2 sm:w-3 sm:h-3 ${star <= 4 ? 'text-gold fill-gold' : 'text-gray-600'
                            }`}
                        />
                      </motion.div>
                    ))}
                  </div>
                  <div className="text-xs text-white mt-1">4.0/5.0</div>
                </div>
              </div>

              {/* Animated Border */}
              <div className="absolute inset-0 rounded-3xl border-2 border-transparent bg-gradient-to-r from-gold/50 via-purple/50 to-cyan/50 opacity-20 animate-pulse" />
            </div>

            {/* External Floating Elements - Hidden on Mobile for Better Performance */}
            <motion.div
              animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 bg-gradient-to-br from-cyan/20 to-blue-500/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-cyan/30 shadow-xl hidden md:block"
            >
              <div className="flex items-center space-x-2">
                <Rocket className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <div>
                  <div className="text-xs text-cyan-400 font-semibold">Status</div>
                  <div className="text-sm text-white">Learning</div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0], rotate: [0, -5, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -right-6 bg-gradient-to-br from-green-500/20 to-emerald-400/10 backdrop-blur-sm rounded-2xl p-3 sm:p-4 border border-green-400/30 shadow-xl hidden md:block"
            >
              <div className="flex items-center space-x-2">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <div>
                  <div className="text-xs text-green-400 font-semibold">Goal</div>
                  <div className="text-sm text-white">Master</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;