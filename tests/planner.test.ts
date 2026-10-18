// Checks for the trip planner (api/plan-trip.ts). Run with: npm test
//
// Everything here runs offline: the catalogue is the content shipped with the
// app, pushed through the same row mapping the database uses, and the language
// model and Supabase are replaced by stand-ins.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import handler, {
  MAX_TRIP_DAYS,
  PlanError,
  knowledgeFromRows,
  parsePrompt,
  planTrip,
  type PlanOptions,

} from '../api/plan-trip';
import { safeUrl } from '@/utils/safeUrl';
import { destinations } from '@/data/destinations';
import { festivals } from '@/data/festivals';
import { regions } from '@/data/regions';
import { transportation } from '@/data/transportation';
import { destinationToRow, festivalToRow, regionToRow, transportToRow } from '@/services/content/resources';

const TODAY = '2026-10-07';

// The rows as the planner's database queries return them
const rows = {
  regions: regions.map((r, i) => ({ ...regionToRow(r, i) })),
  destinations: destinations.map((d, i) => ({ ...destinationToRow(d, i, regions) })),
  festivals: festivals.map((f, i) => {
    const row = festivalToRow(f, i, regions);
    return { ...row, usual_date: row.details.usualDate, activities: row.details.activities };
  }),
  transport: transportation.map((t, i) => ({ ...transportToRow(t, i) })),
};
const knowledge = knowledgeFromRows(rows);

const offline: PlanOptions = {
  apiKey: '',
  today: TODAY,
  retryDelayMs: 0,
  fetch: () => Promise.reject(new Error('no network in tests')),
};

/** Options whose "model" answers with the given plan. */
const withModel = (answer: unknown, seen: { prompt?: string } = {}): PlanOptions => ({
  apiKey: 'test-key',
  today: TODAY,
  retryDelayMs: 0,
  fetch: async (_url, init) => {
    seen.prompt = String((init as { body: string }).body);
    return {
      ok: true,
      status: 200,
      json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] } }] }),
      text: async () => '',
    };
  },
});

const meal = (time: string, title: string, cost: number) => ({ time, title, description: 'Typical price.', type: 'meal', cost });

// ─── Reading the catalogue ────────────────────────────────────────────────────

test('the catalogue is read from database rows with fees, activities and fares', () => {
  assert.equal(knowledge.destinations.length, destinations.length);
  assert.equal(knowledge.festivals.length, festivals.length);
  const kakum = knowledge.destinations.find((d) => d.name === 'Kakum National Park');
  assert.ok(kakum);
  assert.equal(kakum.region, 'Central');
  assert.equal(kakum.capital, 'Cape Coast');
  assert.ok(kakum.activities.some((a) => a.name === 'Canopy Walkway' && a.cost === 60));
  assert.ok(kakum.access.length > 0);
  const stc = knowledge.transport.find((t) => t.routes.some((r) => r.from === 'Accra' && r.to === 'Cape Coast'));
  assert.ok(stc && stc.routes[0].min > 0);
  const withDate = knowledge.festivals.find((f) => f.usualDate);
  assert.ok(withDate, 'festival dates come through');
});

// ─── Understanding a sentence ─────────────────────────────────────────────────

test('a sentence gives trip length, budget, party size, origin and places', () => {
  const p = parsePrompt('3 days from Accra to Cape Coast for two people with GHS 1500. We love history and beaches.', knowledge);
  assert.equal(p.days, 3);
  assert.equal(p.budget, 1500);
  assert.equal(p.travelers, 2);
  assert.equal(p.origin, 'Accra');
  assert.deepEqual(p.destinationIds.map((id) => knowledge.destinations.find((d) => d.id === id)?.name), ['Cape Coast Castle']);
});

