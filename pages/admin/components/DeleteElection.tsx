import { PollStruct, RootState } from '@/utils/types'
import { BsTrash3Fill } from 'react-icons/bs'
import React from 'react'
import { FaTimes } from 'react-icons/fa'
import { globalActions } from '@/store/globalSlices'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-toastify'
import { deletePoll } from '@/services/blockchain'
import { useRouter } from 'next/router'

const DeleteElection: React.FC<{ poll: PollStruct }> = ({ poll }) => {
  // const deleteModal = 'scale-0'
  const dispatch = useDispatch()
  const {setDeleteModal} = globalActions
  const { deleteModal } = useSelector((states: RootState) => states.globalStates)
  const router = useRouter()

  const handleDelete = async () => {
    await toast.promise(
      new Promise<void>((resolve,reject)=>{
        deletePoll(poll.id)
        .then((tx) => {
          closeModal()
          router.push('/admin/elections/manage')
          console.log(tx)
          resolve(tx)

        })
        .catch((error) => reject(error))
        
      }),
      {
        pending:'Deleting poll...',
        success:'Poll deleted successfully',
        error:'Failed to delete poll'}
    )
  }

  const closeModal = () => {
    dispatch(setDeleteModal('scale-0'))
  }

  return (
    <div
      className={`fixed top-0 left-0 w-screen h-screen flex items-center justify-center
    bg-black bg-opacity-50 transform z-50 transition-transform duration-300 ${deleteModal}`}
    >
      <div className="bg-[#0c0c10] text-[#BBBBBB] shadow-lg shadow-[#000000] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
        <div className="flex flex-col">
          <div className="flex flex-row justify-between items-center">
            <p className="font-semibold">Delete Election</p>
            <button onClick={closeModal} className="border-0 bg-transparent focus:outline-none">
              <FaTimes />
            </button>
          </div>

          <div className="flex flex-col justify-center items-center rounded-xl mt-5 mb-5">
            <div className="flex flex-col justify-center items-center rounded-xl my-5 space-y-2">
              <BsTrash3Fill className="text-red-600" size={50} />
              <h4 className="text-[22.65px]">Delete Election</h4>
              <p className="text-[14px]">Are you sure you want to delete this election?</p>
              <small className="text-xs italic">{poll?.title}</small>
            </div>

            <button
              className="h-[48px] w-full block mt-2 px-3 rounded-full text-sm font-bold
              transition-all duration-300 bg-red-600 hover:bg-red-500"
              onClick={handleDelete}
            >
              Delete Election
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DeleteElection
