import { globalActions } from '@/store/globalSlices'
import { useSession } from 'next-auth/react'
import React from 'react'
import { useDispatch } from 'react-redux'

const HomeBanner = () => {
    const handleLearnMore = () => {
      const aboutSection = document.getElementById('about');
      if (aboutSection) {
        aboutSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
  
    return (
      <main className="flex items-center mx-auto text-left space-y-8 mb-30">
        {/* Left Content */}
        <div className="flex-3">
          <h1
            className="text-[90px] font-bold text-left leading-none p-4 ml-10"
            style={{ fontFamily: "'Inria Serif', serif" }}
          >
            Presidential Election
          </h1>
          <h1
            className="text-[128px] font-bold text-left leading-none p-4 ml-10"
            style={{ fontFamily: "'jsMath-cmbx10'" }}
          >
            2024
          </h1>
          <button
            className="text-black h-[45px] w-[148px] rounded-full transition-all duration-300
            border border-gray-400 bg-white hover:bg-opacity-20 hover:text-white ml-14 mr-20"
            onClick={handleLearnMore}
          >
            Learn more
          </button>
        </div>
  
        {/* Right Content */}
        <div className="flex-1 flex justify-center items-center">
          <img
            src="/assets/images/gov-logo.png"
            alt="Election Illustration"
            className="w-full max-w-[350px] object-contain"
          />
        </div>
      </main>
    );
  };
  
  export default HomeBanner;
  