test('other ways of saying the same things are understood', () => {
  assert.equal(parsePrompt('a weekend in the Volta Region, solo, budget 900 cedis', knowledge).days, 2);
  assert.equal(parsePrompt('a weekend in the Volta Region, solo, budget 900 cedis', knowledge).travelers, 1);
  assert.equal(parsePrompt('a weekend in the Volta Region, solo, budget 900 cedis', knowledge).budget, 900);
  assert.deepEqual(parsePrompt('a weekend in the Volta Region', knowledge).regions, ['Volta']);
  assert.equal(parsePrompt('two weeks around Ghana, GH₵ 12,000', knowledge).days, 14);
  assert.equal(parsePrompt('two weeks around Ghana, GH₵ 12,000', knowledge).budget, 12000);
  assert.equal(parsePrompt('5k cedis, me with 3 friends', knowledge).budget, 5000);
  assert.equal(parsePrompt('5k cedis, me with 3 friends', knowledge).travelers, 4);
  assert.equal(parsePrompt('a couple of days at Mole', knowledge).days, 2);
  assert.equal(parsePrompt('a couple of days at Mole', knowledge).travelers, undefined);
  assert.equal(parsePrompt('trip with my wife in December', knowledge).travelers, 2);
  assert.equal(parsePrompt('trip with my wife in December', knowledge).month, 11);
  assert.ok(parsePrompt('I want to attend Homowo in Accra', knowledge).festivalId, 'a festival is recognised by name');
});

test('the starting town is not treated as somewhere to visit', () => {
  const p = parsePrompt('from Kumasi to Mole National Park for 4 days', knowledge);
  assert.equal(p.origin, 'Kumasi');
  assert.deepEqual(p.regions, []);
  assert.deepEqual(p.destinationIds.map((id) => knowledge.destinations.find((d) => d.id === id)?.name), ['Mole National Park']);
});

// ─── Plans built from the records ─────────────────────────────────────────────

test('a described trip becomes a plan made only of catalogue records', async () => {
  const result = await planTrip({ prompt: '3 days from Accra to Cape Coast for two people with GHS 1500. We love history and beaches.' }, knowledge, offline);
  assert.equal(result.source, 'catalogue');
  assert.equal(result.itinerary.days.length, 3);
  assert.equal(result.applied.numberOfTravelers, 2);
  assert.equal(result.applied.budget, 1500);
  assert.equal(result.applied.endDate > result.applied.startDate, true);
  assert.equal(result.itinerary.days[0].location, 'Cape Coast Castle');
  // With room to spare, the trip takes in another catalogue place in the same region
  const visited = result.itinerary.days.map((d) => knowledge.destinations.find((k) => k.name === d.location));
  assert.ok(visited.every((d) => d && d.region === 'Central'));
  assert.equal(new Set(visited).size, 2);

  const all = result.itinerary.days.flatMap((d) => d.items);
  const first = result.itinerary.days[0].items[0];
  assert.equal(first.type, 'transport');
  assert.match(first.title + first.description, /Accra/);
  assert.ok(first.cost > 0, 'the fare comes from the catalogue');
  // Every activity points at a real record and uses that record's price
  for (const item of all.filter((i) => i.type === 'activity')) {
    const place = knowledge.destinations.find((d) => d.id === item.destinationId);
    assert.ok(place, `${item.title} points at a catalogue record`);
    const known = [place.entryFee, ...place.activities.map((a) => a.cost)];
    assert.ok(known.includes(item.cost), `${item.title} costs ${item.cost}, which is not a recorded price`);
  }
  assert.equal(result.grounding.groundedItems, result.grounding.activityItems);
  assert.equal(result.itinerary.totalEstimatedCost, all.reduce((s, i) => s + i.cost, 0) * 2);
  const nights = all.filter((i) => i.type === 'accommodation');
  assert.equal(nights.length, 2, 'no overnight stay on the last day');
  assert.ok(nights.every((n) => n.cost === 100) && result.notes.some((n) => /Budget rooms/.test(n)), 'cheaper rooms are used when the budget is tight');
});

test('with no place named, the plan picks destinations that match the interests', async () => {
  const result = await planTrip({ prompt: 'A weekend of waterfalls and hiking in the Volta Region, solo, budget 900 cedis.' }, knowledge, offline);
  assert.equal(result.itinerary.days.length, 2);
  assert.equal(result.applied.numberOfTravelers, 1);
  const place = knowledge.destinations.find((d) => d.name === result.itinerary.days[0].location);
  assert.ok(place, 'the stop is a catalogue destination');
  assert.equal(place.region, 'Volta');
  assert.equal(place.type, 'waterfall');
});

test('wildlife in the north leads to Mole', async () => {
  const result = await planTrip({ prompt: 'Five days to see elephants on safari, 4 people, GHS 8000.' }, knowledge, offline);
  assert.equal(result.itinerary.days.length, 5);
  assert.ok(result.itinerary.days.some((d) => d.location === 'Mole National Park'));
});

