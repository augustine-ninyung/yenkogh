import React from 'react';
import { Compass, Home } from 'lucide-react';
import { ButtonLink } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50 dark:bg-[#090C11] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-[#262B32] dark:text-white">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300] flex items-center justify-center mx-auto">
          <Compass size={40} aria-hidden="true" />
        </div>

        <div>
          <h1 className="tracking-tight text-6xl font-extrabold text-accent-ink mb-2">
            404
          </h1>
          <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
          <p className="text-sm text-muted dark:text-white/70 leading-relaxed">
            The page you're looking for doesn't exist or has moved. Check the address, or use the links below.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <ButtonLink to="/" variant="primary" size="md">
              <Home size={16} />
              <span>Back to Home</span>
            </ButtonLink>
          <ButtonLink to="/explore" variant="outline" size="md">
              <Compass size={16} />
              <span>Explore Destinations</span>
            </ButtonLink>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
