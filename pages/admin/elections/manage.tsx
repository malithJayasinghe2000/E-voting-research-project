import Banner from '@/components/Banner'
import CreatePoll from '@/components/CreatePoll'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { PollStruct, RootState } from '@/utils/types'
import Head from 'next/head'
import { generateFakePolls } from '@/services/data'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { useEffect } from 'react'
import { getPolls } from '@/services/blockchain'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import Polls from '../components/Polls'

export default function Manage({ pollsData }: { pollsData: PollStruct[] }) {
  const dispatch = useDispatch()
  const {setPolls} = globalActions
  const {polls} = useSelector((states:RootState)=>states.globalStates)

  useEffect(()=>{
    dispatch(setPolls(pollsData))

  },[dispatch,setPolls,pollsData])

  return (
    <>
              <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
        <section className="relative px-5 py-10 space-y-16 text-white sm:p-10">
          
          <Polls polls={polls} />
        
        </section>
        </div>
        </main>
        </div>
   
      </div>
    </>
  )
}

export const getServerSideProps = async () => {
  const pollsData: PollStruct[] =await getPolls()
  return {
    props: {
      pollsData: JSON.parse(JSON.stringify(pollsData)),
    },
  }
}
