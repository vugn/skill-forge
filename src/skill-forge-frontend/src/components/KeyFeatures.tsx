import { motion, useScroll } from 'framer-motion';
import { Award, Brain, Calendar, MessageSquare, Target } from 'lucide-react';
import React, { useRef } from 'react';

const KeyFeatures: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: containerRef });

  const features = [
    {
      icon: Brain,
      title: 'AI Skill Card Generator',
      description: 'Input your career goal and get a personalized, comprehensive skill tree with clear learning paths.',
      gradient: 'from-purple-500 to-purple-700',
      bgGradient: 'from-purple-500/20 to-purple-700/20',
    },
    {
      icon: Target,
      title: 'Smart Skill Prioritization',
      description: 'AI analyzes industry trends and your background to prioritize the most important skills first.',
      gradient: 'from-blue-500 to-blue-700',
      bgGradient: 'from-blue-500/20 to-blue-700/20',
    },
    {
      icon: Calendar,
      title: 'Realistic Time Estimation',
      description: 'Get accurate time estimates for each skill based on difficulty, your pace, and current expertise.',
      gradient: 'from-green-500 to-green-700',
      bgGradient: 'from-green-500/20 to-green-700/20',
    },
    {
      icon: MessageSquare,
      title: 'Interactive Progress Tracking',
      description: 'Track your learning progress with detailed analytics and milestone achievements.',
      gradient: 'from-orange-500 to-orange-700',
      bgGradient: 'from-orange-500/20 to-orange-700/20',
    },
    {
      icon: Award,
      title: 'Multiple Career Paths',
      description: 'Generate multiple skill trees for different career goals and compare learning paths.',
      gradient: 'from-gold to-yellow-500',
      bgGradient: 'from-gold/20 to-yellow-500/20',
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-gradient-to-br from-dark-blue to-deep-navy relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/6 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/6 w-64 h-64 bg-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
            Key <span className="text-gold">AI Features</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Leading AI technology to create personalized and effective learning experiences.
          </p>
        </motion.div>

        {/* Desktop Horizontal Scroll */}
        <div className="hidden lg:block">
          <div
            ref={containerRef}
            className="flex overflow-x-auto space-x-8 pb-8 scrollbar-none"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  rotateY: 10,
                  rotateX: 5,
                  scale: 1.05,
                }}
                className={`flex-none w-80 bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:border-gold/50 transition-all duration-300 group scroll-snap-align-center`}
                style={{ scrollSnapAlign: 'center' }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-xl font-bold text-white mb-4 group-hover:text-gold transition-colors">
                  {feature.title}
                </h3>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {feature.description}
                </p>

                <div className="text-gold font-semibold text-sm flex items-center space-x-2">
                  <span>Feature Available</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    ✓
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Scroll Indicator */}
          <div className="flex justify-center mt-8">
            <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-gold to-purple rounded-full"
                style={{ scaleX: scrollXProgress, transformOrigin: 'left' }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="lg:hidden grid gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-gradient-to-br ${feature.bgGradient} backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-gold/50 transition-all duration-300`}
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              <h3 className="text-lg font-bold text-white mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-300 text-sm leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default KeyFeatures;