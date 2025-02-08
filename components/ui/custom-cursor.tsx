"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCursor } from "./cursor-context";

gsap.registerPlugin(ScrollTrigger);

export const CustomCursor = () => {
  const { cursorType, isMounted } = useCursor();
  const cursor = useRef<HTMLDivElement>(null);
  const follower = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);

  // Check if it's a touch device
  const isTouchDevice = () => {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            ((navigator as any).msMaxTouchPoints > 0));
  };

  // Initialize cursor state
  useEffect(() => {
    if (!isMounted || isTouchDevice()) return;

    const initTimeout = setTimeout(() => {
      if (cursor.current && follower.current) {
        gsap.set([cursor.current, follower.current], {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          opacity: 1,
          scale: 1,
          immediateRender: true
        });
        setIsReady(true);
      }
    }, 50);

    return () => clearTimeout(initTimeout);
  }, [isMounted]);

  // Handle cursor movement and visibility
  useEffect(() => {
    if (!isMounted || !isReady || isTouchDevice()) return;

    const moveCircle = (e: MouseEvent) => {
      requestAnimationFrame(() => {
        if (cursor.current && follower.current) {
          gsap.to(cursor.current, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.1,
            ease: "power3.out",
            overwrite: true
          });

          gsap.to(follower.current, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.5,
            ease: "power3.out",
            overwrite: true
          });
        }
      });
    };

    const handleMouseEnter = () => {
      if (cursor.current && follower.current) {
        gsap.to([cursor.current, follower.current], {
          opacity: 1,
          duration: 0.3,
          overwrite: true
        });
      }
    };

    const handleMouseLeave = () => {
      if (cursor.current && follower.current) {
        gsap.to([cursor.current, follower.current], {
          opacity: 0,
          duration: 0.3,
          overwrite: true
        });
      }
    };

    document.addEventListener("mousemove", moveCircle, { passive: true });
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseleave", handleMouseLeave);

    // Initial fade in with slight delay
    setTimeout(handleMouseEnter, 300);

    return () => {
      document.removeEventListener("mousemove", moveCircle);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isMounted, isReady]);

  // Handle cursor type changes
  useEffect(() => {
    if (!isMounted || !isReady || !cursor.current || !follower.current || isTouchDevice()) return;

    switch (cursorType) {
      case "button":
        gsap.to([cursor.current, follower.current], {
          scale: 1.5,
          duration: 0.3,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
          borderColor: "rgba(255, 255, 255, 0.8)",
          overwrite: "auto"
        });
        break;
      case "text":
        gsap.to([cursor.current, follower.current], {
          scale: 0.8,
          duration: 0.3,
          backgroundColor: "transparent",
          borderColor: "rgba(255, 255, 255, 1)",
          overwrite: "auto"
        });
        break;
      default:
        gsap.to([cursor.current, follower.current], {
          scale: 1,
          duration: 0.3,
          backgroundColor: "rgba(255, 255, 255, 1)",
          borderColor: "rgba(255, 255, 255, 1)",
          overwrite: "auto"
        });
    }
  }, [cursorType, isMounted, isReady]);

  // Don't render on touch devices or when not mounted
  if (!isMounted || isTouchDevice()) return null;

  return (
    <>
      <div
        ref={cursor}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white opacity-0 mix-blend-difference will-change-transform"
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)'
        }}
      />
      <div
        ref={follower}
        className="pointer-events-none fixed left-0 top-0 z-[9999] h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white opacity-0 mix-blend-difference will-change-transform"
        style={{ 
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translate3d(0, 0, 0)'
        }}
      />
    </>
  );
};
