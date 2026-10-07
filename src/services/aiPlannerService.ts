import { supabase } from '@/lib/supabase';
import { destinations } from '@/data/destinations';
import { festivals } from '@/data/festivals';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { toIsoDate } from '@/utils/tripPlanning';
// The planner's rules live with the server function; the browser reuses its
// pure parts when the app runs without a backend.
import { PlanError, planTrip } from '../../api/plan-trip';
import type { PlannerKnowledge, PlanRequest, PlanResult } from '../../api/plan-trip';

export { MAX_PROMPT_LENGTH, MAX_TRIP_DAYS } from '../../api/plan-trip';
export type { PlanRequest, PlanResult };

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const LOCAL_RUNS_KEY = 'yenkogh_db_planner_runs';

/** A planner run kept in this browser when there is no backend, in the database's shape. */
export interface LocalPlannerRun {
  source: 'ai' | 'catalogue';
  from_description: boolean;
  days: number;
  activity_items: number;
  grounded_items: number;
  duration_ms: number;
  created_at: string;
}

export const localPlannerRuns = (): LocalPlannerRun[] => {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_RUNS_KEY) ?? '[]') as LocalPlannerRun[];
  } catch {
    return [];
  }
};

/** The content this copy of the app is showing, in the shape the planner reads. */
const localKnowledge = (): PlannerKnowledge => {
  const capitalOf = (region: string) => regions.find((r) => r.name === region)?.capital ?? '';
  return {
    destinations: destinations.map((d) => ({
      id: d.id,
      name: d.name,
      region: d.region,
      capital: capitalOf(d.region),
      type: d.type,
      summary: d.shortDescription,
      entryFee: d.entryFee ?? 0,
      costPerPerson: d.estimatedCostPerPerson,
      activities: d.activities.map((a) => ({ name: a.name, cost: a.cost ?? 0, duration: a.duration ?? '' })),
      thingsToDo: d.thingsToDo,
      tags: d.tags,
      openingHours: d.openingHours ?? '',
      bestTime: d.bestTimeToVisit ?? '',
      access: d.transportOptions.map((o) => ({
        mode: o.type,
        description: o.description,
        cost: o.estimatedCost ?? '',
        duration: o.duration ?? '',
      })),
    })),
    festivals: festivals.map((f) => ({
      id: f.id,
      name: f.name,
      region: f.region,
      town: f.town,
      month: f.month,
      usualDate: f.usualDate,
      summary: f.description.slice(0, 300),
      activities: f.activities.slice(0, 5),
    })),
    transport: transportation.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type,
      routes: t.routes.map((r) => ({
        from: r.from,
        to: r.to,
        duration: r.estimatedDuration,
        min: r.estimatedCost.min,
        max: r.estimatedCost.max,
      })),
    })),
  };
};

export const aiPlannerService = {
  /**
   * Plans a trip from a description and/or the planner form. With a backend the
   * server does it (database lookup, then the language model); without one the
   * plan is assembled in the browser from the content shipped with the app.
   * Rejects with a message meant for the traveller.
   */
  async plan(request: PlanRequest): Promise<PlanResult> {
    if (!supabase) {
      await delay(900);
      try {
        const started = Date.now();
        const result = await planTrip(request, localKnowledge(), {
          apiKey: '',
          fetch: () => Promise.reject(new Error('offline')),
          today: toIsoDate(new Date()),
        });
        const run: LocalPlannerRun = {
          source: result.source,
          from_description: Boolean(request.prompt),
          days: result.itinerary.days.length,
          activity_items: result.grounding.activityItems,
          grounded_items: result.grounding.groundedItems,
          duration_ms: Date.now() - started,
          created_at: new Date().toISOString(),
        };
        try {
          localStorage.setItem(LOCAL_RUNS_KEY, JSON.stringify([...localPlannerRuns(), run].slice(-500)));
        } catch {
          // Storage can be unavailable; the plan still stands
        }
        return result;
      } catch (err) {
        // Only the planner's own refusals are worded for the traveller
        if (err instanceof PlanError) throw err;
        console.error(err);
        throw new Error('Could not plan the trip. Please try again.', { cause: err });
      }
    }

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) throw new Error('Please sign in to plan a trip.');

    let response: Response;
    try {
      response = await fetch('/api/plan-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(request),
      });
    } catch {
      throw new Error('Could not reach the planner. Check your connection and try again.');
    }

    const payload = (await response.json().catch(() => null)) as (PlanResult & { error?: string }) | null;
    if (!response.ok || !payload?.itinerary) {
      throw new Error(payload?.error ?? 'The planner is not available right now. Please try again shortly.');
    }
    return payload;
  },
};
