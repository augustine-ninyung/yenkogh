import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bus,
  Car,
  Plane,
  Ship,
  CheckCircle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import type { Transportation, TransportType } from '@/types';
import { cn } from '@/utils/cn';
import { formatCurrency } from '@/utils/formatters';

interface TransportCardProps {
  transport: Transportation;
  className?: string;
  showRoutes?: boolean;
}

const getTransportIcon = (type: TransportType) => {
  switch (type) {
    case 'bus':
    case 'trotro':
      return Bus;
    case 'taxi':
    case 'ride-hailing':
    case 'shared-taxi':
    case 'private-vehicle':
      return Car;
    case 'domestic-flight':
      return Plane;
    case 'boat':
      return Ship;
    default:
      return Bus;
  }
};

export const TransportCard: React.FC<TransportCardProps> = ({
  transport,
  className,
  showRoutes = true,
}) => {
  const Icon = getTransportIcon(transport.type);

  return (
    <div
      className={cn(
        'group bg-white dark:bg-[#262B32] rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 hover:border-[#FFD300]/40 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col',
        className
      )}
    >
      {/* Header Banner */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100 dark:bg-white/5">
        <img
          src={transport.imageUrl}
          alt={transport.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/30 pointer-events-none" />

        <div className="absolute top-3 left-3 z-10">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 dark:bg-[#090C11]/90 text-[#090C11] dark:text-white backdrop-blur-md shadow-sm text-xs font-semibold uppercase tracking-wider">
            <Icon size={13} className="text-[#FFD300]" />
            <span>{transport.type.replace('-', ' ')}</span>
          </div>
        </div>

        <div className="absolute bottom-3 left-3 right-3 z-10">
          <h3 className="text-white font-bold text-lg leading-snug drop-shadow-md">
            {transport.name}
          </h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-xs sm:text-sm text-[#757B81] dark:text-white/70 line-clamp-2 leading-relaxed mb-4">
            {transport.description}
          </p>

          {/* Key Sample Routes */}
          {showRoutes && transport.routes && transport.routes.length > 0 && (
            <div className="space-y-2 mb-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#757B81] dark:text-white/60 block">
                Popular Routes:
              </span>
              <div className="space-y-1.5">
                {transport.routes.slice(0, 2).map((route, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-1.5 font-medium text-[#090C11] dark:text-white truncate">
                      <span>{route.from}</span>
                      <ArrowRight size={10} className="text-[#FFD300]" />
                      <span>{route.to}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-[#090C11] dark:text-[#FFD300]">
                        {formatCurrency(route.estimatedCost.min)} – {formatCurrency(route.estimatedCost.max)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pros bullet points */}
          {transport.pros && transport.pros.length > 0 && (
            <div className="space-y-1 mb-4">
              {transport.pros.slice(0, 2).map((pro, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs text-[#757B81] dark:text-white/60">
                  <CheckCircle size={12} className="text-emerald-500 shrink-0" />
                  <span className="truncate">{pro}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Link */}
        <div className="pt-3 border-t border-gray-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-1 text-[11px] text-[#757B81] dark:text-white/50">
            <ShieldCheck size={13} className="text-[#FFD300]" />
            <span>Verified Info</span>
          </div>

          <Link
            to={`/transportation#${transport.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/10 text-[#090C11] dark:text-white hover:bg-[#FFD300] hover:text-[#090C11] transition-all"
          >
            <span>Learn More</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
