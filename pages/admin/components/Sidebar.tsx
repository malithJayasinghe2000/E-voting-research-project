import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link'
import { useRouter } from 'next/router'

const Sidebar = () => {
  const router = useRouter()
  const { data: session } = useSession();

  return (
    <div className="w-64 bg-gray-800 text-white p-6">
      <h2 className="text-2xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          <li>
          <Link
              href="/admin/page"
              className={`block py-2 px-4 hover:bg-gray-700 rounded ${
                router.pathname === '/admin/page' ? 'bg-gray-700 cursor-not-allowed' : ''
              }`}
              aria-disabled={router.pathname === '/admin/page'}
            >
              Dashboard
            </Link>
          </li>
          <li>
          <Link
              href="/admin/users/page"
              className={`block py-2 px-4 hover:bg-gray-700 rounded ${
                router.pathname === '/admin/users/page' ? 'bg-gray-700 cursor-not-allowed' : ''
              }`}
              aria-disabled={router.pathname === '/admin/users/page'}
            >
              Users
            </Link>
          </li>
          <li>
            <Link href="/admin/elections/page" className="block py-2 px-4 hover:bg-gray-700 rounded">
              Elections
            </Link>
          </li>
          <li>
            {session && (
              <button  onClick={() => signOut({ callbackUrl: '/' })}>
                Logout
              </button>
              )}
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Sidebar

