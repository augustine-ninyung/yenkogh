import React from 'react';
import { Spinner } from '@/components/ui/Spinner';

// Shown in place of a page while its code is being fetched.
export const PageFallback: React.FC = () => (
  <div className="min-h-[60vh] flex items-center justify-center" role="status" aria-label="Loading page">
    <Spinner size="lg" color="primary" />
  </div>
);

export default PageFallback;
