import type { Transportation } from '@/types';

export const transportation: Transportation[] = [
  {
    id: 'stc-bus',
    type: 'bus',
    name: 'STC Bus (State Transport Corporation)',
    description:
      'The State Transport Corporation (STC) operates the most comfortable and reliable intercity bus service in Ghana. With air-conditioned coaches connecting major cities, STC is the preferred option for comfortable long-distance travel. Buses depart from designated STC terminals in major cities and reservations can be made in advance.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/ISTC_TRANSPORT_YARD_by_Blaise_Daniel_Korley_Ahumah.jpg?width=800',
    providers: ['State Transport Corporation (STC)'],
    routes: [
      { from: 'Accra', to: 'Kumasi', estimatedDuration: '4.5 hours', estimatedCost: { min: 80, max: 120 }, frequency: 'Multiple daily departures', notes: 'Departs from Accra STC Terminal, Tudu' },
      { from: 'Accra', to: 'Cape Coast', estimatedDuration: '3 hours', estimatedCost: { min: 45, max: 65 }, frequency: 'Several daily departures' },
      { from: 'Accra', to: 'Tamale', estimatedDuration: '9 hours', estimatedCost: { min: 120, max: 160 }, frequency: 'Daily overnight bus' },
      { from: 'Accra', to: 'Takoradi', estimatedDuration: '4 hours', estimatedCost: { min: 60, max: 90 }, frequency: 'Daily' },
      { from: 'Kumasi', to: 'Tamale', estimatedDuration: '6 hours', estimatedCost: { min: 90, max: 130 }, frequency: 'Daily' },
    ],
    safetyTips: [
      'Book tickets in advance, especially during holidays and weekends',
      'Arrive at the terminal at least 30 minutes early',
      'Keep your ticket and luggage receipt safe',
      'Do not leave valuables unattended on the bus',
      'Use only official STC terminals and ticketing counters',
    ],
    pros: ['Air-conditioned coaches', 'Fixed departures and arrival times', 'Advance booking available', 'Luggage storage', 'Reliable and reputable'],
    cons: ['More expensive than trotros', 'Limited to routes between major cities', 'Fixed schedules can be inflexible'],
    bookingInfo: 'Purchase tickets at STC terminals or call the STC booking line. Advance booking recommended for weekends and public holidays.',
  },
  {
    id: 'vip-bus',
    type: 'bus',
    name: 'VIP Jeoun Bus',
    description:
      'VIP Jeoun is a popular private intercity bus company offering comfortable, air-conditioned coaches between major Ghanaian cities at competitive prices. VIP buses often offer more frequent departures than STC and are a favourite among students, business travelers, and tourists. The "Executive Class" seats offer extra legroom and individual entertainment screens.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/VIP_bus_at_station.jpg?width=800',
    providers: ['VIP Jeoun'],
    routes: [
      { from: 'Accra', to: 'Kumasi', estimatedDuration: '4.5 hours', estimatedCost: { min: 70, max: 110 }, frequency: 'Every 30 minutes, 5am–10pm' },
      { from: 'Accra', to: 'Cape Coast', estimatedDuration: '3 hours', estimatedCost: { min: 40, max: 60 }, frequency: 'Frequent' },
      { from: 'Accra', to: 'Ho', estimatedDuration: '3.5 hours', estimatedCost: { min: 55, max: 75 }, frequency: 'Daily' },
      { from: 'Accra', to: 'Sunyani', estimatedDuration: '6 hours', estimatedCost: { min: 80, max: 110 }, frequency: 'Daily' },
    ],
    safetyTips: [
      'Arrive early — popular routes fill up fast',
      'Keep your belongings with you or under your seat',
      'Confirm departure times at the terminal',
    ],
    pros: ['Frequent departures', 'Affordable', 'Air-conditioned', 'Wide network', 'Executive class available'],
    cons: ['Can be crowded during peak times', 'Less punctual than STC on some routes'],
    bookingInfo: 'Purchase tickets at VIP terminals across major cities. No advance online booking — first come, first served.',
  },
  {
    id: 'metro-mass-transit',
    type: 'bus',
    name: 'Metro Mass Transit (MMT)',
    description:
      'Metro Mass Transit is the part state-owned bus company set up in 2003 to give Ghanaians affordable public transport. Its orange buses run city routes, links to rural towns that other operators do not serve, and long-distance services between the regional capitals. The buses are plainer than the STC and VIP coaches and make more stops, but fares are usually among the lowest on a route.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Metro_Mass_Transit_bus%2C_Atimpoku_(P1090966).jpg?width=800',
    providers: ['Metro Mass Transit Company Limited'],
    routes: [
      { from: 'Kumasi', to: 'Tamale', estimatedDuration: '6–7 hours', estimatedCost: { min: 115, max: 115 }, frequency: 'Daily', notes: 'Fare published by MMT for 2026' },
      { from: 'Accra', to: 'Koforidua', estimatedDuration: '2 hours', estimatedCost: { min: 20, max: 40 }, frequency: 'Daily', notes: 'Range reported across bus operators on this route in 2026' },
      { from: 'Accra', to: 'Tamale', estimatedDuration: '10–12 hours', estimatedCost: { min: 180, max: 250 }, frequency: 'Daily', notes: 'Range reported across bus operators on this route in 2026' },
      { from: 'Accra', to: 'Bolgatanga', estimatedDuration: '13–15 hours', estimatedCost: { min: 200, max: 280 }, frequency: 'Daily', notes: 'Range reported across bus operators on this route in 2026' },
    ],
    safetyTips: [
      'Buy tickets only at MMT terminals or from the conductor on board',
      'Arrive early: seats on long-distance buses are not always reserved',
      'Keep valuables with you, not in the luggage hold',
      'Carry water and snacks on long journeys; stops are limited',
    ],
    pros: ['Among the cheapest fares between cities', 'Reaches rural towns other operators skip', 'Large buses with luggage space', 'Part state-owned and nationwide'],
    cons: ['Slower, with more stops than STC or VIP', 'Fewer comforts; not all buses are air-conditioned', 'Can be crowded', 'Timetables are less predictable'],
    bookingInfo: 'Tickets are sold at Metro Mass Transit terminals in the regional capitals, usually on the day of travel. Ask at the terminal for the day\'s departures.',
  },
  {
    id: 'trotro',
    type: 'trotro',
    name: 'Trotro (Shared Minibus)',
    description:
      'The trotro is the backbone of Ghana\'s transport system — a shared minibus that operates on fixed urban and inter-urban routes. Inexpensive, ubiquitous, and deeply embedded in Ghanaian daily life, trotros serve almost every neighbourhood and town. They depart when full rather than on fixed schedules. Learning to use the trotro system is a rewarding way to experience authentic Ghanaian life and travel on a budget.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Trotro_boarding.jpg?width=800',
    routes: [
      { from: 'Accra (Kaneshie)', to: 'Cape Coast', estimatedDuration: '3.5 hours', estimatedCost: { min: 20, max: 35 }, frequency: 'Departs when full, throughout the day', notes: 'Cheaper but less comfortable than STC/VIP' },
      { from: 'Accra (Kejetia)', to: 'Kumasi (Kejetia)', estimatedDuration: '5 hours', estimatedCost: { min: 30, max: 50 }, frequency: 'Throughout the day' },
      { from: 'Accra City Centre', to: 'Accra Suburbs', estimatedDuration: '20–60 mins', estimatedCost: { min: 3, max: 15 }, frequency: 'Very frequent' },
      { from: 'Kumasi', to: 'Tamale', estimatedDuration: '7 hours', estimatedCost: { min: 60, max: 90 }, frequency: 'Daily' },
    ],
    safetyTips: [
      'Confirm the destination with the "mate" (conductor) before boarding',
      'Keep bags on your lap or in your sight',
      'Avoid trotros packed far beyond capacity — this is unsafe',
      'Use your phone or a map to track your route',
      'Carry small change — exact fare is appreciated',
    ],
    pros: ['Cheapest option for most journeys', 'Goes almost everywhere', 'Authentic local experience', 'No booking required'],
    cons: ['No fixed schedules (departs when full)', 'Can be overcrowded and hot', 'Not suitable for long distances with heavy luggage', 'Routes can be confusing for first-time visitors'],
  },
  {
    id: 'taxi',
    type: 'taxi',
    name: 'Metered & Shared Taxi',
    description:
      'Taxis are widely available in all Ghanaian cities and towns. They operate in two modes: chartered (private hire, you pay for the whole car) and shared (multiple passengers traveling in the same direction split the fare). Chartered taxis are ideal for direct, comfortable transport. Shared taxis are inexpensive for short urban trips. Fares should always be negotiated in advance — always agree on the price before entering a chartered taxi.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Taxi_%C3%A0_Accra.JPG?width=800',
    routes: [
      { from: 'Accra Airport', to: 'Accra City Centre', estimatedDuration: '20–45 mins', estimatedCost: { min: 60, max: 120 }, notes: 'Negotiate fare at official taxi rank outside arrivals' },
      { from: 'Accra', to: 'Cape Coast', estimatedDuration: '2.5 hours', estimatedCost: { min: 250, max: 450 }, notes: 'Chartered. Split with other travelers to reduce cost.' },
      { from: 'Within Accra', to: 'Any destination', estimatedDuration: 'Varies', estimatedCost: { min: 20, max: 150 }, notes: 'Negotiate before entering. Shared taxi: ₵3-15' },
    ],
    safetyTips: [
      'Always agree on the fare BEFORE getting in',
      'Use only clearly marked taxis with visible plates',
      'Prefer ride-hailing apps for greater safety and price transparency',
      'Avoid entering taxis already occupied by strangers at night',
      'Share taxis only in daylight with other passengers at official stops',
    ],
    pros: ['Door-to-door convenience', 'Available everywhere', 'Shared taxis are very affordable', 'No schedule required'],
    cons: ['Fare negotiation can be stressful for visitors', 'Chartered taxis can be expensive', 'Quality varies widely'],
  },
  {
    id: 'ride-hailing',
    type: 'ride-hailing',
    name: 'Uber, Bolt & Yango',
    description:
      'Uber and Bolt operate in Accra and other major Ghanaian cities including Kumasi, Takoradi, and Tamale, and Yango operates in Accra and Kumasi. Ride-hailing apps offer the convenience of transparent pricing, cashless payment, driver tracking, and safety features — making them the preferred option for tourists visiting Ghana for the first time. Prices are generally reasonable by international standards.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Traffic_Accra.jpg?width=800',
    providers: ['Uber', 'Bolt', 'Yango'],
    routes: [
      { from: 'Accra Airport', to: 'Accra City Centre', estimatedDuration: '20–45 mins', estimatedCost: { min: 50, max: 100 }, notes: 'Much cheaper and safer than airport taxis' },
      { from: 'Within Accra', to: 'Any Accra destination', estimatedDuration: 'Varies', estimatedCost: { min: 25, max: 80 }, notes: 'Compare the apps before booking; Bolt and Yango are often cheaper than Uber' },
      { from: 'Within Kumasi', to: 'Any Kumasi destination', estimatedDuration: 'Varies', estimatedCost: { min: 20, max: 60 } },
    ],
    safetyTips: [
      'Confirm the driver\'s name and car plate before entering',
      'Share your ride details with someone you trust',
      'Sit in the back seat',
      'Keep the app open to track your route',
      'Prefer cashless payment where possible',
    ],
    pros: ['Transparent pricing', 'Cashless payment', 'Driver tracking', 'Rated drivers', 'Easy to book via app', 'Air-conditioned vehicles'],
    cons: ['Surge pricing during peak hours or events', 'Not available in smaller towns', 'Requires internet connection'],
    bookingInfo: 'Download the Uber, Bolt or Yango app. Create an account and add a payment method. Available 24/7 in Accra.',
  },
  {
    id: 'domestic-flight',
    type: 'domestic-flight',
    name: 'Domestic Flights',
    description:
      'Domestic flights connect Accra (Kotoka International Airport) with Kumasi and Tamale, offering a fast alternative to the long road journeys to northern Ghana. Africa World Airlines (AWA) and PassionAir operate the main domestic routes. Flights to Tamale save approximately 8–10 hours compared to road travel and are ideal for travelers with limited time who want to visit Mole National Park.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kotoka_International_Airport_Apron_1.JPG?width=800',
    providers: ['Africa World Airlines (AWA)', 'PassionAir'],
    routes: [
      { from: 'Accra (KIA)', to: 'Kumasi (KMS)', estimatedDuration: '40 mins', estimatedCost: { min: 350, max: 600 }, frequency: 'Multiple daily flights', notes: 'Book in advance for best prices' },
      { from: 'Accra (KIA)', to: 'Tamale (TML)', estimatedDuration: '1 hour', estimatedCost: { min: 400, max: 800 }, frequency: 'Daily', notes: 'Essential for Mole National Park visits' },
    ],
    safetyTips: [
      'Book directly with airlines or authorised agents',
      'Arrive at the airport at least 1.5 hours before departure',
      'Carry your boarding pass (print or digital) and valid ID',
      'Check baggage allowance in advance',
    ],
    pros: ['Dramatically saves travel time to northern Ghana', 'Comfortable and reliable', 'Avoids long road journeys'],
    cons: ['Most expensive option', 'Limited destinations', 'Baggage restrictions apply'],
    bookingInfo: 'Book on Africa World Airlines (awagha.com) or PassionAir website. Also available on flight comparison apps.',
  },
  {
    id: 'boat-ferry',
    type: 'boat',
    name: 'Lake Volta Ferry',
    description:
      'The Volta River Transport Company (VRTC) operates a passenger ferry service on Lake Volta between Akosombo and Yeji — one of the most unique and memorable journeys in Ghana. The multi-day ferry voyage takes passengers through the heart of the lake, stopping at small villages along the way. It is an adventurous, scenic, and deeply authentic Ghanaian experience. Shorter boat trips are also available at Ada Foah and other coastal/lake destinations.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Captured(February_6%2C2023)%3BFerry_with_Cars_and_passengers_crossing_Volta_River_in_Ghana-West_Africa.jpg?width=800',
    providers: ['Volta River Transport Company (VRTC)'],
    routes: [
      { from: 'Akosombo', to: 'Yeji', estimatedDuration: '18–22 hours', estimatedCost: { min: 80, max: 250 }, frequency: 'Weekly departures', notes: 'Cabin and deck class available. Bring food and water.' },
      { from: 'Ada Foah', to: 'Volta River', estimatedDuration: '2–4 hours', estimatedCost: { min: 100, max: 200 }, notes: 'Tourist river cruise — book through Ada Foah resorts' },
    ],
    safetyTips: [
      'Always wear a life jacket provided on board',
      'Bring your own food, water, and sunscreen for the Volta ferry',
      'Check weather conditions before boat trips',
      'Do not swim in Lake Volta — risk of bilharzia and crocodiles',
      'Book the ferry cabin class for comfort on the overnight journey',
    ],
    pros: ['Unique and unforgettable experience', 'Scenic journey through the lake', 'Affordable'],
    cons: ['Very slow — not practical for tight schedules', 'Basic facilities on the ferry', 'Irregular schedule'],
    bookingInfo: 'Purchase ferry tickets at the Akosombo boat dock. Contact VRTC for current schedules.',
  },
  {
    id: 'shared-intercity-taxi',
    type: 'shared-taxi',
    name: 'Long-Distance Shared Taxi',
    description:
      'Long-distance shared taxis (often Toyota Camrys or similar saloon cars) operate between towns and cities, departing from specific lorry parks (bus stations) when the car is full. They are faster than trotros and less expensive than chartered taxis, offering a middle-ground option for intercity travel. Passengers pay per seat and can often negotiate the price for the entire car.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Road_from_Accra_to_Nkawkaw_in_the_Eastern_Region_of_Ghana.jpg?width=800',
    routes: [
      { from: 'Accra', to: 'Cape Coast', estimatedDuration: '2.5–3 hours', estimatedCost: { min: 35, max: 60 }, frequency: 'Departs when full, throughout the day' },
      { from: 'Cape Coast', to: 'Elmina', estimatedDuration: '20 mins', estimatedCost: { min: 8, max: 15 }, frequency: 'Very frequent' },
      { from: 'Kumasi', to: 'Cape Coast', estimatedDuration: '4 hours', estimatedCost: { min: 60, max: 90 }, frequency: 'Throughout the day' },
    ],
    safetyTips: [
      'Confirm the destination and fare before entering',
      'Be cautious about overloading — 4 passengers max in a saloon car',
      'Keep your luggage in the boot and take the key receipt',
      'Departs from lorry parks — learn the relevant park for your route',
    ],
    pros: ['Faster than trotro on intercity routes', 'More comfortable than trotro', 'Lower cost than chartered taxi or STC/VIP for some routes'],
    cons: ['Departs when full — can mean waiting', 'Driver quality varies', 'Less comfortable than VIP/STC buses for very long journeys'],
  },
  {
    id: 'okada-motorcycle',
    type: 'taxi',
    name: 'Okada (Motorcycle Taxi)',
    description:
      'Okada motorcycle taxis are widely used in smaller towns, rural areas, and northern Ghana for short distances where other transport options are limited. They are fast for navigating traffic and narrow roads, and very inexpensive. However, they carry significant safety risks and visitors should exercise caution. Note: Okada operations in Accra are restricted.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Moto_taxi_Okada_%C3%A0_Madina_(Accra).jpg?width=800',
    routes: [
      { from: 'Tamale Centre', to: 'Tamale Suburbs', estimatedDuration: '10–20 mins', estimatedCost: { min: 5, max: 20 }, notes: 'Very common in northern towns' },
      { from: 'Bolgatanga', to: 'Paga', estimatedDuration: '45 mins', estimatedCost: { min: 30, max: 50 }, notes: 'Option when other transport is unavailable' },
    ],
    safetyTips: [
      'Always insist on wearing a helmet — carry your own if possible',
      'Avoid Okadas at night',
      'Do not use for long distances or on major highways',
      'Agree on fare before setting off',
      'Hold on firmly and keep bags off the ground',
    ],
    pros: ['Very fast in traffic', 'Reaches remote areas', 'Very cheap', 'Available almost everywhere in smaller towns'],
    cons: ['High safety risk', 'No helmet often provided', 'Banned in Accra and some other cities', 'Not suitable for luggage or long distances'],
  },
];

export const getTransportationById = (id: string): Transportation | undefined =>
  transportation.find((t) => t.id === id);

export const getTransportationByType = (type: string): Transportation[] =>
  transportation.filter((t) => t.type === type);

export const searchTransportRoutes = (from: string, to: string): Transportation[] => {
  const f = from.toLowerCase();
  const t = to.toLowerCase();
  return transportation.filter((transport) =>
    transport.routes.some(
      (r) =>
        (r.from.toLowerCase().includes(f) && r.to.toLowerCase().includes(t)) ||
        (r.from.toLowerCase().includes(t) && r.to.toLowerCase().includes(f)),
    ),
  );
};
