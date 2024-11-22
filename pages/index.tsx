import Banner from '@/components/Banner'
import CreatePoll from '@/components/CreatePoll'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Polls from '@/components/Polls'
import { PollStruct, RootState } from '@/utils/types'
import Head from 'next/head'
import { generateFakePolls } from '@/services/data'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { useEffect } from 'react'
import Portfolio from '@/components/Politicians'

export default function Home({ pollsData }: { pollsData: PollStruct[] }) {
  const dispatch = useDispatch()
  const {setPolls} = globalActions
  const {polls} = useSelector((states:RootState)=>states.globalStates)
  const portfolioItems = [
    {
      id: '1',
      title: 'Web Development Project',
      description: 'A responsive website built using React and Tailwind CSS.',
      image: '/assets/images/profile.png',
      date: '2024-11-20',
    },
    {
      id: '2',
      title: 'Mobile App Design',
      description: 'A user-friendly mobile app design for e-commerce platforms.',
      image: '/assets/images/profile.png',
      date: '2024-10-15',
    },
    {
      id: '3',
      title: 'AI-Powered Chatbot',
      description: 'A chatbot system powered by natural language processing and machine learning.',
      image: '/assets/images/profile.png',
      date: '2024-09-10',
    },
  ];
  

  useEffect(()=>{
    dispatch(setPolls(pollsData))

  },[dispatch,setPolls,pollsData])

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
          <Navbar />
          <Banner />
          <Polls polls={polls} />
          <Portfolio portfolioItems={portfolioItems} />
          <Footer />
        </section>
        <CreatePoll />
      </div>
    </>
  )
}

export const getServerSideProps = async () => {
  const pollsData: PollStruct[] = generateFakePolls(4)
  return {
    props: {
      pollsData: JSON.parse(JSON.stringify(pollsData)),
    },
  }
}
