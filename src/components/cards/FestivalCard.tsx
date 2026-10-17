import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { Festival } from '@/types';
import { cn } from '@/utils/cn';
import { FESTIVAL_CATEGORY_META } from '@/components/festivals/festivalMeta';

interface FestivalCardProps {
  festival: Festival;
  className?: string;
}

export const FestivalCard: React.FC<FestivalCardProps> = ({ festival, className }) => {
  const meta = FESTIVAL_CATEGORY_META[festival.category];
  const Icon = meta.icon;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(festival.image) && !imageFailed;

  return (
    <Link
      to={`/festivals/${festival.id}`}
      className={cn(
        'group bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col',
        className
      )}
    >
      {/* Banner: a category-coloured panel, covered by the festival photo when one is on record and loads */}
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <div className={cn('w-full h-full bg-gradient-to-br flex items-center justify-center', meta.gradient)}>
          <Icon className="w-16 h-16 text-white/25 transition-transform duration-500 group-hover:scale-110" />
        </div>
        {showImage && (
          <>
            <img
              // Cards only need a small rendition of the full-width photo
              src={festival.image.replace('width=1200', 'width=640')}
              alt={festival.name}
              loading="lazy"
              onError={() => setImageFailed(true)}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />
          </>
        )}

        <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-[#090C11]/70 backdrop-blur-sm px-2.5 py-1 text-[11px] font-semibold text-white">
          <Icon className="w-3 h-3 text-[#FFD300]" />
          {meta.label}
        </span>
        <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-[#090C11]">
          {festival.region}
        </span>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-lg leading-snug mb-2 text-[#262B32] dark:text-white group-hover:text-[#FFD300] transition-colors">
          {festival.name}
        </h3>
        <p className="text-sm text-muted dark:text-white/60 line-clamp-2 mb-4">
          {festival.description || 'Details for this festival are still being gathered.'}
        </p>

        <div className="mt-auto space-y-1.5 text-xs text-muted dark:text-white/70">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-[#FFD300]" />
            <span className="truncate">{festival.month || 'Date not on record'}</span>
          </div>
          {(festival.town || festival.traditionalArea) && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#FFD300]" />
              <span className="truncate">{festival.town || festival.traditionalArea}</span>
            </div>
          )}
          {festival.ethnicGroup && (
            <div className="flex items-center gap-2">
              <Users className="w-3.5 h-3.5 shrink-0 text-[#FFD300]" />
              <span className="truncate">{festival.ethnicGroup}</span>
            </div>
          )}
        </div>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#262B32] dark:text-white group-hover:gap-2.5 transition-all">
          View festival <ArrowRight className="w-4 h-4 text-[#FFD300]" />
        </span>
      </div>
    </Link>
  );
};

export default FestivalCard;
