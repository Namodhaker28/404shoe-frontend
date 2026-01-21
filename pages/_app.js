import "@/styles/globals.css";
import Head from "next/head";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

import { Provider } from "react-redux";
import store from "@/store/store";
import { UserContextProvider } from "@/context/context";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';



export default function App({ Component, pageProps }) {
  return (
    <>
<UserContextProvider>
      <Head>
        <title>CryptoSole - Buy Shoes with USDT</title>
        <meta name="description" content="CryptoSole - Premium shoe store accepting USDT payments on Binance Smart Chain" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
      </Head>
      <Provider store={store}>
        <ErrorBoundary>
          <ToastContainer />
          <Header />
          <Component {...pageProps} />
          <Footer />
        </ErrorBoundary>
      </Provider>
      </UserContextProvider>
    </>
  );
}
