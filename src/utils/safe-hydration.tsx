"use client";

import { useEffect, useState } from 'react';

/**
 * Safely formats a date for client-side rendering to prevent hydration errors
 * @param date The date to format
 * @param format The format function to apply
 * @returns Formatted date string or empty string during SSR
 */
export function useSafeDate() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const formatDate = (date: Date, options?: Intl.DateTimeFormatOptions) => {
    if (!isClient) return '';
    return date.toLocaleTimeString([], options || { hour: '2-digit', minute: '2-digit' });
  };
  
  return { isClient, formatDate };
}
