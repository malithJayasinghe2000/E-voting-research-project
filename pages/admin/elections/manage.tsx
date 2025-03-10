// I want to fetch elections 

import Sidebar from "../components/Sidebar";
import Header from '../components/Header';
import { useEffect, useState } from "react";

interface Election {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date;
  status: boolean ;
}

export default function ManageElections() {
  const [elections, setElections] = useState([] as Election[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchElections = async () => {
      try {
        const response = await fetch('/api/Elections/getElections');
        if (!response.ok) {
          throw new Error('Failed to fetch elections');
        }
        const data = await response.json();
        setElections(data.elections);
      } catch (error) {
        setError((error as any).message);
      } finally {
        setLoading(false);
      }
    };

    fetchElections();
  }, []);

  
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

    return (
        <div className="flex h-screen bg-gray-200">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200">
                    <div className="container mx-auto px-6 py-8">
                        <h3 className="text-gray-700 text-3xl font-medium">Elections</h3>
                        <div className="mt-4">
                            <div className="flex flex-wrap -mx-6">
                                {elections.map(election => (
                                    <div className="w-full px-6 sm:w-1/2 xl:w-1/3">
                                        <div className="flex items-center px-5 py-6 shadow-sm rounded-md bg-white">
                                            <div className="w-10 h-10 bg-red-500 rounded-full flex justify-center items-center">
                                                <svg fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" className="w-6 h-6">
                                                    <path d="M12 19l7-7 3 3-10 10-7-7 3-3"></path>
                                                </svg>
                                            </div>
                                            <div className="mx-5">
                                                <h4 className="text-2xl font-semibold">{election.title}</h4>
                                                <div className="text-gray-500">{election.description}</div>
                                                <div className="text-gray-500">{new Date(election.startsAt).toLocaleString()} - {new Date(election.endsAt).toLocaleString()}</div>
                                                <div className="text-gray-500">Status: {election.status}</div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}