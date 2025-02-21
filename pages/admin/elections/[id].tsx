import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Contestants from '@/components/Contestants'
import Head from 'next/head'
// import ContestPoll from '@/components/ContestPoll'
import { GetServerSidePropsContext } from 'next'
import { ContestantStruct, PollStruct, RootState } from '@/utils/types'
import UpdatePoll from '@/components/UpdatePoll'
import DeletePoll from '@/components/DeletePoll'
import { generateFakeContestants } from '@/services/data'
import { useDispatch, useSelector } from 'react-redux'
import { globalActions } from '@/store/globalSlices'
import { useEffect } from 'react'
import { getContestants, getPoll } from '@/services/blockchain'
import ElectionDetails from '../components/ElectionDetails'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import AddCandidates from '../components/AddCandidates'
import Candidates from '../components/Candidates'
import UpdateElection from '../components/UpdateElection'
import DeleteElection from '../components/DeleteElection'

export default function Polls({
  pollData,
  contestantsData,
}: {
  pollData: PollStruct
  contestantsData: ContestantStruct[]
}) {
  const dispatch = useDispatch()
  const {setPoll, setContestants} = globalActions
  const {poll,contestants} = useSelector((states:RootState)=>states.globalStates)

  useEffect(()=>{
    dispatch(setPoll(pollData))
    dispatch(setContestants(contestantsData))
  },[dispatch,setPoll,pollData,setContestants,contestantsData])
  return (
    <>
      {poll && (
        <Head>
          <title>Election | {poll.title}</title>
          <link rel="icon" href="/favicon.ico" />
        </Head>
      )}

<div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">

        <section className="relative px-5 py-10 space-y-16 text-black sm:p-10">
          {/* <Navbar /> */}
          {poll && <ElectionDetails poll={poll} />}
          {poll && contestants && <Candidates poll={poll} contestants={contestants} />}
          
        </section>

        {poll && <AddCandidates poll={poll} />}
        {poll && <DeleteElection poll={poll} />}
        {poll && <UpdateElection pollData={poll} />}
      </div>
    </main>
    </div>
    </div>

    </>
  )
}

export const getServerSideProps = async (context: GetServerSidePropsContext) => {
  const { id } = context.query
  const pollData = await getPoll(Number(id))
  const contestantData = await getContestants(Number(id))

  return {
    props: {
      pollData: JSON.parse(JSON.stringify(pollData)),
      contestantsData: JSON.parse(JSON.stringify(contestantData)),
    },
  }
}
