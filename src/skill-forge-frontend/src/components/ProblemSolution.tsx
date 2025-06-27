import { motion } from 'framer-motion';
import { ArrowRight, Brain, MapPin, Shield } from 'lucide-react';
import React from 'react';

const ProblemSolution: React.FC = () => {
  const problems = [
    {
      icon: MapPin,
      problem: 'Jalur belajar tidak jelas',
      solution: 'AI Skill Tree Generator',
      description: 'AI kami menganalisis tujuan karirmu dan membuat skill tree yang terstruktur dan personalized untuk mencapai target.',
      color: 'from-red-500/20 to-orange-500/20',
      borderColor: 'border-red-500/30',
    },
    {
      icon: Shield,
      problem: 'Bingung mulai dari mana',
      solution: 'Personalized Learning Path',
      description: 'Berdasarkan background dan tujuan karirmu, kami akan memberikan urutan pembelajaran yang optimal.',
      color: 'from-blue-500/20 to-purple-500/20',
      borderColor: 'border-blue-500/30',
    },
    {
      icon: Brain,
      problem: 'Tidak ada tracking progress',
      solution: 'Smart Progress Tracking',
      description: 'Monitor perkembangan belajarmu dengan dashboard yang intuitif dan milestone yang jelas.',
      color: 'from-green-500/20 to-emerald-500/20',
      borderColor: 'border-green-500/30',
    },
  ];

  return (
    <section id="overview" className="py-24 lg:py-32 bg-gradient-to-b from-deep-navy to-dark-blue relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-purple/5 rounded-full blur-3xl" />
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
            Kenapa <span className="text-gold">SkillForge</span>?
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Kami memahami tantangan yang dihadapi para pembelajar modern dan memberikan solusi yang tepat.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{
                rotateY: 5,
                rotateX: 5,
                scale: 1.02,
              }}
              className={`bg-gradient-to-br ${item.color} backdrop-blur-sm rounded-2xl p-8 border ${item.borderColor} hover:border-gold/50 transition-all duration-300 group`}
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <item.icon className="w-8 h-8 text-gold" />
                </div>

                <div className="space-y-2">
                  <div className="text-red-400 font-semibold text-sm">❌ Problem</div>
                  <h3 className="text-xl font-bold text-white">{item.problem}</h3>
                </div>
              </div>

              <motion.div
                className="border-t border-white/10 pt-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <ArrowRight className="w-5 h-5 text-gold" />
                  <div className="text-gold font-semibold text-sm">✅ Solution</div>
                </div>
                <h4 className="text-lg font-semibold text-gold mb-3">{item.solution}</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{item.description}</p>
              </motion.div>

              <motion.div
                className="mt-6 pt-6 border-t border-white/10"
                whileHover={{ x: 5 }}
              >
                <button className="text-gold font-semibold text-sm flex items-center space-x-2 group-hover:text-white transition-colors">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="bg-gradient-to-r from-gold to-yellow-400 text-deep-navy px-8 py-4 rounded-lg font-semibold text-lg hover:shadow-lg hover:shadow-gold/25 transition-all duration-300"
          >
            Mulai Perjalanan Anda
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default ProblemSolution;