import { motion } from 'framer-motion';
import { ArrowRight, Hammer, Play, Sparkles } from 'lucide-react';
import React from 'react';
import ICPLogo from '../../public/icp-logo.svg';
import { useAuth } from '../contexts/AuthContext';


const CallToAction: React.FC = () => {
  const { login } = useAuth();

  /**
   * Handle Get Started button click
   */
  const handleGetStarted = async (): Promise<void> => {
    try {
      const success = await login();
      if (!success) {
        console.error('Login failed');
        alert('Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please try again.');
    }
  };

  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-purple-900 via-purple-800 to-deep-navy relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }} />

        {/* Animated Particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gold rounded-full"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring" }}
                className="inline-flex items-center space-x-2 bg-gold/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6"
              >
                <Sparkles className="w-4 h-4 text-gold" />
                <span className="text-sm font-semibold text-gold">Ready to Transform?</span>
              </motion.div>

              <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to{' '}
                <span className="relative">
                  <span className="bg-gradient-to-r from-gold via-yellow-400 to-gold bg-clip-text text-transparent">
                    Level Up
                  </span>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="absolute bottom-2 left-0 h-1 bg-gradient-to-r from-gold to-yellow-400 rounded-full"
                  />
                </span>
                ?
              </h2>

              <p className="text-lg text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0">
                Bergabunglah dengan ribuan learners yang telah mentransformasi karir mereka.
                Mulai forge skill impian Anda hari ini.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleGetStarted}
                  className="group bg-gold text-deep-navy px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gold/90 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <img src={ICPLogo} alt="ICP Logo" className="w-8 h-8" />

                  <span>Start Forging</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:border-gold/50 hover:bg-gold/10 transition-all duration-300"
                >
                  <Play className="w-5 h-5" />
                  <span>Watch Demo</span>
                </motion.button>
              </div>

              <div className="flex items-center justify-center lg:justify-start space-x-6 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Instant access</span>
                </div>
              </div>
            </motion.div>

            {/* Right Illustration */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Blacksmith Character Illustration */}
              <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
                {/* Anvil and Hammer Scene */}
                <div className="text-center">
                  <motion.div
                    animate={{
                      rotate: [0, -15, 0],
                      y: [0, -5, 0]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="relative inline-block"
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-gold to-yellow-400 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                      <Hammer className="w-16 h-16 text-deep-navy" />
                    </div>

                    {/* Spark Effects */}
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-yellow-300 rounded-full"
                        style={{
                          left: `${50 + Math.cos(i * 45 * Math.PI / 180) * 60}%`,
                          top: `${50 + Math.sin(i * 45 * Math.PI / 180) * 60}%`,
                        }}
                        animate={{
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </motion.div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    Forge Your Destiny
                  </h3>
                  <p className="text-gray-300 text-sm">
                    Every skill mastered is a step closer to your dream career
                  </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20"
                  >
                    <div className="text-2xl font-bold text-gold">10K+</div>
                    <div className="text-xs text-gray-300">Skills Forged</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center border border-white/20"
                  >
                    <div className="text-2xl font-bold text-gold">98%</div>
                    <div className="text-xs text-gray-300">Success Rate</div>
                  </motion.div>
                </div>
              </div>

              {/* Floating Elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-gradient-to-br from-purple/30 to-purple/20 backdrop-blur-sm rounded-lg p-3 border border-purple/30"
              >
                <div className="text-xs text-purple font-semibold">AI Powered</div>
                <div className="text-sm text-white">Smart Learning</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                className="absolute -bottom-4 -left-4 bg-gradient-to-br from-gold/30 to-gold/20 backdrop-blur-sm rounded-lg p-3 border border-gold/30"
              >
                <div className="text-xs text-gold font-semibold">Blockchain</div>
                <div className="text-sm text-white">Verified Skills</div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;