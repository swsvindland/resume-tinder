import { type AppType } from 'next/app';
import { type Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';

import { api } from '../utils/api';

import '../styles/globals.css';
import { useEffect } from 'react';
import { initializeApp } from 'firebase/app';

const MyApp: AppType<{ session: Session | null }> = ({
    Component,
    pageProps: { session, ...pageProps },
}) => {
    const firebaseConfigQuery = api.file.getFirebaseConfig.useQuery();

    useEffect(() => {
        if (!firebaseConfigQuery.data) return;

        initializeApp(firebaseConfigQuery.data);
    }, [firebaseConfigQuery.data, session]);

    return (
        <SessionProvider session={session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
};

export default api.withTRPC(MyApp);
