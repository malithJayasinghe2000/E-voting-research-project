import { ReactNode } from 'react'
import Sidebar from './components/Sidebar'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-grow p-6">
        {children}
      </div>
    </div>
  )
}

