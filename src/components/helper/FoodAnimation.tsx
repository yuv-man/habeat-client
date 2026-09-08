import { useEffect, useRef, useState } from "react";

/**
 * The Habeat loading animation — the food bowl from `src/assets/Food animation.json`.
 *
 * Both the player and the animation data are imported dynamically, for three
 * reasons: the loader is mounted eagerly by `App.tsx` as its Suspense
 * fallback, so anything it imports statically lands in the entry chunk; the
 * JSON is 38KB of embedded base64 art; and lottie-web does not need to exist
 * at all on a machine that has asked for reduced motion.
 *
 * The light player is enough here — the animation has no expressions, masks or
 * track mattes, only image layers with transforms.
 */

interface FoodAnimationProps {
  /** Rendered box, in pixels. The artboard is square (500×500). */
  size?: number;
  className?: string;
}

export function FoodAnimation({ size = 140, className }: FoodAnimationProps) {
  const container = useRef<HTMLDivElement | null>(null);
  /** Drives the fade-in, so the box doesn't flash empty then pop. */
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // A loader that jitters is worse than a loader that sits still, and a
    // looping animation is exactly what this setting is about.
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let animation: { destroy: () => void; goToAndStop: (v: number, f?: boolean) => void } | null =
      null;
    /** Guards the async gap: the loader is often unmounted the moment the
     *  thing it was waiting for arrives, which can easily be before the
     *  dynamic imports resolve. */
    let cancelled = false;

    Promise.all([
      import("lottie-web/build/player/lottie_light"),
      import("@/assets/Food animation.json"),
    ])
      .then(([lottie, data]) => {
        if (cancelled || !container.current) return;

        animation = lottie.default.loadAnimation({
          container: container.current,
          renderer: "svg",
          loop: !prefersReducedMotion,
          autoplay: !prefersReducedMotion,
          animationData: (data as { default: unknown }).default ?? data,
        });

        // Reduced motion still gets the artwork, just held on one frame.
        if (prefersReducedMotion) animation.goToAndStop(0, true);

        setReady(true);
      })
      .catch(() => {
        // The animation is decoration on top of a message that already says
        // what's happening. If it can't load, the loader is still a loader.
      });

    return () => {
      cancelled = true;
      animation?.destroy();
    };
  }, []);

  return (
    <div
      ref={container}
      aria-hidden="true"
      className={className}
      style={{
        width: size,
        height: size,
        opacity: ready ? 1 : 0,
        transition: "opacity 240ms ease",
      }}
    />
  );
}

export default FoodAnimation;