test('the form alone still works, and keeps a place that is not in the catalogue', async () => {
  const result = await planTrip(
    { destinations: ['Kakum National Park', "My grandmother's village"], startDate: '2026-12-10', endDate: '2026-12-14', numberOfTravelers: 3, budget: 4000, accommodationType: 'budget' },
    knowledge,
    offline,
  );
  assert.equal(result.itinerary.days.length, 4);
  assert.equal(result.itinerary.days[0].date, '2026-12-10');
  assert.deepEqual(result.applied.destinations, ['Kakum National Park', "My grandmother's village"]);
  const village = result.itinerary.days.at(-1)!;
  assert.ok(village.items.some((i) => /not in the YɛnkɔGH catalogue/.test(i.description)), 'nothing is invented for an unknown place');
  assert.ok(village.items.filter((i) => i.type !== 'meal').every((i) => i.cost === 0));
});

test('a festival trip is set in the festival and its region', async () => {
  const festival = knowledge.festivals.find((f) => f.name.includes('Homowo'))!;
  const result = await planTrip({ festivalId: festival.id, startDate: '2027-08-10', endDate: '2027-08-13' }, knowledge, offline);
  assert.equal(result.applied.festivalId, festival.id);
  assert.equal(result.itinerary.days[0].location, festival.name);
  assert.ok(result.grounding.festivals.some((f) => f.id === festival.id));
});

test('going over budget is said plainly', async () => {
  const result = await planTrip({ prompt: '5 days at Mole National Park for 6 people with GHS 500' }, knowledge, offline);
  assert.ok(result.itinerary.totalEstimatedCost > 500);
  assert.ok(result.notes.some((n) => /over your budget/.test(n)));
});

// ─── Requests that are refused ────────────────────────────────────────────────

test('trips outside 1 to 14 days are refused', async () => {
  await assert.rejects(planTrip({ prompt: '20 days around Ghana' }, knowledge, offline), (e) => e instanceof PlanError && /1 to 14 days/.test(e.message));
  await assert.rejects(
    planTrip({ destinations: ['Labadi Beach'], startDate: '2026-12-01', endDate: '2026-12-25' }, knowledge, offline),
    PlanError,
  );
  assert.equal(MAX_TRIP_DAYS, 14);
});

test('empty, oversized and malformed requests are refused', async () => {
  await assert.rejects(planTrip({}, knowledge, offline), PlanError);
  await assert.rejects(planTrip({ prompt: 'x'.repeat(601) }, knowledge, offline), PlanError);
  await assert.rejects(planTrip({ destinations: ['Labadi Beach'], startDate: 'next week' }, knowledge, offline), PlanError);
  await assert.rejects(planTrip({ destinations: ['Labadi Beach'], startDate: '2026-12-05', endDate: '2026-12-01' }, knowledge, offline), PlanError);
  await assert.rejects(planTrip({ destinations: ['Labadi Beach'], numberOfTravelers: 500 }, knowledge, offline), PlanError);
  await assert.rejects(planTrip({ destinations: ['Labadi Beach'], budget: -5 }, knowledge, offline), PlanError);
});

// ─── The language model ───────────────────────────────────────────────────────

const castleId = knowledge.destinations.find((d) => d.name === 'Cape Coast Castle')!.id;
const goodDay = (location: string) => ({
  location,
  description: 'History on the coast',
  items: [
    meal('08:00', 'Breakfast', 25),
    { time: '10:00', title: 'Guided Museum Tour', description: 'Dungeons and the Door of No Return.', type: 'activity', cost: 30, destinationId: castleId },
    meal('13:00', 'Lunch', 60),
  ],
});

test('the model is sent the matching records and told to use nothing else', async () => {
  const seen: { prompt?: string } = {};
  const answer = { title: 'Castles of the Coast', summary: 'Two days of history within budget.', days: [goodDay('Cape Coast Castle'), goodDay('Cape Coast Castle')] };
  const result = await planTrip({ prompt: '2 days in Cape Coast for two, GHS 1500, history' }, knowledge, withModel(answer, seen));
  assert.equal(result.source, 'ai');
  assert.equal(result.itinerary.title, 'Castles of the Coast');
  assert.equal(result.itinerary.totalEstimatedCost, (25 + 30 + 60) * 2 * 2);
  assert.ok(result.notes.includes('Two days of history within budget.'));
  assert.equal(result.grounding.groundedItems, 2);

  const sent = JSON.parse(seen.prompt!);
  const userText: string = sent.contents[0].parts[0].text;
  assert.match(sent.systemInstruction.parts[0].text, /Use ONLY the CATALOGUE/);
  assert.match(userText, /Cape Coast Castle/);
  assert.match(userText, new RegExp(castleId));
  assert.match(userText, /ALLOWED LOCATIONS/);
  assert.equal(sent.generationConfig.responseMimeType, 'application/json');
  // Retrieval narrows the catalogue rather than sending all of it
  const sentCatalogue = JSON.parse(userText.slice(userText.indexOf('CATALOGUE:\n') + 11));
  assert.ok(sentCatalogue.destinations.length <= 8);
  assert.ok(sentCatalogue.festivals.length <= 5);
});

