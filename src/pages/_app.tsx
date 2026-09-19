import type { AppProps } from 'next/app';
import Layout from '@/components/Layout';
import { AuthProvider } from '@/components/AuthProvider';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
