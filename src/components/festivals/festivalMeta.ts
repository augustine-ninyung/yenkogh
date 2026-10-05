import {
  Wheat, Footprints, Droplets, Crown, Swords, Gem, Moon, Flame, Fish, Target, Landmark, Palette, Handshake,
  type LucideIcon,
} from 'lucide-react';
import type { FestivalCategory } from '@/types';

interface CategoryMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind gradient used as the banner when a festival has no photo */
  gradient: string;
}

export const FESTIVAL_CATEGORY_META: Record<FestivalCategory, CategoryMeta> = {
  harvest: { label: 'Harvest', icon: Wheat, gradient: 'from-amber-500 to-yellow-700' },
  migration: { label: 'Migration', icon: Footprints, gradient: 'from-sky-600 to-indigo-800' },
  purification: { label: 'Purification', icon: Droplets, gradient: 'from-cyan-600 to-teal-800' },
  ancestral: { label: 'Ancestral', icon: Crown, gradient: 'from-yellow-600 to-amber-900' },
  'war-commemoration': { label: 'War Commemoration', icon: Swords, gradient: 'from-red-700 to-rose-950' },
  initiation: { label: 'Initiation', icon: Gem, gradient: 'from-fuchsia-600 to-purple-900' },
  religious: { label: 'Religious', icon: Moon, gradient: 'from-emerald-600 to-green-900' },
  fire: { label: 'Fire', icon: Flame, gradient: 'from-orange-500 to-red-800' },
  fishing: { label: 'Fishing', icon: Fish, gradient: 'from-blue-500 to-cyan-800' },
  hunting: { label: 'Hunting', icon: Target, gradient: 'from-lime-700 to-green-950' },
  heritage: { label: 'Heritage', icon: Landmark, gradient: 'from-stone-600 to-neutral-900' },
  arts: { label: 'Arts', icon: Palette, gradient: 'from-pink-500 to-violet-800' },
  development: { label: 'Development', icon: Handshake, gradient: 'from-teal-600 to-emerald-900' },
};
