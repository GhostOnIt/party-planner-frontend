import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLoginSpots } from "@/hooks/useCommunication";
import logo from "@/assets/logo.png";
import { resolveUrl } from "@/lib/utils";

// Fallback image for loading state
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1920&h=1080&fit=crop";

export function AuthPromoPanel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Fetch spots from API (public endpoint, no auth required)
  const { data: spots, isLoading } = useLoginSpots();

  // Transform API spots for display
  const advertisements = useMemo(() => {
    if (!spots || spots.length === 0) return [];
    
    return spots.map((spot) => ({
      id: spot.id,
      title: spot.title || "",
      description: spot.description || "",
      image: spot.image || FALLBACK_IMAGE,
    }));
  }, [spots]);

  // Auto-rotate carousel
  useEffect(() => {
    if (advertisements.length <= 1) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [advertisements.length]);

  // Note: View tracking is disabled on login page since user is not authenticated

  const ad = advertisements[currentIndex];

  // Show loading state or empty state
  if (isLoading || advertisements.length === 0) {
    return (
      <div className="relative h-full w-full overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${FALLBACK_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Party Planner" className="h-12 w-12 object-contain" />
            <span className="text-2xl font-bold text-white">Party Planner</span>
          </div>
          {!isLoading && advertisements.length === 0 && (
            <div className="flex-1 flex flex-col justify-end pb-16">
              <div className="space-y-4 max-w-lg">
                <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  Bienvenue sur Party Planner
                </h2>
                <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                  Créez, planifiez et gérez vos événements avec une simplicité déconcertante.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Background Images - Crossfade */}
      {advertisements.map((advertisement, index) => (
        <motion.div
          key={advertisement.id}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${resolveUrl(advertisement.image)})` }}
          initial={false}
          animate={{ 
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 1.1
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      ))}
      
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col justify-between p-8 lg:p-12">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <img src={logo} alt="Party Planner" className="h-12 w-12 object-contain" />
          <span className="text-2xl font-bold text-white">Party Planner</span>
        </motion.div>

        {/* Ad Content */}
        <div className="flex-1 flex flex-col justify-end pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="space-y-4 max-w-lg"
            >
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                {ad.title}
              </h2>
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed">
                {ad.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Slide Indicators */}
        {advertisements.length > 1 && (
          <div className="flex items-center gap-3">
            {advertisements.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className="group relative h-1 overflow-hidden rounded-full transition-all duration-300"
                style={{ width: index === currentIndex ? "48px" : "12px" }}
              >
                <div className="absolute inset-0 bg-white/30" />
                {index === currentIndex && (
                  <motion.div
                    className="absolute inset-0 bg-white rounded-full origin-left"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 6, ease: "linear" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
