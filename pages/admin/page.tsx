import Header from "./components/Header";
import Sidebar from "./components/Sidebar";


export default function AdminPage() {
    return (
      
      <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin panel!</p>
      </div>
    </main>
    </div>
     </div>
    )
  }
  
  