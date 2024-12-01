import { AppProps } from 'next/app'
import '@/styles/global.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Provider } from 'react-redux'
import { store } from '@/store'
import { useEffect, useState } from 'react'
import { checkWallet } from '@/services/blockchain'
import { SessionProvider } from 'next-auth/react'
import  AuthProvider  from '@/components/AuthProvider'

export default function MyApp({ Component, pageProps }: AppProps) {
  const [showChild, setShowChild] = useState<boolean>(false)
  
  useEffect(() => {
    checkWallet()
    setShowChild(true)
  }, [])
  return (
   
    <Provider store={store}>
          <AuthProvider>
      <Component {...pageProps} />

      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
  </AuthProvider>
      </Provider>  
    
  )
}
