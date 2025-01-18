import { signOut } from "next-auth/react";


export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold text-gray-800">Admin</h2>
        <div className="flex items-center">
          <input type="search" placeholder="Search..." className="mr-2" />
          <button 
           onClick={() => signOut({ callbackUrl: '/' })}
           className="border border-gray-300 rounded px-4 py-2">
            Logout
            </button>
        </div>
      </div>
    </header>
  )
}

