import { useState, useEffect, useCallback } from 'react';
import type { Transportation } from '@/types';
import { transportationService } from '@/services/transportationService';

interface UseTransportationResult {
  transportation: Transportation[];
  isLoading: boolean;
  error: string | null;
}

export function useTransportation(): UseTransportationResult {
  const [transportation, setTransportation] = useState<Transportation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    transportationService
      .getAll()
      .then(setTransportation)
      .catch(() => setError('Failed to load transportation options.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { transportation, isLoading, error };
}

interface UseTransportSearchResult {
  results: Transportation[];
  isLoading: boolean;
  error: string | null;
  search: (from: string, to: string) => void;
}

export function useTransportSearch(
  initialFrom: string = '',
  initialTo: string = '',
): UseTransportSearchResult {
  const [results, setResults] = useState<Transportation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback((from: string, to: string) => {
    if (!from || !to) return;
    setIsLoading(true);
    setError(null);
    transportationService
      .searchRoutes(from, to)
      .then(setResults)
      .catch(() => setError('Failed to search transport routes. Please try again.'))
      .finally(() => setIsLoading(false));
  }, []);

  // Run an initial search if both values are provided at mount time.
  useEffect(() => {
    if (initialFrom && initialTo) {
      search(initialFrom, initialTo);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { results, isLoading, error, search };
}
