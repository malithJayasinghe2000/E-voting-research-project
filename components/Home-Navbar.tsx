import { connectWallet } from '@/services/blockchain'
import { truncate } from '@/utils/helper'
import { RootState } from '@/utils/types'
import Link from 'next/link'
import router, { useRouter } from 'next/router'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useSession, signIn, signOut } from 'next-auth/react';
import { FiSearch } from 'react-icons/fi'; 

const HomeNavbar = ({
    onResultDashboardClick,
    onPredictionDashboardClick,
    onHomeClick,
  }: {
    onResultDashboardClick: () => void;
    onPredictionDashboardClick: () => void;
    onHomeClick: () => void;
  }) => {
    const { data: session } = useSession();
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearch = () => {
        if (searchTerm.trim()) {
            alert(`Searching for: ${searchTerm}`);
            router.push(`/?search=${encodeURIComponent(searchTerm)}`);
        }
    };
  
    return (
      <nav className="h-[80px] flex justify-between items-center border border-gray-400 px-5 rounded-full">
        <Link href="/" className="text-[20px] text-blue-800 sm:text-[24px]">
          Dapp<span className="text-white font-bold">Votes</span>
        </Link>
        <div className="flex gap-32">
            <button onClick={onHomeClick}>Home</button>
            <button onClick={onResultDashboardClick}>Result Dashboard</button>
            <button onClick={onPredictionDashboardClick}>Prediction Result Dashboard</button>
        </div>
        <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-[36px] w-[200px] px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
                />
                <FiSearch
                    onClick={handleSearch}
                    className="absolute right-3 text-gray-500 cursor-pointer hover:text-blue-500"
                    size={20}
                />
            </div>
        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="h-[48px] w-[130px] sm:w-[148px] px-3 rounded-full text-sm font-bold transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
          >
            Logout
          </button>
        ) : (
          <button
            onClick={() => signIn()}
            className="h-[48px] w-[130px] sm:w-[148px] px-3 rounded-full text-sm font-bold transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
          >
            Login
          </button>
        )}
      </nav>
    );
  };
  
  export default HomeNavbar;
  