test('an id the model made up is dropped, not linked', async () => {
  const day = goodDay('Cape Coast Castle');
  day.items.push({ time: '15:00', title: 'Secret Gold Mine Tour', description: 'Invented.', type: 'activity', cost: 400, destinationId: 'made-up-place' });
  const result = await planTrip({ prompt: '1 day at Cape Coast Castle' }, knowledge, withModel({ title: 'T', summary: '', days: [day] }));
  assert.equal(result.source, 'ai');
  const invented = result.itinerary.days[0].items.find((i) => i.title === 'Secret Gold Mine Tour')!;
  assert.equal(invented.destinationId, undefined);
  assert.equal(result.grounding.activityItems, 2);
  assert.equal(result.grounding.groundedItems, 1);
});

test('an unusable model answer falls back to the catalogue plan', async () => {
  const cases: unknown[] = [
    { title: 'Short', summary: '', days: [goodDay('Cape Coast Castle')] }, // too few days
    { title: 'Elsewhere', summary: '', days: [{ location: 'Atlantis', description: '', items: [meal('08:00', 'Breakfast', 25)] }, goodDay('Cape Coast Castle')] }, // a place outside the catalogue
    { title: 'Empty', summary: '', days: [{ location: 'Cape Coast Castle', description: '', items: [] }, goodDay('Cape Coast Castle')] },
    { title: 'Missing', summary: '', days: [goodDay('Labadi Beach'), goodDay('Labadi Beach')] }, // leaves out what was asked for
    'not json at all',
  ];
  for (const answer of cases) {
    const result = await planTrip({ prompt: '2 days at Cape Coast Castle' }, knowledge, withModel(answer));
    assert.equal(result.source, 'catalogue');
    assert.equal(result.itinerary.days.length, 2);
    assert.ok(result.notes.some((n) => /could not be reached/.test(n)));
  }
});

test('a model outage falls back to the catalogue plan', async () => {
  const failing: PlanOptions = { ...offline, apiKey: 'test-key', fetch: async () => ({ ok: false, status: 503, json: async () => ({}), text: async () => '' }) };
  const result = await planTrip({ prompt: '2 days at Kakum' }, knowledge, failing);
  assert.equal(result.source, 'catalogue');
  assert.equal(result.itinerary.days[0].location, 'Kakum National Park');
});

// A model that answers each call with the next status in the list; 200 carries a good plan
const flaky = (statuses: number[], calls: string[]): PlanOptions => ({
  ...offline,
  apiKey: 'test-key',
  model: 'main-model',
  fallbackModel: 'light-model',
  fetch: async (url) => {
    calls.push(url.includes('main-model') ? 'main' : url.includes('light-model') ? 'light' : url);
    const status = statuses[calls.length - 1] ?? 503;
    const answer = { title: 'Kakum', summary: '', days: [{ location: 'Kakum National Park', description: '', items: [meal('08:00', 'Breakfast', 25)] }] };
    return { ok: status === 200, status, json: async () => ({ candidates: [{ content: { parts: [{ text: JSON.stringify(answer) }] } }] }), text: async () => '' };
  },
});

test('a busy model is tried again before giving up', async () => {
  const calls: string[] = [];
  const result = await planTrip({ prompt: '1 day at Kakum' }, knowledge, flaky([503, 200], calls));
  assert.equal(result.source, 'ai');
  assert.deepEqual(calls, ['main', 'main']);
});

test('a model that stays busy hands over to the lighter model', async () => {
  const calls: string[] = [];
  const result = await planTrip({ prompt: '1 day at Kakum' }, knowledge, flaky([503, 503, 200], calls));
  assert.equal(result.source, 'ai');
  assert.deepEqual(calls, ['main', 'main', 'light']);
});

