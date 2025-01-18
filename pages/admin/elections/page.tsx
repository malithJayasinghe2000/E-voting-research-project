import Banner from '@/components/Banner'
import Sidebar from '../components/Sidebar'
import { useSession } from 'next-auth/react'
import { globalActions } from '@/store/globalSlices'

import { PollParams, RootState } from '@/utils/types'
import { create } from 'domain'
import React, { ChangeEvent, FormEvent, useState } from 'react'
import { FaInfoCircle, FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { createPoll } from '@/services/blockchain'
import Header from '../components/Header'
import { BadgeInfo } from 'lucide-react'

export default function CreateElectionPage() {
    const {createModal} = useSelector((states:RootState)=>states.globalStates)
    const dispatch = useDispatch()
    const {setCreateModal} = globalActions
  
  
    const [poll, setPoll] = useState<PollParams>({
      image: '',
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
    })
  
    const handleSubmit = async (e: FormEvent) => {
      e.preventDefault()
  
      if (!poll.image || !poll.title || !poll.description || !poll.startsAt || !poll.endsAt) return
  
      poll.startsAt = new Date(poll.startsAt).getTime()
      poll.endsAt = new Date(poll.endsAt).getTime()
  
      await toast.promise(
        new Promise<void>((resolve,reject)=>{
          createPoll(poll)
          .then((tx) => {
            closeModal()
            console.log(tx)
            resolve(tx)
  
          })
          .catch((error) => reject(error))
          
        }),
        {
          pending:'Creating poll...',
          success:'Poll created successfully',
          error:'Failed to create poll'}
      )
    }
  
    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target
      setPoll((prevState) => ({
        ...prevState,
        [name]: value,
      }))
    }
  
    const closeModal = () => {
      dispatch(setCreateModal('scale-0'))
      setPoll({
        image: '',
        title: '',
        description: '',
        startsAt: '',
        endsAt: '',
      })
    }

    return (
        <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
      <div className="flex-grow p-6">
      <div className='flex justify-center items-center h-full' >
      
      <div className="bg-[rgb(22,22,37)] text-[#BBBBBB] shadow-lg shadow-[#2a2a2a] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Create a election</p>
            {/* <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button> */}
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col justify-center items-start rounded-xl mt-5 mb-5"
          >
            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Election Title"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="title"
                value={poll.title}
                onChange={handleChange}
                required
              />
            </div>
{/* this is hardcoded */}
            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <select
              className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
              name="type"
              required
              >
              <option value="" disabled>Select Election Type</option>
              <option value="presidential">Presidential</option>
              <option value="parliamentary">Parliamentary</option>
              
              </select>
            </div>

            <div
              className="py-4 w-full border border-[#212D4A] rounded-full
              flex items-center px-4 mb-3 mt-2 space-x-2 relative"
            >
              {/* <label htmlFor="startsAt" className="text-[#929292] text-sm">
                Start
              </label> */}
              
              <input
              className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
              name="startsAt"
              type="datetime-local"
              placeholder="Start Date"
              value={poll.startsAt}
              onChange={handleChange}
              required
              onFocus={(e) => e.target.showPicker()}
              />
              <button
                type="button"
                className="ml-2 text-[#929292] hover:text-white"
                onClick={() => toast.info('Please select a valid start date and time.')}
                >
                <BadgeInfo />
                </button>
            </div>

            <div
              className="py-4 w-full border border-[#212D4A] rounded-full
              flex items-center px-4 mb-3 mt-2 space-x-2 relative"
            >
              {/* <label htmlFor="endsAt" className="text-[#929292] text-sm">
                End
              </label> */}
              <input
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="endsAt"
                type="datetime-local"
                placeholder="End Date"
                value={poll.endsAt}
                onChange={handleChange}
                required
                onFocus={(e) => e.target.showPicker()}
              />
              <button
                type="button"
                className="ml-2 text-[#929292] hover:text-white"
                onClick={() => toast.info('Please select a valid end date and time.')}
                >
                <BadgeInfo />
                </button>
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Banner Image"
                type="url"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="image"
                accept="image/*"
                value={poll.image}
                onChange={handleChange}
                required
                />
                <button
                type="button"
                className="ml-2 text-[#929292] hover:text-white"
                onClick={() => toast.info('Please provide a valid URL for the banner image.')}
                >
                <BadgeInfo />
                </button>
              
            </div>

            <div className="py-4 w-full border border-[#212D4A] rounded-xl flex items-center px-4 h-20 mt-2">
              <textarea
                placeholder="Poll Description"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="description"
                value={poll.description}
                onChange={handleChange}
                required
              />
            </div>

            <button
              className="h-[48px] w-full block mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
            >
              Create Poll
            </button>
          </form>
        </div>
      </div>
    </div>
  
      </div>
    </div>
    </main>
    </div>
    </div>
    )
  }
  
  