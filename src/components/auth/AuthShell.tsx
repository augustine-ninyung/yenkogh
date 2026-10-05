import React from 'react';
import { CalendarDays, Map, Wallet } from 'lucide-react';

interface AuthShellProps {
  /** Heading above the form */
  title: string;
  subtitle: string;
  /** Unsplash photo shown beside the form on wide screens */
  photo: { id: string; caption: string; credit: string };
  /** Large line over the photo */
  headline: string;
  children: React.ReactNode;
  /** The "no account yet?" / "already registered?" line under the form */
  footer: React.ReactNode;
}

const BENEFITS = [
  { icon: Map, text: 'Day-by-day trip plans built around the places you pick' },
  { icon: CalendarDays, text: 'Over 100 festivals, with dates checked against your trip' },
  { icon: Wallet, text: 'A budget for every trip, in Ghana cedis' },
];

// ─── AuthShell ────────────────────────────────────────────────────────────────
// Shared frame for the sign-in and sign-up pages: the form on one side and, on
// wide screens, a photo panel that says what an account is for.

export const AuthShell: React.FC<AuthShellProps> = ({ title, subtitle, photo, headline, children, footer }) => {
  return (
    <div className="pt-20 min-h-screen bg-white dark:bg-[#090C11] text-[#262B32] dark:text-white lg:grid lg:grid-cols-2">
      {/* Photo panel */}
      <aside className="relative hidden lg:block overflow-hidden bg-[#090C11]">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-${photo.id}?auto=format&fit=crop&w=1100&q=60)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#090C11] via-[#090C11]/55 to-[#090C11]/25" />

        <div className="relative h-full flex flex-col justify-end p-12 xl:p-16 text-white">
          <div>
            <p className="text-4xl xl:text-5xl font-black leading-[1.1] tracking-tight max-w-md">{headline}</p>
            <ul className="mt-8 space-y-4 max-w-md">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-start gap-3 text-sm xl:text-base text-white/85">
                  <span className="mt-0.5 flex items-center justify-center w-8 h-8 shrink-0 rounded-lg bg-[#FFD300] text-[#090C11]">
                    <Icon size={16} />
                  </span>
                  <span className="pt-1">{text}</span>
                </li>
              ))}
            </ul>
            <p className="mt-10 text-xs text-white/50">
              {photo.caption} · Photo by {photo.credit} on Unsplash
            </p>
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex items-center justify-center px-4 sm:px-6 py-12 lg:py-16">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-black tracking-tight text-[#090C11] dark:text-white">{title}</h1>
          <p className="mt-2 text-sm text-[#757B81] dark:text-white/60">{subtitle}</p>

          <div className="mt-8 space-y-6">{children}</div>

          <p className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 text-center text-sm text-[#757B81] dark:text-white/60">
            {footer}
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthShell;
