/* eslint-disable @next/next/no-img-element */
import { truncate } from '@/utils/helper'; // Utility function for truncating text
import { useRouter } from 'next/router';
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  image: string;
  date: string;
}

const Portfolio: React.FC<{ portfolioItems: PortfolioItem[] }> = ({ portfolioItems }) => {
  return (
    <section className="max-w-[1240px] m-auto py-16">
      <div className="w-[1240px] h-[150px] py-[37px]
      rounded-t-[24px] flex flex-col items-center justify-center
      bg-white bg-opacity-20 px-2">
      <h2 className="text-3xl font-bold text-center mb-8">Candidates</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-24 p-6">
        {portfolioItems.map((item, index) => (
          <PortfolioCard key={index} item={item} />
        ))}
      </div>
    </section>
  );
};

const PortfolioCard: React.FC<{ item: PortfolioItem }> = ({ item }) => {
  const navigate = useRouter();

  return (
    <div className="rounded-xl shadow-xl hover:scale-105 ease-in duration-300 bg-white">
      <Link href={`/portfolio`} target="_self" rel="noopener noreferrer">
      <div className="w-full h-[300px] mx-auto overflow-hidden rounded-t-xl">
  <Image
    src={item.image}
    alt={item.title}
    width={200}
    height={150}
    className="object-cover w-full h-full"
  />
</div>

        <div className="p-4 bg-white rounded-b-xl">
        <h3 style={{ color: "black", fontSize: "1.25rem",textAlign:"center" }}>{item.title}</h3>

          {/* <p className="text-gray-600 mt-2">
            {truncate({ text: item.description, startChars: 100, endChars: 0, maxLength: 120 })}
          </p>
          <p className="text-sm text-gray-500 mt-2 ">{item.date}</p> */}
        </div>
        <div className="mt-3 flex justify-center">
          <div className="p-3"> {/* Added padding */}
            <button
              className="h-[48px] w-[130px] sm:w-[148px] px-3 rounded-full text-sm font-bold
                transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
              onClick={() => navigate.push('/portfolio')} // Adjust if necessary
            >
              View Profile
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default Portfolio;
