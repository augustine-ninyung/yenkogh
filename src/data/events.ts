import type { Event } from '@/types';

const NOW = new Date('2026-10-03');

export const events: Event[] = [
  {
    id: 'homowo-festival-2026',
    name: 'Homowo Festival',
    slug: 'homowo-festival-2026',
    category: 'traditional',
    description:
      'Homowo, meaning "to hoot at hunger" in the Ga language, is one of Ghana\'s most beloved annual harvest festivals celebrated by the Ga people of Greater Accra. The festival commemorates a historic famine that the Ga people survived, and celebrates the subsequent abundant harvest. Families gather for communal feasts of palm nut soup and kpokpoi (a traditional dish), libations are poured to ancestors, and traditional drumming and dance fill the streets. The festival strengthens family bonds and cultural identity.',
    shortDescription:
      'The Ga people\'s vibrant "hooting at hunger" harvest festival — a joyful celebration of abundance, family, and ancestral memory.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Accra_Homowo_um1900_300dpi.jpg?width=1200',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    location: 'Accra',
    region: 'Greater Accra',
    regionCode: 'GA',
    venue: 'Various locations across Accra',
    isFree: true,
    activities: [
      'Traditional drumming and dance performances',
      'Communal feasts of kpokpoi and palm nut soup',
      'Libation ceremonies for ancestors',
      'Processions through Ga communities',
      'Cultural exhibitions',
    ],
    transportInfo: 'Easily accessible from anywhere in Accra via trotro or taxi.',
    relatedDestinations: ['kwame-nkrumah-memorial-park', 'labadi-beach'],
    featured: true,
    tags: ['Ga', 'harvest', 'traditional', 'food', 'culture', 'Accra', 'family'],
  },
  {
    id: 'chale-wote-2026',
    name: 'Chale Wote Street Art Festival',
    slug: 'chale-wote-2026',
    category: 'art',
    description:
      'Chale Wote ("friend, let\'s go" in Ga) is Accra\'s most vibrant annual street art festival, transforming the historic James Town neighbourhood into an open-air gallery. The festival features murals, installations, live music, spoken word, performance art, fashion, and film screenings by African artists. It celebrates the creativity, diversity, and resilience of African urban culture and draws visitors from across the continent and the world.',
    shortDescription:
      'Accra\'s electrifying annual street art festival — transforming James Town into a canvas of colour, music, performance, and Pan-African creativity.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Chale_Wote_Street_Art_Festival_10.jpg?width=1200',
    startDate: '2026-08-21',
    endDate: '2026-08-23',
    location: 'James Town, Accra',
    region: 'Greater Accra',
    regionCode: 'GA',
    venue: 'James Town, Accra (outdoor streets and spaces)',
    isFree: true,
    activities: [
      'Live mural painting by African artists',
      'Music and DJ performances',
      'Spoken word and poetry slams',
      'Afrobeats and highlife concerts',
      'Fashion showcases',
      'Film screenings',
      'Food and craft markets',
    ],
    transportInfo: 'James Town is in central Accra. Accessible via trotro or taxi.',
    relatedDestinations: ['kwame-nkrumah-memorial-park', 'labadi-beach'],
    featured: true,
    tags: ['art', 'street art', 'music', 'culture', 'festival', 'Accra', 'James Town'],
    website: 'https://challewote.com',
  },
  {
    id: 'panafest-2026',
    name: 'PANAFEST',
    slug: 'panafest-2026',
    category: 'cultural',
    description:
      'PANAFEST (Pan African Historical Theatre Festival) is a biennial festival held at Cape Coast and Elmina that celebrates Pan-African culture, history, and the diaspora. The festival includes theatre performances, seminars, music, durbars, and visits to the historic slave castles — creating a powerful space for reflection on African identity, the transatlantic slave trade, and African unity. It draws African diaspora communities from the Americas, Caribbean, and Europe to reconnect with their ancestral homeland.',
    shortDescription:
      'A powerful biennial Pan-African festival blending theatre, music, heritage visits, and deep reflection on African history and identity.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle_Courtyard_02_Sept_2012.jpg?width=1200',
    startDate: '2026-07-25',
    endDate: '2026-08-01',
    location: 'Cape Coast & Elmina',
    region: 'Central',
    regionCode: 'CP',
    venue: 'Cape Coast Castle, Elmina Castle, and surrounding venues',
    isFree: false,
    ticketPrice: 200,
    activities: [
      'Theatre performances and dramatic re-enactments',
      'Academic seminars on Pan-Africanism',
      'Music concerts featuring African artists',
      'Royal durbars and cultural processions',
      'Guided heritage tours of the slave castles',
      'Diaspora homecoming ceremonies',
    ],
    transportInfo: 'Cape Coast is 3 hours from Accra by STC bus (₵30-50) or by shared taxi.',
    relatedDestinations: ['cape-coast-castle', 'elmina-castle', 'kakum-national-park'],
    featured: true,
    tags: ['Pan-African', 'heritage', 'theatre', 'culture', 'diaspora', 'Cape Coast', 'history'],
  },
  {
    id: 'hogbetsotso-2026',
    name: 'Hogbetsotso Festival',
    slug: 'hogbetsotso-2026',
    category: 'traditional',
    description:
      'Hogbetsotso is the annual festival of the Anlo Ewe people of the Volta Region, celebrating their migration from Notsie (in present-day Togo) to their current homeland centuries ago. The festival features spectacular durbar processions with chiefs in palanquins, colourful traditional attire, energetic traditional dance (Agbadza), drumming, libation ceremonies, and the firing of muskets. It is one of Ghana\'s most visually spectacular traditional festivals.',
    shortDescription:
      'The spectacular Anlo Ewe migration festival — witness breathtaking durbars, traditional Agbadza dance, and centuries of living culture.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Hogb1.jpg?width=1200',
    startDate: '2026-11-07',
    endDate: '2026-11-08',
    location: 'Anloga, Volta Region',
    region: 'Volta',
    regionCode: 'VR',
    venue: 'Anloga, Keta District',
    isFree: true,
    activities: [
      'Grand durbar of chiefs and queen mothers',
      'Traditional Agbadza dance performances',
      'Musket firing ceremonies',
      'Cultural processions in traditional attire',
      'Communal feasts and celebrations',
    ],
    transportInfo: 'From Accra, take a bus to Aflao (about 3 hours), then trotro towards Anloga.',
    relatedDestinations: ['wli-waterfalls', 'lake-volta'],
    featured: false,
    tags: ['Ewe', 'traditional', 'festival', 'Volta', 'dance', 'cultural', 'durbar'],
  },
  {
    id: 'aboakyir-2026',
    name: 'Aboakyir Festival',
    slug: 'aboakyir-2026',
    category: 'traditional',
    description:
      'Aboakyir — the deer hunting festival of the Efutu people of Winneba in the Central Region — is one of Ghana\'s oldest and most thrilling traditional festivals. Two rival Asafo companies (warrior groups) compete to be first to capture a live deer with their bare hands and present it to the chief. The successful group earns great honour and bragging rights for the entire year. The festival is accompanied by colourful processions, traditional music, and elaborate ceremonies.',
    shortDescription:
      'One of Ghana\'s oldest festivals — two warrior companies race to capture a live deer bare-handed in this thrilling Central Region tradition.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fisherboats_in_Winneba%2C_Ghana-2.jpg?width=1200',
    startDate: '2026-05-02',
    endDate: '2026-05-03',
    location: 'Winneba, Central Region',
    region: 'Central',
    regionCode: 'CP',
    venue: 'Winneba town',
    isFree: true,
    activities: [
      'Live deer hunting competition between Asafo companies',
      'Traditional processions with chiefs',
      'Drumming and singing',
      'Cultural displays',
      'Visit the nearby Potsin area',
    ],
    transportInfo: 'Winneba is about 65 km west of Accra. Take a trotro from Kasoa (₵15-25) or a bus from Accra.',
    relatedDestinations: ['cape-coast-castle', 'kakum-national-park'],
    featured: false,
    tags: ['traditional', 'hunting', 'Efutu', 'Central', 'competition', 'culture', 'Winneba'],
  },
  {
    id: 'ghana-jollof-festival-2026',
    name: 'Ghana Jollof Festival',
    slug: 'ghana-jollof-festival-2026',
    category: 'food',
    description:
      'The Ghana Jollof Festival is a colourful food and culture festival celebrating Ghana\'s rich culinary heritage and settling, once and for all, the friendly West African debate about whose jollof rice reigns supreme. Beyond jollof rice, the festival showcases traditional Ghanaian dishes, street food, international cuisine, live cooking demonstrations, music, and cultural entertainment. A joyful celebration of food and community.',
    shortDescription:
      'A delicious celebration of Ghana\'s rich food culture — taste jollof rice showdowns, traditional dishes, street food, and live cooking demos.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ghana_Jollof_Rice.JPG?width=1200',
    startDate: '2026-10-16',
    endDate: '2026-10-18',
    location: 'Accra',
    region: 'Greater Accra',
    regionCode: 'GA',
    venue: 'Accra Sports Stadium grounds',
    isFree: false,
    ticketPrice: 80,
    activities: [
      'Jollof rice cooking competition',
      'Traditional food tastings',
      'Chef demonstrations and workshops',
      'Music and entertainment',
      'Children\'s food activities',
    ],
    transportInfo: 'Accra Sports Stadium is in the Accra centre. Take any trotro or taxi towards the stadium.',
    relatedDestinations: ['kwame-nkrumah-memorial-park', 'labadi-beach'],
    featured: true,
    tags: ['food', 'jollof', 'Ghanaian cuisine', 'culture', 'cooking', 'festival', 'Accra'],
  },
  {
    id: 'damba-festival-2026',
    name: 'Damba Festival',
    slug: 'damba-festival-2026',
    category: 'religious',
    description:
      'Damba is an Islamic festival celebrated by several northern Ghanaian peoples — including the Dagomba, Gonjas, and Mamprusis — to commemorate the birth and naming of the Prophet Muhammad (Mawlid). The festival features magnificent horse parades (the Damba Festival is famous for its horse-riding displays), drumming, dancing, the chiefs giving speeches from horseback, and communal celebrations. It is a beautiful blend of Islamic faith and traditional northern Ghanaian culture.',
    shortDescription:
      'A magnificent blend of Islamic faith and northern Ghanaian tradition — spectacular horse parades, royal durbars, and vibrant cultural performances.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Image_of_Damba_festival.jpg?width=1200',
    startDate: '2026-11-15',
    endDate: '2026-11-17',
    location: 'Tamale, Northern Region',
    region: 'Northern',
    regionCode: 'NR',
    venue: 'Tamale (Dagbon Traditional Area)',
    isFree: true,
    activities: [
      'Traditional horse parades and riding displays',
      'Royal durbar of Dagomba chiefs',
      'Drumming and dancing',
      'Islamic prayers and ceremonies',
      'Cultural processions',
    ],
    transportInfo: 'Tamale is accessible by STC bus from Accra (9–10 hours, ₵100–150) or by domestic flight.',
    relatedDestinations: ['mole-national-park'],
    featured: false,
    tags: ['Islamic', 'Northern', 'horses', 'cultural', 'Dagomba', 'Tamale', 'traditional'],
  },
  {
    id: 'bakatue-festival-2026',
    name: 'Bakatue Festival',
    slug: 'bakatue-festival-2026',
    category: 'traditional',
    description:
      'Bakatue, meaning "the opening of the lagoon", is the traditional festival of the people of Elmina in the Central Region marking the start of the fishing season on the Benya Lagoon. The festival includes a canoe procession on the lagoon, libations to the gods of the sea, casting of nets to mark the beginning of fishing, colourful durbars of chiefs, and cultural performances. It is a vibrant celebration of the fishing community\'s livelihood and spiritual heritage.',
    shortDescription:
      'Elmina\'s colourful lagoon-opening festival — a joyful ceremony blessing the start of the fishing season with canoe processions and royal durbars.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bakatue_2016_001_B001.jpg?width=1200',
    startDate: '2026-07-04',
    endDate: '2026-07-05',
    location: 'Elmina, Central Region',
    region: 'Central',
    regionCode: 'CP',
    venue: 'Benya Lagoon, Elmina',
    isFree: true,
    activities: [
      'Canoe processions on the Benya Lagoon',
      'Libation ceremonies to the sea gods',
      'Traditional fishing ceremony (casting of nets)',
      'Durbar of chiefs',
      'Cultural music and dance',
    ],
    transportInfo: 'Elmina is 15 km west of Cape Coast. Take trotro from Cape Coast (₵5-10).',
    relatedDestinations: ['elmina-castle', 'cape-coast-castle'],
    featured: false,
    tags: ['fishing', 'Elmina', 'lagoon', 'Central', 'traditional', 'canoe', 'coastal'],
  },
  {
    id: 'asafotufiam-2026',
    name: 'Asafotufiam Festival',
    slug: 'asafotufiam-2026',
    category: 'traditional',
    description:
      'Asafotufiam is the annual festival of the Ada people of the Greater Accra Region, held at Ada Foah. The festival commemorates the victory of the Ada people over external aggressors and celebrates their resilience, bravery, and unity. It features spectacular military-style Asafo company displays, musket firing, traditional dances, colourful processions, and durbars of paramount chiefs. The backdrop of the beautiful Ada lagoon adds to the spectacular setting.',
    shortDescription:
      'The Ada people\'s bold celebration of military victory — spectacular warrior processions, musket fire, and durbars at the stunning Ada Foah lagoon.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Foah_Beach_2.jpg?width=1200',
    startDate: '2026-08-04',
    endDate: '2026-08-08',
    location: 'Ada Foah, Greater Accra',
    region: 'Greater Accra',
    regionCode: 'GA',
    venue: 'Ada Foah',
    isFree: true,
    activities: [
      'Asafo company military displays',
      'Musket firing',
      'Traditional Ada dance performances',
      'Durbar of Ada paramount chiefs',
      'Canoe processions',
    ],
    transportInfo: 'From Accra, take trotro from Tema station to Ada junction then shared taxi to Ada Foah.',
    relatedDestinations: ['ada-foah', 'labadi-beach'],
    featured: false,
    tags: ['Ada', 'traditional', 'military', 'festival', 'Greater Accra', 'canoe', 'warrior'],
  },
  {
    id: 'ghana-film-festival-2026',
    name: 'Ghana International Film Festival',
    slug: 'ghana-film-festival-2026',
    category: 'art',
    description:
      'The Ghana International Film Festival is an annual celebration of African and international cinema, showcasing feature films, documentaries, and short films. The festival provides a platform for Ghanaian and African filmmakers, hosts masterclasses with industry professionals, and engages film lovers across Accra. Screenings take place at multiple venues including outdoor settings, and the event culminates in a prestigious awards ceremony.',
    shortDescription:
      'Ghana\'s premier cinema event — celebrating African storytelling with screenings, masterclasses, and awards across Accra\'s venues.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Ghana_National_Theater_(21927550006).jpg?width=1200',
    startDate: '2026-10-08',
    endDate: '2026-10-13',
    location: 'Accra',
    region: 'Greater Accra',
    regionCode: 'GA',
    venue: 'Various cinemas and venues across Accra',
    isFree: false,
    ticketPrice: 50,
    activities: [
      'Film screenings (features, documentaries, shorts)',
      'Director Q&A sessions',
      'Filmmaking masterclasses',
      'Networking events for industry professionals',
      'Opening and closing galas',
      'Awards ceremony',
    ],
    transportInfo: 'Various venues across Accra — check individual venue locations for transport options.',
    relatedDestinations: ['kwame-nkrumah-memorial-park'],
    featured: false,
    tags: ['film', 'cinema', 'art', 'African', 'storytelling', 'Accra', 'entertainment'],
  },
  {
    id: 'choral-festival-kumasi-2026',
    name: 'Kumasi Choral Festival',
    slug: 'choral-festival-kumasi-2026',
    category: 'music',
    description:
      'The Kumasi Choral Festival is a prestigious annual celebration of Ghanaian choral music held in Kumasi, Ghana\'s cultural capital. The festival brings together choirs from across Ghana — church choirs, school choirs, and community ensembles — to perform a rich repertoire of classical choral works, Ghanaian folk songs, and gospel music. It is one of the most beloved musical events in Ashanti Region, drawing thousands of music lovers.',
    shortDescription:
      'Ghana\'s premier choral music gathering — choirs from across the country converge on Kumasi for an unforgettable celebration of voice and harmony.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Centre_for_National_Culture%2C_Kumasi.jpg?width=1200',
    startDate: '2026-10-23',
    endDate: '2026-10-25',
    location: 'Kumasi',
    region: 'Ashanti',
    regionCode: 'AH',
    venue: 'Kumasi Cultural Centre and surrounding venues',
    isFree: false,
    ticketPrice: 40,
    activities: [
      'Choral competitions between visiting choirs',
      'Gala concerts featuring top Ghanaian choirs',
      'Youth choir showcases',
      'Music workshops and masterclasses',
      'Awards ceremony',
    ],
    transportInfo: 'Kumasi is accessible by STC bus from Accra (4.5 hours, ₵80-120) or domestic flight.',
    relatedDestinations: ['manhyia-palace', 'kumasi-cultural-centre'],
    featured: false,
    tags: ['music', 'choral', 'Kumasi', 'Ashanti', 'gospel', 'competition', 'performance'],
  },
  {
    id: 'kundum-festival-2026',
    name: 'Kundum Festival',
    slug: 'kundum-festival-2026',
    category: 'traditional',
    description:
      'Kundum is an ancient harvest and purification festival celebrated by the Ahanta and Nzema peoples of Ghana\'s Western Region. The festival is marked by elaborate purification rites, communal celebrations of the yam harvest, traditional music and dance, libations to ancestral spirits, and colourful processions. Each town celebrates Kundum at different times between August and October, creating a rolling series of festivals throughout the region.',
    shortDescription:
      'An ancient harvest purification festival of the Ahanta and Nzema — elaborate rites, yam celebrations, and ancestral music across the Western Region.',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Kundum_Festival_Dance.jpg?width=1200',
    startDate: '2026-09-15',
    endDate: '2026-10-15',
    location: 'Sekondi-Takoradi area, Western Region',
    region: 'Western',
    regionCode: 'WN',
    venue: 'Various towns in the Western Region',
    isFree: true,
    activities: [
      'Traditional purification rites',
      'Yam harvest celebrations',
      'Traditional music and dance',
      'Libation ceremonies',
      'Communal feasts',
    ],
    transportInfo: 'Sekondi-Takoradi is 250 km west of Accra. STC buses run daily (₵60-90, 4-5 hours).',
    relatedDestinations: ['nzulezu-stilt-village'],
    featured: false,
    tags: ['Ahanta', 'Nzema', 'harvest', 'Western', 'traditional', 'purification', 'yam'],
  },
];

export const getFeaturedEvents = (): Event[] =>
  events.filter((e) => e.featured);

export const getUpcomingEvents = (): Event[] => {
  const today = NOW.toISOString().split('T')[0];
  return events.filter((e) => e.endDate >= today).sort((a, b) => a.startDate.localeCompare(b.startDate));
};

export const getEventById = (id: string): Event | undefined =>
  events.find((e) => e.id === id);

export const getEventBySlug = (slug: string): Event | undefined =>
  events.find((e) => e.slug === slug);

export const getEventsByCategory = (category: string): Event[] =>
  events.filter((e) => e.category === category);

export const searchEvents = (query: string): Event[] => {
  const q = query.toLowerCase();
  return events.filter(
    (e) =>
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q) ||
      e.location.toLowerCase().includes(q) ||
      e.tags.some((t) => t.toLowerCase().includes(q)),
  );
};
