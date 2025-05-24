import { useState, useEffect } from 'react';
import Head from 'next/head';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomeBanner from '@/components/Home-banner';
import About from '@/components/About';
import Portfolio from '@/components/Politicians';
import ResultDashboard from './resultDashboard';
import { PollStruct } from '@/utils/types';
import { generateFakePolls } from '@/services/data';
import PredictionDashboard from './predictionDashboard';
import CandidatePortfolio from './portfolio';
import { PortfolioItem } from '@/types/PortfolioItem';
import HomeNavbar from '@/components/Home-Navbar';

export default function Home({ pollsData }: { pollsData: PollStruct[] }) {
  const [currentView, setCurrentView] = useState('home');
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<PortfolioItem | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const res = await fetch('/api/Candidates/getCandidates'); // Adjust your route if needed
        const data = await res.json();

        const mappedItems = data.candidates.map((candidate: any) => ({
          id: candidate._id,
          title: candidate.name,
          description: candidate.description,
          party: candidate.party,
          image: candidate.image || '/assets/images/default.jpg', // fallback image
          date: candidate.date || 'TBD', // optional fallback
          name: candidate.name,
          slogan: candidate.slogan,
          no: candidate.no, // Added
          nationalId: candidate.nationalId, // Added
          socialLinks: {
            linkedin: "",
            github: "",
            twitter: "",
            whatsapp: "",
          },
          bio: {
            dob: candidate.bio?.dob,
            nationality: candidate.bio?.nationality,
            religion: candidate.bio?.religion,
            maritalStatus: candidate.bio?.maritalStatus,
            netWorth: candidate.bio?.netWorth,
          },
          education: candidate.education,
          experience: candidate.experience,
          electionId: candidate.electionId,
        }));

        setPortfolioItems(mappedItems);
      } catch (err) {
        console.error('Failed to fetch candidates', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCandidates();
  }, []);

  const handleViewProfile = (id: string) => {
    const selectedItem = portfolioItems.find(item => item.id === id);
    if (selectedItem) {
      setSelectedPortfolioItem(selectedItem);
      setCurrentView('profile');
    }
  };

  return (
    <>
      <Head>
        <title>Available Polls</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="min-h-screen relative backdrop-blur">
        <div
          className="absolute inset-0 before:absolute before:inset-0
          before:w-full before:h-full before:bg-[url('/assets/images/bg.jpeg')]
          before:blur-sm before:z-[-1] before:bg-no-repeat before:bg-cover"
        />

        <section className="relative px-5 py-10 space-y-16 text-white sm:p-10">
          {/* <Navbar /> */}
          <HomeNavbar
            onResultDashboardClick={() => setCurrentView('resultDashboard')}
            onPredictionDashboardClick={() => setCurrentView('predictionDashboard')} // Add handler
            onHomeClick={() => setCurrentView('home')}
          />
          {currentView === 'home' && (
            <>
              <HomeBanner />
              <About />
              {loading ? (
                <p>Loading candidates...</p>
              ) : (
                <Portfolio portfolioItems={portfolioItems} onViewProfile={handleViewProfile} />
              )}
            </>
          )}
          {currentView === 'resultDashboard' && <ResultDashboard />}
          {currentView === 'predictionDashboard' && <PredictionDashboard />}
          {currentView === 'profile' && selectedPortfolioItem && (
            <CandidatePortfolio candidate={selectedPortfolioItem || ""} />
          )}
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
