import { useEffect, RefObject } from 'react'
import { useInView } from 'react-intersection-observer'

interface UseChatScrollProps {
  containerRef: RefObject<HTMLDivElement>
  isLoading: boolean
}

export const useChatScroll = ({
  containerRef,
  isLoading,
}: UseChatScrollProps) => {
  const { ref: bottomRef, inView } = useInView({
    trackVisibility: true,
    delay: 100,
  })

  useEffect(() => {
    if (!containerRef.current) return

    // Scroll to bottom when loading starts or when new content arrives
    if (isLoading && !inView) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [isLoading, inView, containerRef])

  return { bottomRef }
}
