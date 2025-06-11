import { useRef, useState, useEffect } from 'react';

interface UseHorizontalScrollProps {
  scrollAmount?: number;
}

export const useHorizontalScroll = ({ scrollAmount = 300 }: UseHorizontalScrollProps = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    e.preventDefault();
    const x = e.pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    setStartX(e.touches[0].pageX - containerRef.current.offsetLeft);
    setScrollLeft(containerRef.current.scrollLeft);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current) return;
    const x = e.touches[0].pageX - containerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    containerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    e.preventDefault();
    containerRef.current.scrollLeft += e.deltaY;
  };

  const scroll = (direction: 'left' | 'right') => {
    if (!containerRef.current) return;
    containerRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
  };

  return {
    containerRef,
    isDragging,
    isMobile,
    handleMouseDown,
    handleMouseUp,
    handleMouseMove,
    handleTouchStart,
    handleTouchMove,
    handleWheel,
    scroll
  };
}; 