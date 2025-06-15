// useAxiosAuth.js
import axios from '../lib/axios';
import { useAuth } from './useAuth';
import { useMemo } from 'react';


export function useAxiosAuth() {
  const { status } = useAuth();
  const instance = useMemo(() => {
    return axios;
  }, [status]);
  return instance;
}
