import { useState, useEffect, useCallback } from 'react';
import type { Destination, SearchParams } from '@/types';
import { destinationService } from '@/services/destinationService';

interface UseDestinationsResult {
  destinations: Destination[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useDestinations(params?: SearchParams): UseDestinationsResult {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

   
  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await destinationService.getAll(params);
      setDestinations(data);
    } catch {
      setError('Failed to load destinations. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { destinations, isLoading, error, refetch: fetch };
}

export function useFeaturedDestinations() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    destinationService
      .getFeatured()
      .then(setDestinations)
      .catch(() => setError('Failed to load featured destinations.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { destinations, isLoading, error };
}

export function useDestination(idOrSlug: string) {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!idOrSlug) return;
    setIsLoading(true);
    setError(null);
    destinationService
      .getBySlug(idOrSlug)
      .then((d) => {
        if (d) setDestination(d);
        else setError('Destination not found.');
      })
      .catch(() => setError('Failed to load destination.'))
      .finally(() => setIsLoading(false));
  }, [idOrSlug]);

  return { destination, isLoading, error };
}