test('a model the key cannot use goes straight to the lighter model', async () => {
  const calls: string[] = [];
  const result = await planTrip({ prompt: '1 day at Kakum' }, knowledge, flaky([404, 200], calls));
  assert.equal(result.source, 'ai');
  assert.deepEqual(calls, ['main', 'light']);
});

test('when every model is busy the plan comes from the catalogue, and the log says what was tried', async () => {
  const calls: string[] = [];
  const logged: string[] = [];
  const result = await planTrip({ prompt: '1 day at Kakum' }, knowledge, { ...flaky([503, 503, 503], calls), log: (m) => logged.push(m) });
  assert.equal(result.source, 'catalogue');
  assert.deepEqual(calls, ['main', 'main', 'light']);
  assert.match(logged[0], /model responded 503 after main-model: 503, main-model: 503/);
});

test('odd values in a model answer are cleaned up', async () => {
  const day = {
    location: 'cape coast castle',
    description: 'x'.repeat(900),
    items: [
      { time: '9am', title: 'Guided Museum Tour', description: 'ok', type: 'sightseeing', cost: -50, destinationId: castleId },
      { time: '7:05', title: 'Breakfast', description: 'ok', type: 'meal', cost: '25' },
    ],
  };
  const result = await planTrip({ prompt: '1 day at Cape Coast Castle' }, knowledge, withModel({ title: 'T', summary: '', days: [day] }));
  const [tour, breakfast] = result.itinerary.days[0].items;
  assert.equal(result.itinerary.days[0].location, 'Cape Coast Castle');
  assert.equal(result.itinerary.days[0].description.length, 200);
  assert.equal(tour.type, 'activity');
  assert.equal(tour.cost, 0);
  assert.equal(tour.time, '');
  assert.equal(breakfast.time, '07:05');
  assert.equal(breakfast.cost, 25);
});

// ─── The HTTP endpoint ────────────────────────────────────────────────────────

const call = async (options: { method?: string; token?: string; body?: unknown; fetch?: typeof fetch; env?: Record<string, string> }) => {
  const saved = { fetch: globalThis.fetch, env: { ...process.env } };
  process.env.VITE_SUPABASE_URL = 'https://example.supabase.co';
  process.env.VITE_SUPABASE_ANON_KEY = 'anon';
  delete process.env.GEMINI_API_KEY;
  Object.assign(process.env, options.env ?? {});
  if (options.env && options.env.VITE_SUPABASE_URL === '') delete process.env.VITE_SUPABASE_URL;
  globalThis.fetch = options.fetch ?? (() => Promise.reject(new Error('unexpected network call')));
  const res = { statusCode: 0, headers: {} as Record<string, string>, text: '', setHeader(k: string, v: string) { this.headers[k] = v; }, end(b?: string) { this.text = b ?? ''; } };
  try {
    await handler({ method: options.method ?? 'POST', headers: options.token ? { authorization: `Bearer ${options.token}` } : {}, body: options.body ?? {} }, res);
  } finally {
    globalThis.fetch = saved.fetch;
    process.env = saved.env;
  }
  return { status: res.statusCode, headers: res.headers, json: JSON.parse(res.text) };
};

interface QuotaReply { mine_hour: number; mine_day: number; ai_day: number }
const NO_USE: QuotaReply = { mine_hour: 0, mine_day: 0, ai_day: 0 };
// Each stubbed sign-in is a different account, so tests do not share the burst limit
let stubAccounts = 0;

/** Stands in for Supabase: one signed-in user, the seeded catalogue and their planner use so far. */
const supabaseStub = (profileStatus = 'active', calls: string[] = [], quota: QuotaReply | null = NO_USE) =>
  (async (url: string, init?: { body?: string }) => {
    calls.push(url.includes('/planner_runs') || url.includes('/rpc/') ? `${url} ${init?.body}` : url);
    const reply = (data: unknown, ok = true) => ({ ok, status: ok ? 200 : 401, json: async () => data, text: async () => '' });
    if (url.includes('/auth/v1/user')) return reply({ id: `user-${profileStatus}-${++stubAccounts}` });
    if (url.includes('/rest/v1/profiles')) return reply([{ status: profileStatus }]);
    if (url.includes('/rest/v1/regions')) return reply(rows.regions);
    if (url.includes('/rest/v1/destinations')) return reply(rows.destinations);
    if (url.includes('/rest/v1/festivals')) return reply(rows.festivals);
    if (url.includes('/rest/v1/transport_options')) return reply(rows.transport);
    if (url.includes('/rest/v1/planner_runs')) return reply(null);
    if (url.includes('/rest/v1/rpc/planner_quota')) return quota ? reply(quota) : reply({ message: 'function missing' }, false);
    throw new Error(`unexpected call to ${url}`);
  }) as unknown as typeof fetch;

