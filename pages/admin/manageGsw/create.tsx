import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import GswForm from '../components/GswForm'


export default function createGsw() {
    return (
      <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
        <GswForm />
      </div>
    </main>
    </div>
    </div>
    )
  }
  
  