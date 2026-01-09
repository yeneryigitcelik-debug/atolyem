"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { heroSlides, HeroSlide } from "@/data/hero-slides";

interface HeroCarouselProps {
  slides?: HeroSlide[];
  autoPlayInterval?: number; // in milliseconds, default 5000
}

export default function HeroCarousel({ 
  slides = heroSlides, 
  autoPlayInterval = 5000 
}: HeroCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true,
      align: "start",
      duration: 20,
    },
    []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      setIsPlaying(false);
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      setIsPlaying(false);
    }
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) {
        emblaApi.scrollTo(index);
        setIsPlaying(false);
      }
    },
    [emblaApi]
  );

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    // Initialize with current index without triggering cascade
    const initialIndex = emblaApi.selectedScrollSnap();
    setSelectedIndex(initialIndex);
    
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [emblaApi]);

  // Auto-play functionality
  useEffect(() => {
    if (!emblaApi || !isPlaying) return;

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [emblaApi, isPlaying, autoPlayInterval]);

  // Pause on hover
  const handleMouseEnter = () => setIsPlaying(false);
  const handleMouseLeave = () => setIsPlaying(true);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scrollPrev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  return (
    <div 
      className="relative w-full h-[500px] sm:h-[600px] lg:h-[700px] overflow-hidden rounded-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Hero carousel"
    >
      <div className="embla overflow-hidden h-full" ref={emblaRef}>
        <div className="embla__container flex h-full">
          {slides.map((slide, index) => (
            <div 
              key={slide.id} 
              className="embla__slide flex-[0_0_100%] min-w-0 relative h-full"
            >
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title || `Hero slide ${index + 1}`}
                  fill
                  priority={index === 0}
                  className="object-cover"
                  sizes="100vw"
                  quality={90}
                />
                
                {/* Gradient Overlay */}
                {slide.overlay && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
                )}

                {/* Content */}
                {(slide.title || slide.subtitle || slide.ctaText) && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
                      <div className="max-w-2xl text-center lg:text-left">
                        {slide.title && (
                          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight mb-4 lg:mb-6">
                            {slide.title}
                          </h2>
                        )}
                        {slide.subtitle && (
                          <p className="text-lg sm:text-xl text-white/90 max-w-lg mx-auto lg:mx-0 font-light leading-relaxed mb-6 lg:mb-8">
                            {slide.subtitle}
                          </p>
                        )}
                        {slide.ctaText && slide.ctaLink && (
                          <Link
                            href={slide.ctaLink}
                            className="inline-block px-8 py-3.5 bg-primary hover:bg-primary-dark text-white text-base font-semibold rounded-md shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                          >
                            {slide.ctaText}
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white text-text-charcoal rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Önceki slide"
      >
        <span className="material-symbols-outlined text-2xl">chevron_left</span>
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-white/90 hover:bg-white text-text-charcoal rounded-full shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-label="Sonraki slide"
      >
        <span className="material-symbols-outlined text-2xl">chevron_right</span>
      </button>

      {/* Dot Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-transparent ${
              index === selectedIndex
                ? "bg-white w-8"
                : "bg-white/50 hover:bg-white/75"
            }`}
            aria-label={`Slide ${index + 1}'e git`}
            aria-current={index === selectedIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
}

