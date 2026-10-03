import { useState, useEffect, useCallback } from 'react';
import type { Event, EventFilterParams } from '@/types';
import { eventService } from '@/services/eventService';

interface UseEventsResult {
  events: Event[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useEvents(params?: EventFilterParams): UseEventsResult {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await eventService.getAll(params);
      setEvents(data);
    } catch {
      setError('Failed to load events. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [JSON.stringify(params)]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { events, isLoading, error, refetch: fetch };
}

export function useFeaturedEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventService
      .getFeatured()
      .then(setEvents)
      .catch(() => setError('Failed to load featured events.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { events, isLoading, error };
}

export function useUpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    eventService
      .getUpcoming()
      .then(setEvents)
      .catch(() => setError('Failed to load upcoming events.'))
      .finally(() => setIsLoading(false));
  }, []);

  return { events, isLoading, error };
}

export function useEvent(slug: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    eventService
      .getBySlug(slug)
      .then((e) => {
        if (e) setEvent(e);
        else setError('Event not found.');
      })
      .catch(() => setError('Failed to load event.'))
      .finally(() => setIsLoading(false));
  }, [slug]);

  return { event, isLoading, error };
}
