'use client';
import Image from "next/image";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../hooks/useAuth';
import styles from "./page.module.css";

export default function Home() {
  const { status } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    } else if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  return null;
}
