import { globalActions } from '@/store/globalSlices'
import { useSession } from 'next-auth/react'
import React from 'react'
import { useDispatch } from 'react-redux'
import { motion } from 'framer-motion'
import { FiChevronDown } from 'react-icons/fi'

const HomeBanner = () => {
    const handleLearnMore = () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
    return (
      <div className="relative overflow-hidden min-h-[80vh] flex items-center">
        {/* Background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('/assets/images/flag-pattern.png')] bg-cover opacity-10"></div>
          <div className="absolute w-96 h-96 rounded-full bg-blue-500/20 -top-20 -left-20 blur-3xl"></div>
          <div className="absolute w-96 h-96 rounded-full bg-red-500/10 -bottom-20 -right-20 blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between">
          {/* Left Content */}
          <motion.div 
            className="w-full md:w-7/12 text-white mb-10 md:mb-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-blue-300 mb-4">
              Democratic Republic of Sri Lanka
            </h2>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-none mb-2">
              Presidential Election
            </h1>
            <div className="relative">
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">
                2024
              </h1>
              <div className="absolute -bottom-1 left-1 w-1/4 h-1 bg-gradient-to-r from-red-500 to-blue-500 rounded-full"></div>
            </div>
            
            <p className="mt-6 text-gray-200 text-lg md:text-xl max-w-xl">
              Exercise your democratic right and shape the future of our nation. Every vote counts in building a stronger Sri Lanka.
            </p>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-full transform hover:scale-105 transition-all shadow-lg flex items-center"
                onClick={handleLearnMore}
              >
                Learn More
                <FiChevronDown className="ml-2" />
              </button>
              <button
                className="px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/30 text-white font-medium rounded-full transform hover:scale-105 transition-all shadow-lg"
              >
                Voter Guidelines
              </button>
            </div>
          </motion.div>
          
          {/* Right Content */}
          <motion.div 
            className="w-full md:w-5/12 flex justify-center items-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative">
              {/* Circular background glow */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/30 to-transparent blur-xl"></div>
              
              {/* Main logo with shadow and rotating effect */}
              <motion.div
                animate={{ 
                  rotateY: [0, 10, 0, -10, 0],
                }}
                transition={{
                  duration: 8,
                  ease: "easeInOut",
                  repeat: Infinity,
                }}
                className="relative z-10"
              >
                <img
                  src="/assets/images/gov-logo.png"
                  alt="Sri Lanka Government Logo"
                  className="w-72 h-72 md:w-96 md:h-96 object-contain filter drop-shadow-2xl"
                />
              </motion.div>
              
              {/* Decorative elements */}
              {/* <div className="absolute top-0 left-0 w-full h-full">
                <motion.div 
                  className="w-20 h-20 absolute top-5 left-5 rounded-full border-4 border-blue-500/30"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                ></motion.div>
                <motion.div 
                  className="w-10 h-10 absolute bottom-10 right-20 rounded-full border-2 border-red-500/30"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                ></motion.div>
              </div> */}
            </div>
          </motion.div>
        </div>
        
        {/* Scroll indicator */}
        {/* <motion.div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        ></motion.div>
          <div className="flex flex-col items-center text-white/80">
            <span className="text-sm mb-2">Scroll to explore</span>
            <FiChevronDown className="text-2xl" />
          </div> */}
      
      </div>
    );
  };
  
  export default HomeBanner;
