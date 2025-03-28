import React from 'react';

const Navbar = () => {
  return (
    <nav>
    <header className="flex items-center justify-between bg-[#800000] w-full py-4 px-8 sticky top-0 z-10 shadow-lg">
      {/* Left Side: Logo and Text */}
      <div className="flex items-center">
        <div>
          <h1 className="text-xl text-white font-bold">Election Commission of Sri Lanka</h1>
          <h2 className="text-lg text-white">ශ්‍රී ලංකා මැතිවරණ කොමිසම</h2>
          <h2 className="text-lg text-white">இலங்கை தேர்தல் ஆணையம்</h2>
        </div>
      </div>
    </header>
    </nav>
  );
};

export default Navbar;