test('the endpoint refuses anything but a signed-in POST', async () => {
  assert.equal((await call({ method: 'GET' })).status, 405);
  assert.equal((await call({})).status, 401);
  const rejected = (async () => ({ ok: false, status: 401, json: async () => ({}), text: async () => '' })) as unknown as typeof fetch;
  assert.equal((await call({ token: 'forged', fetch: rejected })).status, 401);
  assert.equal((await call({ token: 't', env: { VITE_SUPABASE_URL: '' } })).status, 503);
});

test('the endpoint refuses a suspended account', async () => {
  const response = await call({ token: 't', fetch: supabaseStub('suspended'), body: { prompt: '2 days at Kakum' } });
  assert.equal(response.status, 403);
});

test('the endpoint plans a trip from the database for a signed-in traveller', async () => {
  const calls: string[] = [];
  const response = await call({ token: 't', fetch: supabaseStub('active', calls), body: { prompt: '2 days at Kakum for two with GHS 1200' } });
  assert.equal(response.status, 200);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.equal(response.json.source, 'catalogue');
  assert.equal(response.json.itinerary.days.length, 2);
  assert.equal(response.json.itinerary.days[0].location, 'Kakum National Park');
  // The run is recorded for the dashboard, without the traveller's words
  const logged = calls.find((u) => u.includes('/rest/v1/planner_runs'));
  assert.ok(logged, 'the run is recorded');
  const record = JSON.parse(logged.slice(logged.indexOf(' ') + 1));
  assert.deepEqual(Object.keys(record).sort(), ['activity_items', 'days', 'duration_ms', 'from_description', 'grounded_items', 'source']);
  assert.equal(record.source, 'catalogue');
  assert.equal(record.from_description, true);
  assert.equal(record.days, 2);
  // Only published content is read
  for (const table of ['destinations', 'festivals', 'transport_options']) {
    assert.ok(calls.some((u) => u.includes(`/rest/v1/${table}`) && u.includes('status=eq.published')), `${table} is filtered to published rows`);
  }
});

test('the endpoint turns a bad request into a clear message, not a crash', async () => {
  const response = await call({ token: 't', fetch: supabaseStub(), body: { prompt: '30 days everywhere' } });
  assert.equal(response.status, 400);
  assert.match(response.json.error, /1 to 14 days/);
});

test('the endpoint slows down a client that calls it too quickly', async () => {
  const stub = (async (url: string) => {
    const reply = (data: unknown) => ({ ok: true, status: 200, json: async () => data, text: async () => '' });
    if (url.includes('/auth/v1/user')) return reply({ id: 'one-busy-user' });
    if (url.includes('/rest/v1/profiles')) return reply([{ status: 'active' }]);
    return (supabaseStub() as unknown as (u: string) => Promise<unknown>)(url);
  }) as unknown as typeof fetch;
  const statuses: number[] = [];
  for (let i = 0; i < 10; i++) statuses.push((await call({ token: 't', fetch: stub, body: { prompt: '1 day at Labadi Beach' } })).status);
  assert.deepEqual(statuses.slice(0, 8), Array(8).fill(200));
  assert.deepEqual(statuses.slice(8), [429, 429]);
});

// ─── Durable limits and the AI spending cap ───────────────────────────────────

const KAKUM = { prompt: '1 day at Kakum' };

