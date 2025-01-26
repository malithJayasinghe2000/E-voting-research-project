import Banner from '@/components/Banner';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { globalActions } from '@/store/globalSlices';
import { PollParams, RootState } from '@/utils/types';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import { BadgeInfo } from 'lucide-react';
import axios from 'axios';

export default function CreateElectionPage() {
    const { createModal } = useSelector((states: RootState) => states.globalStates);
    const dispatch = useDispatch();
    const { setCreateModal } = globalActions;

    const [poll, setPoll] = useState({
        title: '',
        description: '',
        startsAt: '',
        endsAt: '',
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if ( !poll.title || !poll.description || !poll.startsAt || !poll.endsAt) {
            return toast.error('All fields are required.');
        }

        poll.startsAt = new Date(poll.startsAt).toISOString();
        poll.endsAt = new Date(poll.endsAt).toISOString();

        try {
            await toast.promise(
                axios.post('/api/Elections/addElection', poll),
                {
                    pending: 'Saving election...',
                    success: 'Election saved successfully!',
                    error: 'Failed to save election.',
                }
            );
            closeModal();
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setPoll((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const closeModal = () => {
        dispatch(setCreateModal('scale-0'));
        setPoll({
            title: '',
            description: '',
            startsAt: '',
            endsAt: '',
        });
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        <div className="flex-grow p-6">
                            <div className="flex justify-center items-center h-full">
                                <div className="bg-[rgb(22,22,37)] text-[#BBBBBB] shadow-lg shadow-[#2a2a2a] rounded-xl w-11/12 md:w-2/5 h-7/12 p-6">
                                    <div className="flex flex-col">
                                        <div className="flex flex-row justify-between items-center">
                                            <p className="font-semibold">Create an Election</p>
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

                                            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 space-x-2 relative">
                                                <input
                                                    className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                                                    name="startsAt"
                                                    type="datetime-local"
                                                    placeholder="Start Date"
                                                    value={poll.startsAt}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="ml-2 text-[#929292] hover:text-white"
                                                    onClick={() => toast.info('Please select a valid start date and time.')}
                                                >
                                                    <BadgeInfo />
                                                </button>
                                            </div>

                                            <div className="py-4 w-full border border-[#212D4A] rounded-full flex items-center px-4 mb-3 mt-2 space-x-2 relative">
                                                <input
                                                    className="bg-transparent outline-none w-full placeholder-[#929292] text-sm"
                                                    name="endsAt"
                                                    type="datetime-local"
                                                    placeholder="End Date"
                                                    value={poll.endsAt}
                                                    onChange={handleChange}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    className="ml-2 text-[#929292] hover:text-white"
                                                    onClick={() => toast.info('Please select a valid end date and time.')}
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
                                                className="h-[48px] w-full block mt-2 px-3 rounded-full text-sm font-bold transition-all duration-300 bg-[#1B5CFE] hover:bg-blue-500"
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
    );
}
