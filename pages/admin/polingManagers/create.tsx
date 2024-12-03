import React from 'react'
import Sidebar from '../components/Sidebar'
import Header from '../components/Header'
import CreatePollingMgr from '../components/CreatePollingMgr'

function create() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            <CreatePollingMgr />

            </div>
            </main>
            </div>
            </div>
  )
}

export default create