test('an account over its hourly or daily planner limit is told to wait', async () => {
  const hourly = await call({ token: 't', fetch: supabaseStub('active', [], { ...NO_USE, mine_hour: 15 }), body: KAKUM });
  assert.equal(hourly.status, 429);
  assert.match(hourly.json.error, /last hour/);
  const daily = await call({ token: 't', fetch: supabaseStub('active', [], { ...NO_USE, mine_day: 40 }), body: KAKUM });
  assert.equal(daily.status, 429);
  assert.match(daily.json.error, /today's limit of 40/);
  // Limits can be changed per deployment
  const raised = await call({ token: 't', fetch: supabaseStub('active', [], { ...NO_USE, mine_day: 40 }), body: KAKUM, env: { PLANNER_DAILY_LIMIT: '100' } });
  assert.equal(raised.status, 200);
});

test('the site-wide count only credits each account up to its own daily limit', async () => {
  const calls: string[] = [];
  await call({ token: 't', fetch: supabaseStub('active', calls), body: KAKUM, env: { PLANNER_DAILY_LIMIT: '25' } });
  const rpc = calls.find((u) => u.includes('/rpc/planner_quota'));
  assert.ok(rpc, 'the quota is read');
  assert.deepEqual(JSON.parse(rpc.slice(rpc.indexOf(' ') + 1)), { p_per_user_cap: 25 });
});

test('past the daily AI allowance, plans come from the catalogue without calling the model', async () => {
  const model = (calls: string[]) => calls.some((u) => u.includes('generativelanguage.googleapis.com'));
  const underCap: string[] = [];
  await call({ token: 't', fetch: supabaseStub('active', underCap), body: KAKUM, env: { GEMINI_API_KEY: 'key' } });
  assert.ok(model(underCap), 'the model is used while under the cap');

  const overCap: string[] = [];
  const response = await call({ token: 't', fetch: supabaseStub('active', overCap, { ...NO_USE, ai_day: 1000 }), body: KAKUM, env: { GEMINI_API_KEY: 'key' } });
  assert.equal(response.status, 200);
  assert.equal(response.json.source, 'catalogue');
  assert.ok(!model(overCap), 'the model is not called once the cap is reached');
});

test('if the quota cannot be read, the planner still works', async () => {
  const response = await call({ token: 't', fetch: supabaseStub('active', [], null), body: KAKUM });
  assert.equal(response.status, 200);
});

test('links from the database only pass if they are http(s)', () => {
  assert.equal(safeUrl('https://example.com/a?b=1'), 'https://example.com/a?b=1');
  assert.equal(safeUrl(' http://example.com '), 'http://example.com/');
  for (const bad of ['javascript:alert(1)', 'JavaScript:alert(1)', 'data:text/html,<script>1</script>', '/relative', '', null, undefined]) {
    assert.equal(safeUrl(bad), undefined, String(bad));
  }
});

// ─── Profile photos ───────────────────────────────────────────────────────────

test('the database only accepts a profile photo from the owner\'s own folder', async () => {
  const { readFileSync } = await import('node:fs');
  const sql = readFileSync('supabase/update-2026-10-avatars.sql', 'utf8');
  const match = sql.match(/add constraint profiles_avatar_url\s+check \(avatar is null or avatar ~ \('([^']+)' \|\| id::text \|\| '([^']+)'\)\)/);
  assert.ok(match, 'the rule is found in the migration');
  const rule = (id: string) => new RegExp(match[1] + id + match[2]);
  const me = '8b0a6e1c-1f2d-4c3b-9a8e-123456789abc';
  const other = '0f0f0f0f-aaaa-4bbb-8ccc-dddddddddddd';
  const base = 'https://abcd.supabase.co/storage/v1/object/public/avatars';
  // What the app uploads
  assert.ok(rule(me).test(`${base}/${me}/1760000000000-1a2b3c4d.webp`));
  assert.ok(rule(me).test(`${base}/${me}/1760000000000-1a2b3c4d.jpg`));
  // Anything else is refused
  for (const bad of [
    `${base}/${other}/1760000000000-1a2b3c4d.webp`,
    `${base}/${me}/../${other}/1760000000000-1a2b3c4d.webp`,
    `${base}/${me}/1760000000000-1a2b3c4d.svg`,
    `${base}/${me}/photo.webp`,
    `http://abcd.supabase.co/storage/v1/object/public/avatars/${me}/1760000000000-1a2b3c4d.webp`,
    `https://tracker.example/storage/v1/object/public/avatars/${me}/1760000000000-1a2b3c4d.webp?x=1`,
    `https://tracker.example/storage/v1/object/public/avatars/${me}/1760000000000-1a2b3c4d.webp`,
    `https://abcd.supabase.co.tracker.example/storage/v1/object/public/avatars/${me}/1760000000000-1a2b3c4d.webp`,
    `https://abcd-supabase-co/storage/v1/object/public/avatars/${me}/1760000000000-1a2b3c4d.webp`,
    'https://tracker.example/pixel.gif',
    'javascript:alert(1)',
  ]) assert.equal(rule(me).test(bad), false, bad);
});
