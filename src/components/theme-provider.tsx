"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const [mounted, setMounted] = React.useState(false)

  // useEffect only runs on the client, so now we can safely show the UI
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder or simplified version during SSR
    return (
      <div style={{ visibility: "hidden" }}>
        <NextThemesProvider {...props}>{children}</NextThemesProvider>
      </div>
    )
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}