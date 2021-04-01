import '@lib/styles/globals.css';
import supabase from '@lib/utils/initSupabase';
import { UserContextProvider } from '@lib/hooks/use-user';
import { ThemeProvider } from 'next-themes';
import type { AppProps } from 'next/app';
import React from 'react';

function MyApp({ Component, pageProps }: AppProps): JSX.Element {
  return (
    <>
      <UserContextProvider supabaseClient={supabase}>
        <ThemeProvider attribute="class">
          <Component {...pageProps} />
        </ThemeProvider>
      </UserContextProvider>
    </>
  );
}

export default MyApp;
