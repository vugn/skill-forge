import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import React, { useState } from 'react';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How do I start using SkillForge?',
      answer: 'Begin by signing up and inputting your desired career goal, such as "Frontend Developer" or "Data Scientist". Our AI will analyze your goal and generate a comprehensive skill tree in seconds.'
    },
    {
      question: 'How accurate is the AI in creating skill trees?',
      answer: 'Our AI is trained using current industry data and proven successful learning paths. The generated skill trees follow industry standards and can be customized based on your background and learning pace preferences.'
    },
    {
      question: 'Can I generate multiple skill trees for different careers?',
      answer: 'Absolutely! You can generate as many skill trees as you want to explore various career paths. Compare different skill trees to find the path that best suits your interests and abilities.'
    },
    {
      question: 'How do I track my learning progress?',
      answer: 'Each skill tree comes with an intuitive progress tracker. You can mark completed skills, view remaining time estimates, and monitor overall progress toward your career goal.'
    },
    {
      question: 'Can I customize or edit the generated skill tree?',
      answer: 'Currently, the AI-generated skill trees are already optimized based on industry best practices. However, we are developing customization features that will allow you to modify and personalize skill trees according to your needs.'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-24 lg:py-32 bg-gradient-to-br from-dark-blue to-deep-navy relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
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
            Frequently Asked <span className="text-gold">Questions</span>
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Find answers to frequently asked questions about SkillForge.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="mb-4"
            >
              <motion.div
                whileHover={{ scale: 1.01 }}
                className={`bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl border transition-all duration-300 overflow-hidden ${openIndex === index
                    ? 'border-gold/50 shadow-lg shadow-gold/10'
                    : 'border-white/20 hover:border-gold/30'
                  }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-6 text-left flex items-center justify-between group"
                >
                  <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors pr-4">
                    {faq.question}
                  </h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    {openIndex === index ? (
                      <Minus className="w-6 h-6 text-gold" />
                    ) : (
                      <Plus className="w-6 h-6 text-gold" />
                    )}
                  </motion.div>
                </button>

                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-0 border-t border-white/10">
                        <motion.p
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.1 }}
                          className="text-gray-300 leading-relaxed"
                        >
                          {faq.answer}
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-purple/20 to-gold/20 backdrop-blur-sm rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-300 mb-6">
              Check out our watch demo to see SkillForge in action.
            </p>
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="bg-gold text-deep-navy px-6 py-3 rounded-lg font-semibold hover:bg-gold/90 transition-colors flex items-center space-x-2"
              >
                <span>Watch Demo</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FAQ;