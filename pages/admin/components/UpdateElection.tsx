import { updatePoll } from '@/services/blockchain'
import { globalActions } from '@/store/globalSlices'
import { formatTimestamp } from '@/utils/helper'
import { PollParams, PollStruct, RootState } from '@/utils/types'
import { BadgeInfo } from 'lucide-react'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'

const UpdateElection: React.FC<{ pollData: PollStruct }> = ({ pollData }) => {
  // const updateModal = 'scale-0'
  const dispatch = useDispatch()
  const {setUpdateModal} = globalActions
  const { updateModal } = useSelector((states: RootState) => states.globalStates)


  const [poll, setPoll] = useState<PollParams>({
    image: '',
    title: '',
    description: '',
    startsAt: '',
    endsAt: '',
  })

  useEffect(() => {
    if (pollData) {
      const { image, title, description, startsAt, endsAt } = pollData
      setPoll({
        image,
        title,
        description,
        startsAt: formatTimestamp(startsAt),
        endsAt: formatTimestamp(endsAt),
      })
    }
  }, [pollData])

  const handleUpdate = async (e: FormEvent) => {
    e.preventDefault()

    if (!poll.image || !poll.title || !poll.description || !poll.startsAt || !poll.endsAt) return

    poll.startsAt = new Date(poll.startsAt).getTime()
    poll.endsAt = new Date(poll.endsAt).getTime()

    await toast.promise(
      new Promise<void>((resolve,reject)=>{
        updatePoll(pollData.id,poll)
        .then((tx) => {
          closeModal()
          console.log(tx)
          resolve(tx)

        })
        .catch((error) => reject(error))
        
      }),
      {
        pending:'Updating poll...',
        success:'Poll updated successfully',
        error:'Failed to update poll'}
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
    dispatch(setUpdateModal('scale-0'))
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
    bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${updateModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#000000] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Edit Election</p>
            <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <form
            onSubmit={handleUpdate}
            className="flex flex-col justify-center items-start rounded-xl mt-5 mb-5"
          >
            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2">
              <input
                placeholder="Poll Title"
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="title"
                value={poll.title}
                onChange={handleChange}
                required
              />
            </div>

            <div
              className="py-4 w-full border border-[#212D4A] rounded-full
              flex items-center px-4 mb-3 mt-2 space-x-2 relative"
            >
             
              <input
                className="bg-transparent outline-none w-full placeholder-transparent text-sm"
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
              
              <input
                className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                name="endsAt"
                type="datetime-local"
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
                placeholder="Banner URL"
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
              Update Poll
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UpdateElection
