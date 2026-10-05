import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { hydrateContent } from '@/services/content/contentStore';
import './index.css';

// The site's content comes from the database. It is loaded before the first
// render so no page ever shows stale bundled content and then swaps it out;
// hydrateContent never rejects, and falls back to the bundled content.
void hydrateContent().then(() => {
  ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
