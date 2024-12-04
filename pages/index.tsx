import { useState } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeBanner from '@/components/Home-banner';
import About from '@/components/About';
import Portfolio from '@/components/Politicians';
import ResultDashboard from './resultDashboard';
import { PollStruct } from '@/utils/types';
import { generateFakePolls } from '@/services/data';
import HomeNavbar from '@/components/Home-Navbar';
import PredictionDashboard from './predictionDashboard';
//import { router } from 'next/router';
import CandidatePortfolio from './portfolio';
import { PortfolioItem } from '@/types/PortfolioItem';

export default function Home({ pollsData }: { pollsData: PollStruct[] }) {
  const [currentView, setCurrentView] = useState('home'); // State to toggle views
  //const { search } = router.query;
  

  const portfolioItems = [
    {
      id: '1',
      title: 'Namal Perera',
      description: 'A responsive website built using React and Tailwind CSS.',
      party: "NPP",
      image: '/assets/images/pic1.jpg',
      date: '2024-11-20',
    },
    {
        id: '2',
        title: 'Saman Kumara',
        description: 'A user-friendly mobile app design for e-commerce platforms.',
        party:"SPP",
        image: '/assets/images/pic2.jpg',
        date: '2024-10-15',
      },
      {
        id: '3',
        title: 'Lal Hemasinghe',
        description: 'A chatbot system powered by natural language processing and machine learning.',
        party:"IND-10",
        image: '/assets/images/pic3.jpg',
        date: '2024-09-10',
      },
  ];


  return (
    <>
      <Head>
        <title>Available Polls</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen relative backdrop-blur">
      {/* {search && (
                <p className="mt-3 text-lg">
                    You searched for: <span className="font-semibold text-blue-500">{search}</span>
                </p>
            )} */}
        <div
          className="absolute inset-0 before:absolute before:inset-0
          before:w-full before:h-full before:bg-[url('/assets/images/bg.jpeg')]
          before:blur-sm before:z-[-1] before:bg-no-repeat before:bg-cover"
        />

        <section className="relative px-5 py-10 space-y-16 text-white sm:p-10">
          <HomeNavbar
            onResultDashboardClick={() => setCurrentView('resultDashboard')}
            onPredictionDashboardClick={() => setCurrentView('predictionDashboard')} // Add handler
            onHomeClick={() => setCurrentView('home')}
          />
          {currentView === 'home' && (
            <>
              <HomeBanner />
              <About />
              <Portfolio portfolioItems={portfolioItems}  />
            </>
          )}
          {currentView === 'resultDashboard' && <ResultDashboard />}
          {currentView === 'predictionDashboard' && <PredictionDashboard />}
          {currentView === 'profile' && <CandidatePortfolio />}

          <Footer />
        </section>
      </div>
    </>
  );
}

export const getServerSideProps = async () => {
  const pollsData: PollStruct[] = generateFakePolls(4);
  return {
    props: {
      pollsData: JSON.parse(JSON.stringify(pollsData)),
    },
  };
};
