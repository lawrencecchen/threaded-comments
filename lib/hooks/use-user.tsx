import { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';
import useSWR from 'swr';
import supabase from '../utils/initSupabase';
import { definitions } from '@lib/types/supabase';

interface AuthSessionProps {
  user: User | null;
  session: Session | null;
  profile?: definitions['profiles'] | null;
  loading: boolean;
  refresh: any;
}
const UserContext = createContext<AuthSessionProps>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  refresh: null,
});

interface Props {
  supabaseClient: SupabaseClient;
  [propName: string]: any;
}

export const UserContextProvider = (props: Props): JSX.Element => {
  const { supabaseClient } = props;
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const { data: profile, error, isValidating, mutate } = useSWR<definitions['profiles']>(
    user?.id ? ['user_data', user.id] : null,
    async (_, userId) =>
      supabase
        .from<definitions['profiles']>('profiles')
        .select('*')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as definitions['profiles'];
        }),
    { revalidateOnFocus: false }
  );

  if (error) {
    console.log(error);
  }

  useEffect(() => {
    const session = supabaseClient.auth.session();

    if (session) {
      setSession(session);
      setUser(session?.user ?? null);
    }

    const { data: authListener, error } = supabaseClient.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    if (error) {
      throw error;
    }

    return () => {
      authListener!.unsubscribe();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loading = !session || !user || isValidating;

  const value = {
    session,
    user,
    profile,
    loading,
    refresh: mutate,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = (): AuthSessionProps => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a UserContextProvider.`);
  }
  return context;
};
