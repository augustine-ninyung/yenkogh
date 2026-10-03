import type { PlannerInput, Itinerary, ItineraryDay, ItineraryItem } from '@/types';

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function buildMockItinerary(input: PlannerInput): Itinerary {
  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  const numDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
  );

  const destinationNames =
    input.destinations.length > 0 ? input.destinations : ['Accra', 'Cape Coast'];

  const days: ItineraryDay[] = [];

  for (let i = 0; i < numDays; i++) {
    const destIndex = Math.floor((i * destinationNames.length) / numDays);
    const location = destinationNames[destIndex] ?? destinationNames[0];
    const date = new Date(start);
    date.setDate(date.getDate() + i);

    const items: ItineraryItem[] = [];

    if (i === 0) {
      // First day — arrival
      const accommodationCost =
        input.accommodationType === 'luxury'
          ? 800
          : input.accommodationType === 'mid-range'
            ? 350
            : 150;

      items.push(
        {
          id: `item-${i}-1`,
          time: '08:00',
          title: 'Arrival & Check-in',
          description: `Arrive in ${location} and check in to your accommodation. Get oriented in the neighbourhood.`,
          type: 'accommodation',
          cost: accommodationCost,
        },
        {
          id: `item-${i}-2`,
          time: '10:00',
          title: 'Local Breakfast',
          description:
            'Enjoy a traditional Ghanaian breakfast — waakye, koko, or fresh fruit at a local chop bar.',
          type: 'meal',
          cost: 25,
        },
        {
          id: `item-${i}-3`,
          time: '12:00',
          title: `Explore ${location}`,
          description: `Take a walking tour of ${location}. Visit key landmarks and soak in the local atmosphere.`,
          type: 'activity',
          cost: 80,
          location,
        },
        {
          id: `item-${i}-4`,
          time: '14:00',
          title: 'Lunch at a Local Restaurant',
          description:
            'Try jollof rice, fufu with soup, or grilled tilapia at a recommended local restaurant.',
          type: 'meal',
          cost: 60,
        },
        {
          id: `item-${i}-5`,
          time: '16:00',
          title: 'Cultural Experience',
          description: `Visit a local market or cultural site in ${location}. Interact with artisans and vendors.`,
          type: 'activity',
          cost: 50,
          location,
        },
        {
          id: `item-${i}-6`,
          time: '19:00',
          title: 'Dinner & Evening',
          description:
            'Enjoy dinner at a restaurant featuring Ghanaian cuisine. Experience the vibrant evening atmosphere.',
          type: 'meal',
          cost: 80,
        },
      );
    } else if (i === numDays - 1) {
      // Last day — departure
      items.push(
        {
          id: `item-${i}-1`,
          time: '07:00',
          title: 'Early Morning Activity',
          description: `Final morning in ${location}. Visit any remaining attractions or enjoy a peaceful morning walk.`,
          type: 'activity',
          cost: 30,
          location,
        },
        {
          id: `item-${i}-2`,
          time: '09:00',
          title: 'Breakfast',
          description: 'Final Ghanaian breakfast before departure.',
          type: 'meal',
          cost: 25,
        },
        {
          id: `item-${i}-3`,
          time: '11:00',
          title: 'Shopping for Souvenirs',
          description:
            'Buy Kente cloth, wood carvings, beads, and other Ghanaian handicrafts as souvenirs.',
          type: 'activity',
          cost: 150,
        },
        {
          id: `item-${i}-4`,
          time: '14:00',
          title: 'Farewell Lunch',
          description: 'A final meal of your favourite Ghanaian dishes before departure.',
          type: 'meal',
          cost: 70,
        },
        {
          id: `item-${i}-5`,
          time: '16:00',
          title: 'Transfer & Departure',
          description:
            'Transfer to airport or departure point. Safe travels — Akwaaba, come back soon!',
          type: 'transport',
          cost: 80,
        },
      );
    } else {
      // Middle days
      const prevDestIndex = Math.floor(((i - 1) * destinationNames.length) / numDays);
      const prevLocation = destinationNames[prevDestIndex] ?? destinationNames[0];
      const isNewLocation = location !== prevLocation;

      if (isNewLocation) {
        items.push({
          id: `item-${i}-1`,
          time: '07:00',
          title: `Travel to ${location}`,
          description: `Depart early from ${prevLocation} and travel to ${location} by road or other transport.`,
          type: 'transport',
          cost: 80,
        });
      } else {
        items.push({
          id: `item-${i}-1`,
          time: '07:00',
          title: 'Morning Activity',
          description: `Start the day with an early activity in ${location} — ideal for wildlife spotting or beat the heat.`,
          type: 'activity',
          cost: 60,
          location,
        });
      }

      items.push(
        {
          id: `item-${i}-2`,
          time: '09:00',
          title: 'Breakfast',
          description: "Energising breakfast before the day's activities.",
          type: 'meal',
          cost: 30,
        },
        {
          id: `item-${i}-3`,
          time: '10:00',
          title: `Main Attraction in ${location}`,
          description: `Visit the main attraction of ${location}. This is the highlight of today's itinerary.`,
          type: 'activity',
          cost: 100,
          location,
        },
        {
          id: `item-${i}-4`,
          time: '13:00',
          title: 'Lunch',
          description:
            'Lunch at a local restaurant or resort — try regional Ghanaian specialties.',
          type: 'meal',
          cost: 60,
        },
        {
          id: `item-${i}-5`,
          time: '15:00',
          title: 'Afternoon Exploration',
          description: `Explore more of ${location} — visit secondary attractions, markets, or relax at your accommodation.`,
          type: 'activity',
          cost: 50,
          location,
        },
        {
          id: `item-${i}-6`,
          time: '18:00',
          title: 'Sunset & Dinner',
          description: 'Watch the beautiful Ghanaian sunset and enjoy dinner.',
          type: 'meal',
          cost: 80,
        },
      );
    }

    days.push({
      day: i + 1,
      date: date.toISOString().split('T')[0],
      location,
      description: `Day ${i + 1} in ${location}`,
      items,
    });
  }

  const totalCost =
    days.reduce((acc, day) => acc + day.items.reduce((a, item) => a + (item.cost ?? 0), 0), 0) *
    input.numberOfTravelers;

  return {
    id: `itinerary-${Date.now()}`,
    title: `${numDays}-Day Ghana Adventure: ${destinationNames.join(' · ')}`,
    days,
    totalEstimatedCost: totalCost,
    generatedAt: new Date().toISOString(),
  };
}

