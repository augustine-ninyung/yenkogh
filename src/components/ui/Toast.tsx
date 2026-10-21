import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useToast, type ToastData, type ToastVariant } from '@/context/useToast';
import { createPortal } from 'react-dom';

// ─── Variant config ───────────────────────────────────────────────────────────

const variantConfig: Record<
  ToastVariant,
  { icon: React.ReactNode; bar: string; iconColor: string; border: string }
> = {
  success: {
    icon: <CheckCircle2 size={18} />,
    bar: 'bg-green-500',
    iconColor: 'text-green-500',
    border: 'border-l-green-500',
  },
  error: {
    icon: <XCircle size={18} />,
    bar: 'bg-red-500',
    iconColor: 'text-red-500',
    border: 'border-l-red-500',
  },
  warning: {
    icon: <AlertTriangle size={18} />,
    bar: 'bg-[#FFD300]',
    iconColor: 'text-[#FFD300]',
    border: 'border-l-[#FFD300]',
  },
  info: {
    icon: <Info size={18} />,
    bar: 'bg-blue-500',
    iconColor: 'text-blue-500',
    border: 'border-l-blue-500',
  },
};

// ─── Single Toast ─────────────────────────────────────────────────────────────

export const Toast: React.FC<{ toast: ToastData; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(100);
  const config = variantConfig[toast.variant];
  const duration = toast.duration ?? 4000;

  // Animate in on mount
  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Shrink progress bar from 100 → 0 over `duration` ms
  useEffect(() => {
    if (!duration || duration <= 0) return;
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 40);
    return () => clearInterval(interval);
  }, [duration]);

  const handleDismiss = () => {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
      className={cn(
        'pointer-events-auto relative w-full bg-white dark:bg-[#262B32]',
        'rounded-xl shadow-lg border border-gray-100 dark:border-white/10 border-l-4 overflow-hidden',
        'transition-all duration-300 ease-out',
        visible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0',
        config.border
      )}
    >
      {/* Body */}
      <div className="flex items-start gap-3 p-4 pr-10">
        <span className={cn('shrink-0 mt-0.5', config.iconColor)} aria-hidden="true">
          {config.icon}
        </span>
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-[#262B32] dark:text-white leading-snug">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-muted dark:text-[#9aa0a8] leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        aria-label="Dismiss notification"
        className="absolute top-3 right-3 p-0.5 rounded-md text-muted hover:text-[#262B32] dark:hover:text-white transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD300]"
      >
        <X size={14} />
      </button>

      {/* Animated progress bar */}
      {duration > 0 && (
        <div className="h-0.5 w-full bg-gray-100 dark:bg-white/10">
          <div
            className={cn('h-full transition-none', config.bar)}
            style={{ width: `${progress}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
};

// ─── Toast Container ──────────────────────────────────────────────────────────

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  return createPortal(
    <div
      role="region"
      aria-label="Notifications"
      className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>,
    document.body
  );
};

export default Toast;
