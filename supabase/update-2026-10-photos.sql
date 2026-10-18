-- YenkoGH photo update, October 2026. Run once in the Supabase SQL editor on a
-- database set up before this date. Safe to run more than once.
--
-- Replaces stock photos that did not show the place they were labelled as
-- (and some that no longer loaded) with real photos of each destination,
-- event, region and transport option from Wikimedia Commons. Only rows still
-- using an Unsplash stock photo are changed, so photos an administrator has
-- set since are kept. Sources are listed on the site's /credits page.

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle%2C_Cape_Coast%2C_Ghana.JPG?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Cape_Coast_Castle%2C_Cape_Coast%2C_Ghana.JPG'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle%2C_Cape_Coast%2C_Ghana.JPG?width=1200","alt":"Cape Coast Castle battlements and cannons over the Atlantic"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle_Courtyard_with_Cannon_Balls_02_Sept_2012.jpg?width=1200","alt":"Castle courtyard with cannonballs"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Castle%2C_Cape_Coast_(P1100214).jpg?width=1200","alt":"Memorial plaque at Cape Coast Castle"}]'::jsonb)
where id = 'cape-coast-castle' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Canopy_walkway_in_Kakum_National_Park_3.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Canopy_walkway_in_Kakum_National_Park_3.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Canopy_walkway_in_Kakum_National_Park_3.jpg?width=1200","alt":"Kakum canopy walkway"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Canopy_walkway_in_Kakum_National_Park_2.jpg?width=1200","alt":"Canopy walkway through the treetops"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Kakum_National_Park%2C_Jukwa_(P1100159-Pano).jpg?width=1200","alt":"Rainforest canopy at Kakum"},{"id":"g4","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Trees_in_the_Kakum_National_Park_01.jpg?width=1200","alt":"Rainforest trees in Kakum National Park"}]'::jsonb)
where id = 'kakum-national-park' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mole_National_Park%2C_West_Gonja_(P1100448).jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Mole_National_Park%2C_West_Gonja_(P1100448).jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Mole_National_Park%2C_West_Gonja_(P1100448).jpg?width=1200","alt":"Elephant in Mole National Park"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Mole_National_Park%2C_Mole_Village_(P1100345-Pano-2).jpg?width=1200","alt":"Savannah at Mole National Park"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/A_Warthog_at_the_Mole_National_Park_in_Northern_Ghana.jpg?width=1200","alt":"Warthog at Mole National Park"}]'::jsonb)
where id = 'mole-national-park' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Elmina_Castle_-_Ghana.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Elmina_Castle_-_Ghana.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Elmina_Castle_-_Ghana.jpg?width=1200","alt":"Elmina Castle on the coast"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Castle%2C_Elmina_(P1100186).jpg?width=1200","alt":"Inside the castle courtyard"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Castle%2C_Elmina_(P1100197).jpg?width=1200","alt":"Elmina harbour seen from a castle window"}]'::jsonb)
where id = 'elmina-castle' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/La-Beach_(Labadi_Accra).jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:La-Beach_(Labadi_Accra).jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/La-Beach_(Labadi_Accra).jpg?width=1200","alt":"Beach bars and umbrellas on Labadi Beach"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Canoe_at_Labadi_Beach_Accra.jpg?width=1200","alt":"Fishing canoe on Labadi Beach"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Labadi_Beach_Accra.jpg?width=1200","alt":"Horse rides on Labadi Beach"}]'::jsonb)
where id = 'labadi-beach' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kwame_Nkrumah_Memorial_Park_%26_Mausoleum_4.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Kwame_Nkrumah_Memorial_Park_%26_Mausoleum_4.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Kwame_Nkrumah_Memorial_Park_%26_Mausoleum_4.jpg?width=1200","alt":"Kwame Nkrumah Mausoleum and fountains"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Kwame_Nkrumah_artworks_at_Kwame_Nkrumah_Mausoleum.jpg?width=1200","alt":"Portrait wall in the Memorial Park"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/OSAGYEFO_DR._KWAME_NKRUMAH_Grave_at_Kwame_Nkrumah_mausoleum.jpg?width=1200","alt":"Grave of Dr Kwame Nkrumah"}]'::jsonb)
where id = 'kwame-nkrumah-memorial-park' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wli_Lower_Fall-4.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Wli_Lower_Fall-4.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Wli_Lower_Fall-4.jpg?width=1200","alt":"Wli waterfalls"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Spirit_of_Ghana_Wli_Waterfalls_09.jpg?width=1200","alt":"The falls and plunge pool at Wli"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Spirit_of_Ghana_Wli_Waterfalls_10.jpg?width=1200","alt":"Agumatsa hills around Wli"}]'::jsonb)
where id = 'wli-waterfalls' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Botanical_Gardens%2C_Akwapim_South_(P1090823).jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Botanical_Gardens%2C_Akwapim_South_(P1090823).jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Botanical_Gardens%2C_Akwapim_South_(P1090823).jpg?width=1200","alt":"Giant silk-cotton tree at Aburi Botanical Gardens"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Araucaria_columnaris%2C_Aburi_(P1090843).jpg?width=1200","alt":"Araucaria trees in the gardens"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Botanical_Gardens%2C_Aburi_(P1090829).jpg?width=1200","alt":"The old helicopter in Aburi Gardens"}]'::jsonb)
where id = 'aburi-botanical-gardens' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Volta_Ghana.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Lake_Volta_Ghana.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Volta_Ghana.jpg?width=1200","alt":"Lake Volta and the surrounding hills"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Lake_Volta_(Ghana).jpg?width=1200","alt":"Sunset over Lake Volta"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Dodi_Island_and_Rocky_Shore_%E2%88%92_Lake_Volta.jpg?width=1200","alt":"Dodi Island on Lake Volta"}]'::jsonb)
where id = 'lake-volta' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Nzulezo_stilt_village.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Nzulezo_stilt_village.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Nzulezo_stilt_village.jpg?width=1200","alt":"Nzulezu stilt village on the lagoon"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Nzulezu_river.jpg?width=1200","alt":"Jetty on the way to Nzulezu"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Nzulezu_front.jpg?width=1200","alt":"Approaching Nzulezu across the water"}]'::jsonb)
where id = 'nzulezu-stilt-village' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Manhyia_Palace_Museum_(Kumasi%2C_Ghana_2017).jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Manhyia_Palace_Museum_(Kumasi%2C_Ghana_2017).jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Manhyia_Palace_Museum_(Kumasi%2C_Ghana_2017).jpg?width=1200","alt":"Manhyia Palace Museum, Kumasi"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Manhyia_Palace_Museum_in_Kumasi.jpg?width=1200","alt":"The old palace building, now a museum"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Manhyia_Palace_Museum_Exhibit.jpg?width=1200","alt":"Exhibit inside the Manhyia Palace Museum"}]'::jsonb)
where id = 'manhyia-palace' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Historic_Statues_at_the_Africa_Culture_-_Kumasi_Centre_for_National_Culture.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Historic_Statues_at_the_Africa_Culture_-_Kumasi_Centre_for_National_Culture.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Historic_Statues_at_the_Africa_Culture_-_Kumasi_Centre_for_National_Culture.jpg?width=1200","alt":"Statues at the Kumasi Centre for National Culture"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Centre_for_National_Culture%2C_Kumasi.jpg?width=1200","alt":"Centre for National Culture, Kumasi"}]'::jsonb)
where id = 'kumasi-cultural-centre' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Foah_Beach_1.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Ada_Foah_Beach_1.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Foah_Beach_1.jpg?width=1200","alt":"Palm-lined beach at Ada Foah"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Huts_on_a_beach%2C_Ada.JPG?width=1200","alt":"Beach huts at Ada"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Foah_Beach_2.jpg?width=1200","alt":"Canoes on the estuary at Ada Foah"}]'::jsonb)
where id = 'ada-foah' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Crocodile_at_Paga_crocodile_pond.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Crocodile_at_Paga_crocodile_pond.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Crocodile_at_Paga_crocodile_pond.jpg?width=1200","alt":"Crocodile at Paga Crocodile Pond"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Paga_Crocodile_Pond_(tourism).jpg?width=1200","alt":"Crocodiles at the pond''s edge"}]'::jsonb)
where id = 'paga-crocodile-pond' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kintampo_waterfalls_pictures_01.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Kintampo_waterfalls_pictures_01.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Kintampo_waterfalls_pictures_01.jpg?width=1200","alt":"Kintampo waterfalls"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Top_view_of_Kintampo_waterfalls.jpg?width=1200","alt":"Kintampo falls from above"},{"id":"g3","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Canopy_walkway_of_Kintampo_Waterfalls.jpg?width=1200","alt":"Canopy walkway at Kintampo Waterfalls"}]'::jsonb)
where id = 'kintampo-waterfalls' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Boti_Falls_Ghana.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Boti_Falls_Ghana.jpg'::text, 'gallery', '[{"id":"g1","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Boti_Falls_Ghana.jpg?width=1200","alt":"The twin falls at Boti"},{"id":"g2","url":"https://commons.wikimedia.org/wiki/Special:FilePath/Boti_Falls%2C_Ghana.jpg?width=1200","alt":"Boti Falls in the forest"}]'::jsonb)
where id = 'boti-falls' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bunso_Canopy_walkway.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Bunso_Canopy_walkway.jpg'::text, 'gallery', '[]'::jsonb)
where id = 'bunso-eco-park' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chimpazee_at_the_Kumasi_Zoo.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Chimpazee_at_the_Kumasi_Zoo.jpg'::text, 'gallery', '[]'::jsonb)
where id = 'kumasi-zoo' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Deer_Achimota_Forest_Zoo_Accra.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Deer_Achimota_Forest_Zoo_Accra.jpg'::text, 'gallery', '[]'::jsonb)
where id = 'accra-zoo' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Shai_Hills,_Shai-Osudoku_(P1100110).jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Shai_Hills,_Shai-Osudoku_(P1100110).jpg'::text, 'gallery', '[]'::jsonb)
where id = 'shai-hills-resource-reserve' and image_url like 'https://images.unsplash.com/%';

