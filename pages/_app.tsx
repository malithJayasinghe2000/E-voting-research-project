import { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { ToastContainer } from 'react-toastify';
import { appWithTranslation } from "next-i18next";
import { UserConfig } from "next-i18next";
import nextI18NextConfig from "../next-i18next.config.js";

import '@/styles/global.css';
import 'react-toastify/dist/ReactToastify.css';

const emptyInitialI18NextConfig: UserConfig = {
  i18n: {
    defaultLocale: nextI18NextConfig.i18n.defaultLocale,
    locales: nextI18NextConfig.i18n.locales,
  },
};

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Provider store={store}>
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
      </Provider>
    </SessionProvider>
  );
}

export default appWithTranslation(MyApp, emptyInitialI18NextConfig);
