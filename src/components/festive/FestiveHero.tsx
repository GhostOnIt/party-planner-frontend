import { useMemo, useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';
import { Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type FestiveShape = 'circle' | 'star';

// --- Confetti: floating sparkles (no parallax, just oscillation) ---------

export function Confetti() {
  const pieces = useMemo(
    () => [
      { left: '8%', top: '12%', delay: 0, size: 14, opacity: 0.6 },
      { left: '18%', top: '38%', delay: 0.4, size: 10, opacity: 0.5 },
      { left: '28%', top: '70%', delay: 0.8, size: 16, opacity: 0.7 },
      { left: '42%', top: '20%', delay: 1.2, size: 12, opacity: 0.5 },
      { left: '58%', top: '55%', delay: 0.2, size: 18, opacity: 0.6 },
      { left: '72%', top: '14%', delay: 0.6, size: 14, opacity: 0.5 },
      { left: '82%', top: '42%', delay: 1.0, size: 12, opacity: 0.7 },
      { left: '92%', top: '72%', delay: 0.5, size: 16, opacity: 0.5 },
      { left: '12%', top: '85%', delay: 1.5, size: 10, opacity: 0.6 },
      { left: '64%', top: '82%', delay: 1.8, size: 14, opacity: 0.5 },
    ],
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {pieces.map((p, i) => (
        <motion.span
          key={i}
          className="absolute text-primary"
          style={{ left: p.left, top: p.top, opacity: p.opacity }}
          initial={{ opacity: 0, y: -10, rotate: 0 }}
          animate={{
            opacity: [0, p.opacity, p.opacity, p.opacity * 0.6, p.opacity],
            y: [0, -12, 0, -8, 0],
            rotate: [0, 15, -10, 20, 0],
          }}
          transition={{
            duration: 6 + (i % 3),
            delay: p.delay,
            repeat: Infinity,
            repeatType: 'loop',
            ease: 'easeInOut',
          }}
        >
          <Sparkles style={{ width: p.size, height: p.size }} />
        </motion.span>
      ))}
    </div>
  );
}

// --- Parallax background: 3 layers (blobs, dots, streamers) --------------

interface ParallaxLayerProps {
  y: MotionValue<string>;
  children: ReactNode;
}

function ParallaxLayer({ y, children }: ParallaxLayerProps) {
  return (
    <motion.div style={{ y }} className="absolute inset-0 pointer-events-none">
      {children}
    </motion.div>
  );
}

export function HeroParallaxBackground({
  scrollYProgress,
  shape = 'circle',
}: {
  scrollYProgress: MotionValue<number>;
  shape?: FestiveShape;
}) {
  const yFar = useTransform(scrollYProgress, [0, 1], ['0%', '60%']);
  const yMid = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const yNear = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);

  // Far layer: big soft shapes (blobs as circles, large faded stars otherwise)
  const farShapes = [
    { left: '6%', top: '8%', size: shape === 'star' ? 90 : 220, rotate: -12 },
    { left: '78%', top: '4%', size: shape === 'star' ? 110 : 280, rotate: 8 },
    { left: '40%', top: '28%', size: shape === 'star' ? 130 : 320, rotate: -5 },
    { left: '88%', top: '32%', size: shape === 'star' ? 80 : 180, rotate: 18 },
    { left: '12%', top: '46%', size: shape === 'star' ? 100 : 240, rotate: -20 },
    { left: '54%', top: '64%', size: shape === 'star' ? 95 : 0, rotate: 10 }, // star-only
    { left: '24%', top: '80%', size: shape === 'star' ? 85 : 0, rotate: -8 }, // star-only
    { left: '82%', top: '78%', size: shape === 'star' ? 105 : 0, rotate: 14 }, // star-only
  ];

  // Mid layer: small accents (dots or small stars)
  const midShapes = [
    { left: '14%', top: '14%', size: 10, rotate: 8 },
    { left: '22%', top: '32%', size: 8, rotate: -14 },
    { left: '30%', top: '10%', size: 12, rotate: 20 },
    { left: '36%', top: '52%', size: 10, rotate: -6 },
    { left: '48%', top: '22%', size: 14, rotate: 12 },
    { left: '55%', top: '46%', size: 9, rotate: -18 },
    { left: '62%', top: '8%', size: 11, rotate: 5 },
    { left: '70%', top: '34%', size: 13, rotate: -10 },
    { left: '76%', top: '54%', size: 8, rotate: 16 },
    { left: '84%', top: '18%', size: 10, rotate: -4 },
    { left: '90%', top: '42%', size: 12, rotate: 22 },
    { left: '8%', top: '26%', size: 8, rotate: -16 },
    { left: '18%', top: '68%', size: 11, rotate: 10 },
    { left: '46%', top: '78%', size: 9, rotate: -8 },
    { left: '68%', top: '72%', size: 12, rotate: 14 },
  ];

  // Near layer: thin vertical streamers (kept for both shapes — adds depth, not "circles")
  const streamers = [
    { left: '18%', height: 90, top: '5%' },
    { left: '48%', height: 60, top: '85%' },
    { left: '82%', height: 110, top: '3%' },
    { left: '64%', height: 70, top: '88%' },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <ParallaxLayer y={yFar}>
        {farShapes
          .filter((s) => s.size > 0)
          .map((s, i) => (
            <div
              key={i}
              className="absolute"
              style={{ left: s.left, top: s.top, width: s.size, height: s.size, transform: `rotate(${s.rotate}deg)` }}
            >
              {shape === 'star' ? (
                <Star className="w-full h-full text-primary/[0.08]" fill="currentColor" strokeWidth={0} />
              ) : (
                <div className="w-full h-full rounded-full bg-primary/[0.06]" />
              )}
            </div>
          ))}
      </ParallaxLayer>

      <ParallaxLayer y={yMid}>
        {midShapes.map((s, i) => (
          <div
            key={i}
            className="absolute"
            style={{ left: s.left, top: s.top, width: s.size, height: s.size, transform: `rotate(${s.rotate}deg)` }}
          >
            {shape === 'star' ? (
              <Star className="w-full h-full text-primary/30" fill="currentColor" strokeWidth={0} />
            ) : (
              <div className="w-full h-full rounded-full bg-primary/20" />
            )}
          </div>
        ))}
      </ParallaxLayer>

      <ParallaxLayer y={yNear}>
        {streamers.map((s, i) => (
          <div
            key={i}
            className="absolute w-px bg-primary/15"
            style={{ left: s.left, top: s.top, height: s.height }}
          />
        ))}
      </ParallaxLayer>
    </div>
  );
}

// --- FestiveHero: section wrapper that bundles scroll-bound parallax + confetti ---

interface FestiveHeroProps {
  children: ReactNode;
  className?: string;
  id?: string;
  shape?: FestiveShape;
  /** URL d'une image de fond cover. Si fournie, ajoute un overlay sombre pour préserver la lisibilité. */
  backgroundImage?: string;
  /** Tailwind classes pour l'overlay (par défaut : dégradé noir 70→55→90%). */
  overlayClassName?: string;
}

export function FestiveHero({
  children,
  className,
  id,
  shape = 'circle',
  backgroundImage,
  overlayClassName,
}: FestiveHeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  });

  return (
    <section ref={ref} id={id} className={cn('relative overflow-hidden', className)}>
      {backgroundImage && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${backgroundImage})` }}
            aria-hidden="true"
          />
          <div
            className={cn(
              'absolute inset-0',
              overlayClassName ?? 'bg-gradient-to-b from-black/70 via-black/55 to-black/90'
            )}
            aria-hidden="true"
          />
        </>
      )}
      <HeroParallaxBackground scrollYProgress={scrollYProgress} shape={shape} />
      <Confetti />
      {children}
    </section>
  );
}
