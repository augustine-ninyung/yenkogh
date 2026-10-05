import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-100 dark:bg-[#090C11] text-[#262B32] dark:text-white border-t border-gray-200 dark:border-white/10 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD300]/10 dark:bg-[#FFD300]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand Info */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <span className="font-['Playfair_Display',serif] text-2xl font-bold">
                <span className="text-[#FFD300] drop-shadow-sm">Yɛnkɔ</span>
                <span>GH</span>
              </span>
            </Link>
            <p className="text-[#757B81] dark:text-white/70 text-sm leading-relaxed mb-6 max-w-sm">
              Ghana's premier smart tourism and transportation discovery platform. Explore historical landmarks, pristine natural wonders, vibrant festivals, and plan your entire journey with confidence.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#090C11] dark:text-[#FFD300] bg-[#FFD300]/30 dark:bg-[#FFD300]/10 border border-[#FFD300]/60 dark:border-[#FFD300]/20 px-3 py-1.5 rounded-full w-fit">
              <Sparkles size={14} />
              <span>Akwaaba! Welcome to the Black Star of Africa</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-[#090C11] dark:text-[#FFD300] tracking-wider uppercase mb-4">
              Discover
            </h4>
            <ul className="space-y-2.5 text-sm text-[#757B81] dark:text-white/70">
              <li>
                <Link to="/explore" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  All Destinations
                </Link>
              </li>
              <li>
                <Link to="/events" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Festivals & Events
                </Link>
              </li>
              <li>
                <Link to="/transportation" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Transportation Guide
                </Link>
              </li>
              <li>
                <Link to="/explore?type=historical" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Heritage Castles
                </Link>
              </li>
              <li>
                <Link to="/explore?type=national-park" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  National Parks
                </Link>
              </li>
            </ul>
          </div>

          {/* Travel Tools */}
          <div>
            <h4 className="text-sm font-semibold text-[#090C11] dark:text-[#FFD300] tracking-wider uppercase mb-4">
              Travel Tools
            </h4>
            <ul className="space-y-2.5 text-sm text-[#757B81] dark:text-white/70">
              <li>
                <Link to="/planner" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors flex items-center gap-1.5">
                  <span>AI Trip Planner</span>
                  <span className="text-[10px] bg-[#FFD300] text-[#090C11] font-bold px-1 rounded">NEW</span>
                </Link>
              </li>
              <li>
                <Link to="/budget" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Budget Calculator
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Travel Dashboard
                </Link>
              </li>
              <li>
                <Link to="/transportation#safety" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Travel & Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Create Free Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Regional Highlights */}
          <div>
            <h4 className="text-sm font-semibold text-[#090C11] dark:text-[#FFD300] tracking-wider uppercase mb-4">
              Regions
            </h4>
            <ul className="space-y-2.5 text-sm text-[#757B81] dark:text-white/70">
              <li>
                <Link to="/explore?region=GA" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Greater Accra
                </Link>
              </li>
              <li>
                <Link to="/explore?region=CP" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Central Region (Castles)
                </Link>
              </li>
              <li>
                <Link to="/explore?region=AH" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Ashanti (Kumasi Heritage)
                </Link>
              </li>
              <li>
                <Link to="/explore?region=VR" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Volta (Waterfalls & Lakes)
                </Link>
              </li>
              <li>
                <Link to="/explore?region=SV" className="hover:text-[#090C11] dark:hover:text-white hover:underline transition-colors">
                  Savannah (Mole Safaris)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-gray-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#757B81] dark:text-white/50">
          <p>© {new Date().getFullYear()} YɛnkɔGH Platform. All rights reserved. Crafted with care for Ghana Tourism.</p>
          <div className="flex items-center gap-6">
            <span>Currency: Ghana Cedi (GH₵)</span>
            <span className="hidden sm:inline">•</span>
            <span>English & Multi-language Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
