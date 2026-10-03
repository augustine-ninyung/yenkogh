import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { cn } from '@/utils/cn';
import { createPortal } from 'react-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

interface GalleryImage {
  url: string;
  alt: string;
  caption?: string;
}

interface ImageGalleryProps {
  images: GalleryImage[];
  className?: string;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: GalleryImage[];
  initialIndex: number;
  onClose: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, initialIndex, onClose }) => {
  const [current, setCurrent] = useState(initialIndex);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (animating) return;
      setAnimating(true);
      setCurrent((index + images.length) % images.length);
      setTimeout(() => setAnimating(false), 200);
    },
    [animating, images.length]
  );

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, prev, next]);

  const image = images[current];

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      className="fixed inset-0 z-[99999] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" aria-hidden="true" />

      {/* Content */}
      <div
        className="relative z-10 flex flex-col items-center w-full h-full max-w-6xl mx-auto px-4 py-12"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close lightbox"
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
        >
          <X size={22} />
        </button>

        {/* Image counter */}
        <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-black/50 text-white text-sm font-medium">
          {current + 1} / {images.length}
        </div>

        {/* Main image area */}
        <div className="flex-1 flex items-center justify-center w-full gap-4">
          {/* Prev arrow */}
          <button
            onClick={prev}
            aria-label="Previous image"
            className="shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Image */}
          <div
            className={cn(
              'relative flex-1 h-full flex items-center justify-center transition-opacity duration-200',
              animating ? 'opacity-0' : 'opacity-100'
            )}
          >
            <img
              src={image.url}
              alt={image.alt}
              className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
            />
          </div>

          {/* Next arrow */}
          <button
            onClick={next}
            aria-label="Next image"
            className="shrink-0 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Caption */}
        {image.caption && (
          <p className="mt-4 text-center text-white/80 text-sm max-w-lg">{image.caption}</p>
        )}

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto max-w-full pb-1">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => goTo(idx)}
                aria-label={`View image ${idx + 1}`}
                className={cn(
                  'shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]',
                  idx === current
                    ? 'border-[#FFD300] opacity-100 scale-105'
                    : 'border-white/20 opacity-50 hover:opacity-80'
                )}
              >
                <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

// ─── Image Gallery ────────────────────────────────────────────────────────────

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, className }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!images || images.length === 0) return null;

  const [featured, ...rest] = images;

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  return (
    <>
      <div className={cn('grid gap-2', className)}>
        {/* Featured image */}
        <button
          onClick={() => openLightbox(0)}
          aria-label={`View ${featured.alt}`}
          className="relative group rounded-2xl overflow-hidden aspect-video w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
        >
          <img
            src={featured.url}
            alt={featured.alt}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
            <ZoomIn
              size={36}
              className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-lg"
            />
          </div>
          {featured.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <p className="text-white text-sm">{featured.caption}</p>
            </div>
          )}
        </button>

        {/* Thumbnail grid */}
        {rest.length > 0 && (
          <div
            className={cn(
              'grid gap-2',
              rest.length === 1 && 'grid-cols-1',
              rest.length === 2 && 'grid-cols-2',
              rest.length >= 3 && 'grid-cols-3 sm:grid-cols-4'
            )}
          >
            {rest.slice(0, 7).map((img, idx) => {
              const actualIndex = idx + 1;
              const isLast = idx === 6 && images.length > 8;
              return (
                <button
                  key={idx}
                  onClick={() => openLightbox(actualIndex)}
                  aria-label={`View ${img.alt}`}
                  className="relative group rounded-xl overflow-hidden aspect-square focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
                >
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                    {isLast ? (
                      <span className="text-white font-bold text-lg drop-shadow-lg">
                        +{images.length - 8}
                      </span>
                    ) : (
                      <ZoomIn
                        size={20}
                        className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow"
                      />
                    )}
                  </div>
                  {isLast && (
                    <div className="absolute inset-0 bg-black/50" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox images={images} initialIndex={lightboxIndex} onClose={closeLightbox} />
      )}
    </>
  );
};

export default ImageGallery;
