import Sidebar from "./components/Sidebar";


export default function AdminPage() {
    return (
      
       <div className="flex min-h-screen bg-gray-100">
       <Sidebar />
       <div>
        <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
        <p>Welcome to the admin panel!</p>
      </div>
     </div>
    )
  }
  
  