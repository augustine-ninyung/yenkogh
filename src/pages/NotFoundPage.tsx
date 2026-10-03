import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-gray-50 dark:bg-[#090C11] flex items-center justify-center px-4 sm:px-6 lg:px-8 text-center text-[#262B32] dark:text-white">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-[#FFD300]/20 text-[#090C11] dark:text-[#FFD300] flex items-center justify-center mx-auto">
          <Compass size={40} className="animate-spin-slow" />
        </div>

        <div>
          <h1 className="font-['Playfair_Display',serif] text-6xl font-extrabold text-[#FFD300] mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold mb-2">Trail Not Found</h2>
          <p className="text-sm text-[#757B81] dark:text-white/70 leading-relaxed">
            The destination or trail you're searching for seems to have wandered off the Ghanaian map. Let's get you back on track!
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link to="/">
            <Button variant="primary" size="md">
              <Home size={16} />
              <span>Back to Home</span>
            </Button>
          </Link>
          <Link to="/explore">
            <Button variant="outline" size="md">
              <Compass size={16} />
              <span>Explore Destinations</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
