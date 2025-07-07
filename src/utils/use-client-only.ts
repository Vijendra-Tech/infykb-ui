"use client";

import { useState, useEffect } from 'react';

/**
 * Custom hook to determine if code is running on the client
 * Use this to prevent hydration errors from dynamic content
 */
export function useClientOnly() {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
}
