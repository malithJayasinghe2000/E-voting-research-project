import Banner from '@/components/Banner';
import Sidebar from '../components/Sidebar';
import { useSession } from 'next-auth/react';
import { globalActions } from '@/store/globalSlices';
import { PollParams, RootState } from '@/utils/types';
import React, { ChangeEvent, FormEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import { BadgeInfo, Calendar, FileText, Award, Clock } from 'lucide-react';
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
        type: '',
    });
    
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!poll.title || !poll.description || !poll.startsAt || !poll.endsAt || !poll.type) {
            return toast.error('All fields are required.');
        }

        poll.startsAt = new Date(poll.startsAt).toISOString();
        poll.endsAt = new Date(poll.endsAt).toISOString();
        
        setLoading(true);

        try {
            await toast.promise(
                axios.post('/api/Elections/addElection', poll),
                {
                    pending: 'Creating election...',
                    success: 'Election created successfully!',
                    error: 'Failed to create election.',
                }
            );
            
            // Reset form
            setPoll({
                title: '',
                description: '',
                startsAt: '',
                endsAt: '',
                type: '',
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setPoll((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                
                <main className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h1 className="text-xl font-bold text-gray-800">Create New Election</h1>
                                <p className="text-sm text-gray-600 mt-1">Set up details for a new election in the system</p>
                            </div>
                            
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-6">
                                    <div>
                                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Award className="w-4 h-4 mr-2 text-blue-500" />
                                            Election Title<span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                id="title"
                                                name="title"
                                                type="text"
                                                value={poll.title}
                                                onChange={handleChange}
                                                placeholder="Enter election title"
                                                required
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <Award className="w-4 h-4 mr-2 text-blue-500" />
                                            Election Type<span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <select
                                                id="type"
                                                name="type"
                                                value={poll.type}
                                                onChange={handleChange}
                                                required
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                            >
                                                <option value="">Select Election Type</option>
                                                <option value="presidential">Presidential</option>
                                                <option value="parliamentary">Parliamentary</option>
                                                <option value="local">Local Government</option>
                                                <option value="other">Other</option>
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label htmlFor="startsAt" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                                                Start Date & Time<span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    id="startsAt"
                                                    name="startsAt"
                                                    type="datetime-local"
                                                    value={poll.startsAt}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <BadgeInfo 
                                                        className="h-5 w-5 text-gray-400 cursor-help"
                                                        onClick={() => toast.info('This is when the election will become available for voting')} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div>
                                            <label htmlFor="endsAt" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                                <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                                End Date & Time<span className="text-red-500 ml-1">*</span>
                                            </label>
                                            <div className="mt-1 relative">
                                                <input
                                                    id="endsAt"
                                                    name="endsAt"
                                                    type="datetime-local"
                                                    value={poll.endsAt}
                                                    onChange={handleChange}
                                                    required
                                                    className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                                    <BadgeInfo 
                                                        className="h-5 w-5 text-gray-400 cursor-help"
                                                        onClick={() => toast.info('Voting will be closed after this time')} 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                            <FileText className="w-4 h-4 mr-2 text-blue-500" />
                                            Election Description<span className="text-red-500 ml-1">*</span>
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="description"
                                                name="description"
                                                rows={4}
                                                value={poll.description}
                                                onChange={handleChange}
                                                placeholder="Provide details about this election"
                                                required
                                                className="block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Provide a clear description of the election, including its purpose and any important information for voters.
                                        </p>
                                    </div>
                                    
                                    <div className="flex justify-end pt-4 border-t border-gray-200">
                                        <button
                                            type="button"
                                            className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={loading}
                                            className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                        >
                                            {loading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Creating...
                                                </span>
                                            ) : "Create Election"}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                        
                       
                    </div>
                </main>
            </div>
        </div>
    );
}
