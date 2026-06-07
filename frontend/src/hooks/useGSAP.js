import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * useReveal — attach GSAP ScrollTrigger reveal to a ref.
 * @param {object} options
 * @param {number} options.delay   - stagger delay in seconds (default 0)
 * @param {string} options.from    - 'bottom' (default) | 'left' | 'right'
 */
export function useReveal({ delay = 0, from = 'bottom' } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const xFrom = from === 'left' ? -40 : from === 'right' ? 40 : 0;
    const yFrom = from === 'bottom' ? 30 : 0;

    gsap.fromTo(
      el,
      { opacity: 0, x: xFrom, y: yFrom },
      {
        opacity: 1,
        x: 0,
        y: 0,
        delay,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, [delay, from]);

  return ref;
}

/**
 * useStaggerReveal — reveal a list of children in sequence.
 * @param {number} stagger - seconds between each child reveal
 */
export function useStaggerReveal(stagger = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    const children = Array.from(container.children);

    gsap.fromTo(
      children,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        stagger,
        duration: 0.65,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      }
    );

    return () => ScrollTrigger.getAll().forEach((t) => t.kill());
  }, [stagger]);

  return ref;
}

/**
 * useGSAPEntrance — entry animation on mount (no scroll trigger).
 */
export function useGSAPEntrance(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.fromTo(
      el,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, delay, duration: 0.7, ease: 'power3.out' }
    );
  }, [delay]);

  return ref;
}
