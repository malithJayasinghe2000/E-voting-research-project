import { truncate } from '@/utils/helper'
import { RootState } from '@/utils/types'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import { FiUser, FiLogOut, FiLogIn, FiMenu, FiX, FiBarChart2, FiActivity, FiGrid } from 'react-icons/fi'

const Navbar = () => {
  const {wallet} = useSelector((states:RootState)=>states.globalStates)
  const navigate = useRouter()
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isAdminPanelVisible = ['admin', 'gsw', 'plk', 'polling_manager'].includes(session?.user?.role);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "bg-indigo-900/95 backdrop-blur-md shadow-lg py-2" 
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center"
            >
              {/* <img 
                src="/assets/images/gov-logo-small.png" 
                alt="Logo" 
                className="h-10 w-10 mr-3"
              /> */}
              {/* <div>
                <span className="text-xl font-bold text-blue-300">Dapp</span>
                <span className="text-xl font-bold text-white">Votes</span>
              </div> */}
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-4"
              >
                <div className="flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur">
                  <FiUser className="text-white mr-2" />
                  <span className="text-white text-sm">
                    {session.user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-red-500 to-red-600 text-white font-medium flex items-center"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium flex items-center shadow-md"
                  onClick={() => navigate.push('/resultDashboard')}
                >
                  <FiBarChart2 className="mr-2" />
                  Results
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium flex items-center shadow-md"
                  onClick={() => navigate.push('/predictionDashboard')}
                >
                  <FiActivity className="mr-2" />
                  Predictions
                </motion.button>

                {isAdminPanelVisible && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2 rounded-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium flex items-center shadow-md"
                    onClick={() => navigate.push('/admin/page')}
                  >
                    <FiGrid className="mr-2" />
                    Admin Panel
                  </motion.button>
                )}
              </motion.div>
            ) : (
              <motion.div
              initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="flex items-center space-x-4"
                >
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md hover:shadow-lg flex items-center"
                onClick={() => signIn()}
              >
                <FiLogIn className="mr-2" />
                Login
              </motion.button>
              <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium flex items-center shadow-md"
                  onClick={() => navigate.push('/resultDashboard')}
                >
                  <FiBarChart2 className="mr-2" />
                  Results
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-medium flex items-center shadow-md"
                  onClick={() => navigate.push('/predictionDashboard')}
                >
                  <FiActivity className="mr-2" />
                  Predictions
                </motion.button>
              </motion.div>

            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              className="text-white p-2 focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 py-4 space-y-3"
          >
            {session ? (
              <>
                <div className="flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur mb-3">
                  <FiUser className="text-white mr-2" />
                  <span className="text-white text-sm">
                    {session.user?.email?.split('@')[0] || 'User'}
                  </span>
                </div>
                
                <button
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full font-medium flex items-center justify-center mb-2"
                  onClick={() => {
                    navigate.push('/resultDashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <FiBarChart2 className="mr-2" />
                  Results Dashboard
                </button>
                
                <button
                  className="w-full px-4 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-full font-medium flex items-center justify-center mb-2"
                  onClick={() => {
                    navigate.push('/predictionDashboard');
                    setMobileMenuOpen(false);
                  }}
                >
                  <FiActivity className="mr-2" />
                  Predictions Dashboard
                </button>
                
                {isAdminPanelVisible && (
                  <button
                    className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-full font-medium flex items-center justify-center mb-2"
                    onClick={() => {
                      navigate.push('/admin/page');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <FiGrid className="mr-2" />
                    Admin Panel
                  </button>
                )}
                
                <button
                  className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full font-medium flex items-center justify-center"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  <FiLogOut className="mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <button
                className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium flex items-center justify-center"
                onClick={() => signIn()}
              >
                <FiLogIn className="mr-2" />
                Login
              </button>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
