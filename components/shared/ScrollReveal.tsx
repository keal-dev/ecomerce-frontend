'use client';

import React, { useEffect, useRef, useState } from 'react';

type RevealVariant = 'fade-up' | 'fade-in' | 'fade-left' | 'fade-right' | 'zoom-in';

interface ScrollRevealProps {
  children: React.ReactNode;
  variant?: RevealVariant;
  delay?: number;
  duration?: number;
  className?: string;
}

function getHiddenTransform(variant: RevealVariant): string {
  switch (variant) {
    case 'fade-in':
      return 'translate3d(0, 0, 0)';
    case 'fade-left':
      return 'translate3d(-24px, 0, 0)';
    case 'fade-right':
      return 'translate3d(24px, 0, 0)';
    case 'zoom-in':
      return 'translate3d(0, 16px, 0) scale(0.97)';
    case 'fade-up':
    default:
      return 'translate3d(0, 26px, 0)';
  }
}

export function ScrollReveal({
  children,
  variant = 'fade-up',
  delay = 0,
  duration = 650,
  className = '',
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window === 'undefined' ||
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
            break;
          }
        }
      },
      {
        threshold: 0.08,
        rootMargin: '0px 0px -36px 0px',
      },
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate3d(0, 0, 0) scale(1)' : getHiddenTransform(variant),
        transitionProperty: 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
