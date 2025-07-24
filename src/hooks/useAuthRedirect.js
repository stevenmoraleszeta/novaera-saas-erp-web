import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const useAuthRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    const hasToken = document.cookie
      .split(';')
      .some(cookie => cookie.trim().startsWith('token='));

    if (!hasToken) {
      router.replace('/');
    }
  }, [router]);
};