update public.destinations set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Larabanga_Mosque_Ghana.jpg?width=1200',
  details = details || jsonb_build_object('imageCredit', 'https://commons.wikimedia.org/wiki/File:Larabanga_Mosque_Ghana.jpg'::text, 'gallery', '[]'::jsonb)
where id = 'larabanga-mosque' and image_url like 'https://images.unsplash.com/%';

update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Accra_Homowo_um1900_300dpi.jpg?width=1200' where id = 'homowo-festival-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Chale_Wote_Street_Art_Festival_10.jpg?width=1200' where id = 'chale-wote-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cape_Coast_Castle_Courtyard_02_Sept_2012.jpg?width=1200' where id = 'panafest-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Hogb1.jpg?width=1200' where id = 'hogbetsotso-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Fisherboats_in_Winneba%2C_Ghana-2.jpg?width=1200' where id = 'aboakyir-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ghana_Jollof_Rice.JPG?width=1200' where id = 'ghana-jollof-festival-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Image_of_Damba_festival.jpg?width=1200' where id = 'damba-festival-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bakatue_2016_001_B001.jpg?width=1200' where id = 'bakatue-festival-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ada_Foah_Beach_2.jpg?width=1200' where id = 'asafotufiam-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Ghana_National_Theater_(21927550006).jpg?width=1200' where id = 'ghana-film-festival-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Centre_for_National_Culture%2C_Kumasi.jpg?width=1200' where id = 'choral-festival-kumasi-2026' and image_url like 'https://images.unsplash.com/%';
update public.events set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kundum_Festival_Dance.jpg?width=1200' where id = 'kundum-festival-2026' and image_url like 'https://images.unsplash.com/%';

