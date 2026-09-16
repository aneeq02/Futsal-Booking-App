'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

// Next.js's App Router calls history.pushState/replaceState the moment a
// client-side navigation starts (Link click, router.push, a useTransition-
// wrapped push — all of them), well before any new content is ready to
// paint. Patching these two calls is the only way to get a truly universal
// "navigation started" signal without threading a callback through every
// component that can trigger one.
let patched = false;
let startRef: (() => void) | null = null;

function patchHistory() {
  if (patched || typeof window === 'undefined') return;
  patched = true;

  const originalPush = window.history.pushState.bind(window.history);
  const originalReplace = window.history.replaceState.bind(window.history);

  window.history.pushState = function (...args: Parameters<History['pushState']>) {
    startRef?.();
    return originalPush(...args);
  };
  window.history.replaceState = function (...args: Parameters<History['replaceState']>) {
    startRef?.();
    return originalReplace(...args);
  };
}

export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [visible, setVisible] = useState(false);
  const [width, setWidth] = useState(0);
  const hideTimeout = useRef<ReturnType<typeof setTimeout>>();
  const safetyTimeout = useRef<ReturnType<typeof setTimeout>>();
  const keyRef = useRef(`${pathname}?${searchParams.toString()}`);

  useEffect(() => {
    startRef = () => {
      clearTimeout(hideTimeout.current);
      clearTimeout(safetyTimeout.current);
      setVisible(true);
      setWidth(15);
      // Double rAF so the browser paints the 15% width before we animate to
      // 72% — otherwise both writes land in the same frame and there's no
      // visible transition, just an instant jump.
      requestAnimationFrame(() => requestAnimationFrame(() => setWidth(72)));
      // If a navigation never actually changes the URL (e.g. a no-op click),
      // don't leave the bar stuck on screen forever.
      safetyTimeout.current = setTimeout(() => {
        setVisible(false);
        setWidth(0);
      }, 4000);
    };
    patchHistory();
    return () => {
      startRef = null;
    };
  }, []);

  useEffect(() => {
    const key = `${pathname}?${searchParams.toString()}`;
    if (keyRef.current === key) return;
    keyRef.current = key;

    clearTimeout(safetyTimeout.current);
    setWidth(100);
    hideTimeout.current = setTimeout(() => {
      setVisible(false);
      setWidth(0);
    }, 200);
  }, [pathname, searchParams]);

  return (
    <div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-[3px] w-full">
      <div
        className="h-full bg-primary transition-[width,opacity] duration-300 ease-out"
        style={{ width: `${width}%`, opacity: visible ? 1 : 0 }}
      />
    </div>
  );
}
