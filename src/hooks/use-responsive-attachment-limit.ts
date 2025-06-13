import { useSidebar } from '@/components/ui/sidebar'
import { useEffect, useMemo, useState } from 'react'

export function useResponsiveAttachmentLimit() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024
  })
  const { state: sidebarState } = useSidebar()

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return useMemo(() => {
    const isSidebarOpen = sidebarState === 'expanded'
    const width = windowSize.width

    // Default: 1
    if (width < 640) return 1

    // SM: 2
    if (width < 768) return 2

    // MD: 3 (if sidebar is closed otherwise 2)
    if (width < 1024) return isSidebarOpen ? 2 : 3

    // LG: 4 (if sidebar is closed otherwise 3)
    return isSidebarOpen ? 3 : 4
  }, [windowSize.width, sidebarState])
}