update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Black_Star_Gate_located_in_Accra.jpg?width=800' where id = 'greater-accra' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Modern_market_hall_of_Kejetia_market.jpg?width=800' where id = 'ashanti' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/View_over_Town_from_Fort_Victoria_-_Cape_Coast_-_Ghana_(4737799143).jpg?width=800' where id = 'central' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Busua_Beach_Western_Region2.jpg?width=800' where id = 'western' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Spillway_of_Akosombo_dam.jpg?width=800' where id = 'eastern' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Beautiful_Landscape_view_on_the_Afadjato_Mountain_in_Ghana1.jpg?width=800' where id = 'volta' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Road%2C_Tamale.jpg?width=800' where id = 'northern' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Packed_rocks_at_Tongo_Hills.jpg?width=800' where id = 'upper-east' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Wa_Naa_palace.jpg?width=800' where id = 'upper-west' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Cocoa_House_in_Sunyani.jpg?width=800' where id = 'bono' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kintampo_waterfalls_with_rocks.jpg?width=800' where id = 'bono-east' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Goaso_to_Kumasi.jpg?width=800' where id = 'ahafo' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Mole_National_Park%2C_West_Gonja_(P1100402).jpg?width=800' where id = 'savannah' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Gambaga_escarpment.jpg?width=800' where id = 'north-east' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Local_canoe_transportation_service_at_Dambai.jpg?width=800' where id = 'oti' and image_url like 'https://images.unsplash.com/%';
update public.regions set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Bia_National_Park%2C_and_a_rice_farm.jpg?width=800' where id = 'western-north' and image_url like 'https://images.unsplash.com/%';

update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/ISTC_TRANSPORT_YARD_by_Blaise_Daniel_Korley_Ahumah.jpg?width=800' where id = 'stc-bus' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/VIP_bus_at_station.jpg?width=800' where id = 'vip-bus' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Metro_Mass_Transit_bus%2C_Atimpoku_(P1090966).jpg?width=800' where id = 'metro-mass-transit' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Trotro_boarding.jpg?width=800' where id = 'trotro' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Taxi_%C3%A0_Accra.JPG?width=800' where id = 'taxi' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Traffic_Accra.jpg?width=800' where id = 'ride-hailing' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Kotoka_International_Airport_Apron_1.JPG?width=800' where id = 'domestic-flight' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Captured(February_6%2C2023)%3BFerry_with_Cars_and_passengers_crossing_Volta_River_in_Ghana-West_Africa.jpg?width=800' where id = 'boat-ferry' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Road_from_Accra_to_Nkawkaw_in_the_Eastern_Region_of_Ghana.jpg?width=800' where id = 'shared-intercity-taxi' and image_url like 'https://images.unsplash.com/%';
update public.transport_options set image_url = 'https://commons.wikimedia.org/wiki/Special:FilePath/Moto_taxi_Okada_%C3%A0_Madina_(Accra).jpg?width=800' where id = 'okada-motorcycle' and image_url like 'https://images.unsplash.com/%';