export const aiPlannerService = {
  async generateItinerary(input: PlannerInput): Promise<Itinerary> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

    if (!apiKey) {
      // No API key — simulate AI thinking time then return mock data
      await delay(2500);
      return buildMockItinerary(input);
    }

    try {
      const { GoogleGenAI } = await import('@google/genai');
      const client = new GoogleGenAI({ apiKey });

      const prompt = `You are a Ghana travel expert. Create a detailed day-by-day travel itinerary in JSON format.

Trip Details:
- Destinations: ${input.destinations.join(', ')}
- Start Date: ${input.startDate}
- End Date: ${input.endDate}
- Travelers: ${input.numberOfTravelers}
- Budget: GHS ${input.budget}
- Interests: ${input.interests.join(', ')}
- Accommodation: ${input.accommodationType}
- Special Requests: ${input.specialRequests ?? 'None'}

Return ONLY valid JSON matching this TypeScript interface:
interface Itinerary {
  id: string;
  title: string;
  days: Array<{
    day: number;
    date: string;
    location: string;
    description: string;
    items: Array<{
      id: string;
      time: string;
      title: string;
      description: string;
      type: 'activity' | 'transport' | 'accommodation' | 'meal' | 'free-time';
      cost: number;
      location?: string;
    }>;
  }>;
  totalEstimatedCost: number;
  generatedAt: string;
}

Use real Ghana destinations, activities, food (waakye, jollof rice, fufu, kelewele), and transport. All costs in GHS.`;

      const interaction = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
      });

      const text = interaction.text ?? '';
      // Strip possible markdown fences before parsing
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as Itinerary;
      }
    } catch (err) {
      console.warn('Gemini API call failed, using mock itinerary:', err);
    }

    // Fallback to mock if Gemini response couldn't be parsed
    await delay(1000);
    return buildMockItinerary(input);
  },
};
