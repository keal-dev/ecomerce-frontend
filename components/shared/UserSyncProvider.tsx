'use client';

import { useEffect, useRef } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';
import { syncUser } from '@/services/user.service';
import { useAuthStore } from '@/stores/auth.store';
import { setAuthTokenGetter } from '@/libs/axios';

export const UserSyncProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { getToken } = useAuth();
  const { user, isLoaded, isSignedIn } = useUser();
  const { setCurrentUser, setIsLoading, reset } = useAuthStore();
  const syncedUserId = useRef<string | null>(null);

  useEffect(() => {
    if (isSignedIn) {
      setAuthTokenGetter(() => getToken());
    } else {
      setAuthTokenGetter(null);
    }
    return () => {
      setAuthTokenGetter(null);
    };
  }, [isSignedIn, getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn || !user) {
      syncedUserId.current = null;
      reset();
      return;
    }

    setAuthTokenGetter(() => getToken());

    // Evitar peticiones redundantes si ya fue sincronizado en esta sesión
    if (syncedUserId.current === user.id) return;

    const email =
      user.primaryEmailAddress?.emailAddress ||
      user.emailAddresses[0]?.emailAddress ||
      '';

    if (!user.id || !email) return;

    const performSync = async () => {
      try {
        setIsLoading(true);

        const backendUser = await syncUser({
          clerkId: user.id,
          email,
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          imageUrl: user.imageUrl || '',
        });

        setCurrentUser(backendUser);
        syncedUserId.current = user.id;
      } catch (error) {
        console.error('Error sincronizando usuario con el backend:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSync();
  }, [isLoaded, isSignedIn, user, getToken, setCurrentUser, setIsLoading, reset]);

  return <>{children}</>;
};
