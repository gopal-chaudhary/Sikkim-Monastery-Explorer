// Comprehensive list of monasteries in Sikkim with detailed authentic data
// Data cleaned and structured for easy frontend consumption

const cleanCitations = (text) => {
  if (!text) return text;
  return text.replace(/\[oai_citation:\d+‡[^\]]+\]/g, '')
            .replace(/\(\[turn\d+view\d+\]\([^)]+\)\)/g, '')
            .replace(/\(\[turn\d+search\d+\]\([^)]+\)\)/g, '')
            .trim();
};

const monasteries = [
  {
    name: "Enchey Monastery",
    link: "https://en.wikipedia.org/wiki/Enchey_Monastery",
    dataAvailable: true,
    location: {
      district: "East Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.33583,
      longitude: 88.61917
    },
    established: 1840,
    foundedBy: "Lama Druptab Karpo",
    sect: "Nyingma (Vajrayana Buddhism)",
    architectureStyle: "Tibetan, Chinese pagoda influence",
    description: "Enchey Monastery is a Tibetan Buddhist monastery of the Nyingma order above Gangtok. It was originally a hermitage established by the tantric master Lama Drupthob Karpo and later developed into a full monastery. Its literal name means 'Solitary Monastery' and it is believed to be sacred because deities like Khangchendzonga, Yabdean and Mahākāla are connected with the site. The monastery became a religious centre around the then small hamlet of Gangtok.",
    imageUrl: "https://images.unsplash.com/photo-1548013146-72479768bada?w=800",
    history: {
      early: "Originally established as a small gompa by Lama Drupthob Karpo, known for his tantric flying powers, after he flew from Maenam Hill to this site. The monastery was first built in the 1840s by the eighth Chogyal.",
      rebuild1909: "The monastery as seen today was aesthetically rebuilt in 1909 in a Chinese-pagoda style under the rule of Sikyong Tulku.",
      rebuild1948: "It was gutted in 1947 and subsequently rebuilt in 1948 with support from devotees."
    },
    architecture: {
      roof: "Shining golden cupola on top.",
      muralsAndPaintings: "Walls of the large prayer hall fully covered with paintings and murals of deities and religious figures.",
      pillars: "Four elaborately carved roof pillars.",
      sculptures: "Houses images of gods, goddesses, and religious objects.",
      scriptures: "Manuscripts of scriptures kept in an almirah."
    },
    monks: 90,
    festivals: [
      {
        name: "Detor Cham",
        description: "Colourful Cham dance festival held on the 18th and 19th day of the 12th lunar month (January/February)."
      },
      {
        name: "Singhe Chaam",
        description: "Masked dance festival performed once every three years."
      },
      {
        name: "Pang Lhabsol",
        description: "Commemorates the swearing of blood-brotherhood between the Bhutias and Lepchas in the presence of Khangchendzonga."
      }
    ],
    deitiesWorshipped: ["Buddha", "Loki Sharia", "Guru Padmasambhava"],
    culturalSignificance: "Considered sacred in Gangtok; it is believed that Khangchendzonga, Yabdean and Mahākāla reside in or near the monastery site and fulfil devotees' wishes.",
    earthquakeDamage: {
      "2006": "Enchey Monastery suffered severe structural damage during the Sikkim earthquake of 14 February 2006, with cracks in masonry walls and plaster loss.",
      previousEvents: "Earlier earthquakes in 1980 and 1988 had also damaged the structure."
    },
    features: ['Chaam Dance Festival', 'Traditional Murals', 'City Location', 'Tantric Buddhism', 'Annual Festivals'],
    rating: 4.6,
    visitors: 42000,
    openingHours: '6:00 AM - 7:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Year Round',
    nearbyAttractions: ['Gangtok City', 'Hanuman Tok', 'Tashi View Point'],
    altitude: 1840,
    region: "East Sikkim"
  },
  
  {
    name: "Sang Monastery",
    link: "https://en.wikipedia.org/wiki/Sang_Monastery",
    dataAvailable: true,
    location: {
      village: "Sang",
      district: "East Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: null,
    established: 1912,
    foundedBy: null,
    sect: "Kagyupa (Vajrayana Buddhism)",
    description: "Sang Monastery, also known as Karma Dubgyu Chokhorling Monastery, is a Buddhist monastery in Sang, East Sikkim, India. It was built in 1912 AD and belongs to the Kagyupa sect of Vajrayana Buddhism. The monastery houses two flat stone prints bearing the footprint and handprint of Phaya Lama, a prominent lama from Tibet who stayed and meditated in a nearby cave.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    features: ["Kagyupa sect monastery", "Stone footprints and handprints of Phaya Lama", "Meditation cave nearby"],
    culturalSignificance: "The site is spiritually important because of the imprint relics of Phaya Lama, a revered lama who meditated in a nearby ravine cave.",
    restoration: {
      info: "The monastery was severely damaged by the earthquake of September 18, 2011 and later restored to its original state with support from the Chief Minister's Relief Fund and Ecclesiastical Affairs Department."
    },
    rating: 4.4,
    visitors: 15000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'October to May',
    nearbyAttractions: ['Gangtok', 'Rumtek Monastery'],
    region: "East Sikkim"
  },
  
  {
    name: "Karthok Monastery",
    link: "https://en.wikipedia.org/wiki/Karthok_Monastery",
    dataAvailable: true,
    location: {
      town: "Pakyong",
      district: "Pakyong district",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.2408,
      longitude: 88.5880
    },
    established: null,
    foundedBy: "Chogyal Thutob Namgyal",
    sect: "Nyingma (Tibetan Buddhism)",
    description: "Karthok Monastery is a Buddhist monastery in Pakyong, a town in the foothills of the Himalayas in the East Sikkim district of the Indian state of Sikkim. It is considered the sixth oldest monastery of Sikkim and follows the Nyingma order of Tibetan Buddhism.",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
    features: ["Nyingma order monastery", "Historic monastery in Pakyong", "One of the oldest monasteries in Sikkim"],
    rating: 4.3,
    visitors: 12000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, September to December',
    nearbyAttractions: ['Pakyong Airport', 'Temi Tea Garden'],
    region: "East Sikkim"
  },
  
  {
    name: "Rhenock Monastery",
    link: "https://en.wikipedia.org/wiki/Rhenock_Monastery",
    dataAvailable: true,
    location: {
      region: "Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.1844032,
      longitude: 88.6771017
    },
    established: null,
    foundedBy: null,
    sect: "Tibetan Buddhism",
    description: "Rhenock Monastery is a Buddhist monastery in Sikkim, northeastern India. It is one of the listed Buddhist monasteries in the state.",
    imageUrl: "https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800",
    features: ["Buddhist monastery", "Tibetan Buddhist affiliation"],
    rating: 4.2,
    visitors: 10000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Year Round',
    nearbyAttractions: ['Gangtok'],
    region: "East Sikkim"
  },
  
  {
    name: "Simik Monastery",
    link: "https://en.wikipedia.org/wiki/Simik_Monastery",
    dataAvailable: true,
    location: {
      region: "Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.287143,
      longitude: 88.470808
    },
    established: null,
    foundedBy: null,
    sect: "Tibetan Buddhism",
    description: "Simik Monastery is a Buddhist monastery in Sikkim, northeastern India. It follows Tibetan Buddhist tradition.",
    imageUrl: "https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800",
    features: ["Buddhist monastery", "Tibetan Buddhist affiliation"],
    rating: 4.1,
    visitors: 8000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'October to May',
    nearbyAttractions: ['Gangtok', 'Rumtek'],
    region: "East Sikkim"
  },
  
  {
    name: "Hee Gyathang Monastery",
    link: "https://en.wikipedia.org/wiki/Hee_Gyathang_Monastery",
    dataAvailable: true,
    location: {
      area: "Upper Dzongu",
      district: "North Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: null,
    established: 1914,
    foundedBy: "Abi Putso Rangdrol",
    sect: "Buddhist",
    description: "Hee Gyathang Monastery is a Buddhist monastery situated in Upper Dzongu in the North Sikkim district of India. It was built by the hermit Abi Putso Rangdrol in 1914.",
    imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    features: ["Buddhist monastery", "Situated in Upper Dzongu, North Sikkim", "Founded by hermit Abi Putso Rangdrol"],
    rating: 4.3,
    visitors: 6000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, September to November',
    nearbyAttractions: ['Dzongu region', 'Mangan'],
    region: "North Sikkim"
  },
  
  {
    name: "Labrang Monastery",
    link: "https://en.wikipedia.org/wiki/Labrang_Monastery_%28Sikkim%29",
    dataAvailable: true,
    location: {
      district: "North Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: null,
    established: 1844,
    foundedBy: "Gyalshe Rigzing Chempa",
    sect: "Nyingmapa (Tibetan Buddhism)",
    description: "Labrang Monastery is a Buddhist monastery located in Phodong, North Sikkim, India. It is one of the important monasteries of the Nyingma tradition in Sikkim and lies about 2 km from Phodong Monastery. The monastery was completed around 1844 and was constructed in memory of Latsun Chembo of Kongpu, Tibet. It is situated on relatively flat ground amidst jungle hills.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    architecture: {
      structure: "Retains original wooden pillars and roofing reinforced with steel; the building has unique architecture compared to other Sikkim monasteries which often burned down."
    },
    features: ["Monastery of the Nyingma tradition", "Located near Phodong Monastery", "Houses bronze statue of Karma Guru", "Museum with Buddha statues, sutras and murals"],
    culturalSignificance: "An important monastery of the Nyingmapa lineage in Northern Sikkim and a peaceful place for meditation.",
    nearbyAttractions: ["Phodong Monastery"],
    rating: 4.5,
    visitors: 14000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, October to December',
    region: "North Sikkim"
  },
  
  {
    name: "Lachen Monastery",
    link: "https://en.wikipedia.org/wiki/Lachen_Monastery",
    dataAvailable: true,
    location: {
      region: "North Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.7162407,
      longitude: 88.5566106
    },
    established: 1858,
    foundedBy: null,
    sect: "Nyingma (Tibetan Buddhism)",
    description: "Lachen Monastery (also called Ngodrub Choling Gonpa, \"Launching Gompa\") is a Nyingma Buddhist monastery near Lachen, North Sikkim, India. It was built in 1858 and is home to the Lachen Monastic School.",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
    features: ["Nyingma Buddhist monastery", "Also called Ngodrub Choling Gonpa", "Home to Lachen Monastic School"],
    rating: 4.4,
    visitors: 18000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'April to June, September to November',
    nearbyAttractions: ['Lachen Valley', 'Gurudongmar Lake'],
    altitude: 2750,
    region: "North Sikkim"
  },
  
  {
    name: "Lachung Monastery",
    link: "https://en.wikipedia.org/wiki/Lachung_Monastery",
    dataAvailable: true,
    location: {
      village: "Lachung",
      district: "Mangan district, North Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: null,
    established: 1880,
    foundedBy: null,
    sect: "Nyingma (Tibetan Buddhism)",
    description: "Lachung Monastery is a Nyingma Buddhist gompa in the Lachung Valley in Mangan district in the northeastern Indian state of Sikkim. It was established in 1880. The monastery is an important religious centre of the region and is connected with local cultural and spiritual traditions.",
    imageUrl: "https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800",
    features: ["Nyingma Buddhist monastery", "Located in Lachung Valley", "Annual mask dance ceremonies"],
    festivals: [
      {
        name: "Mask Dance (Cham)",
        description: "Annual masked dance held during winter months as a religious ritual."
      }
    ],
    culturalSignificance: "The monastery serves as a prominent centre for religious and cultural activity in Lachung village and hosts traditional ceremonies that are central to the spiritual life of the community.",
    nearbyAttractions: ["Lachung town", "Yumthang Valley"],
    rating: 4.5,
    visitors: 22000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'April to June, September to November',
    altitude: 2750,
    region: "North Sikkim"
  },
  
  {
    name: "Phensang Monastery",
    link: "https://en.wikipedia.org/wiki/Phensang_Monastery",
    dataAvailable: true,
    location: {
      village: "Phensang",
      district: "North District",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.42028,
      longitude: 88.61028
    },
    established: 1721,
    foundedBy: "Jigme Pawo",
    sect: "Nyingmapa (Tibetan Buddhism)",
    description: "Phensang Monastery is a Buddhist monastery of the Nyingmapa Order in Phensang, Sikkim, India, located about 9 km north of Gangtok. It was established in 1721 during the time of Jigme Pawo. The monastery belongs to the Nyingmapa sect of Tibetan Buddhism.",
    imageUrl: "https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800",
    features: ["Nyingmapa Order monastery", "One of the historic monasteries in North Sikkim"],
    festivals: [
      {
        name: "Annual Festival",
        description: "Held on the 28th and 29th days of the 10th Tibetan month according to the traditional calendar."
      }
    ],
    rating: 4.3,
    visitors: 16000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Year Round',
    nearbyAttractions: ['Gangtok', 'Enchey Monastery'],
    region: "North Sikkim"
  },
  
  {
    name: "Phodong Monastery",
    link: "https://en.wikipedia.org/wiki/Phodong_Monastery",
    dataAvailable: true,
    location: {
      district: "North Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.41278,
      longitude: 88.58389
    },
    established: 1740,
    foundedBy: "Chogyal Gyurmed Namgyal",
    sect: "Kagyupa (Karma Kagyu, Tibetan Buddhism)",
    architectureStyle: "Early 18th century Tibetan Buddhist monastic architecture",
    description: "Phodong Monastery (also spelled Phodang or Podong) is a Buddhist monastery in Sikkim, India located 28 kilometres from Gangtok. It was built in the early 18th century, with an older monastery existing earlier. The 9th Karmapa Wangchuk Dorje was invited by the King of Sikkim to establish this and other monasteries. It was reconstructed later under Sidkeong Tulku Namgyal. The monastery serves as one of the important seats of the Karma Kagyu tradition.",
    imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    architecture: {
      style: "Early 18th century Tibetan Buddhist monastic architecture"
    },
    features: ["Buddhist monastery of the Karma Kagyu (Kagyupa) sect", "Reconstructed historic building from early 18th century", "Residence of approximately 260 monks", "Collection of ancient murals"],
    monks: 260,
    festivals: [
      {
        name: "Chaam Dance",
        description: "Held on the 28th and 29th day of the 10th Tibetan month."
      }
    ],
    culturalSignificance: "One of the six important monasteries in Sikkim and a principal seat of the Karma Kagyu lineage, linked with the 9th Karmapa.",
    rating: 4.6,
    visitors: 28000,
    openingHours: '7:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, October to December',
    nearbyAttractions: ['Labrang Monastery', 'Gangtok'],
    region: "North Sikkim"
  },
  
  {
    name: "Tholung Monastery",
    link: "https://en.wikipedia.org/wiki/Tholung_Monastery",
    dataAvailable: true,
    location: {
      area: "Upper Dzongu",
      district: "North Sikkim",
      state: "Sikkim",
      country: "India",
      altitudeFeet: 8000
    },
    coordinates: {
      latitude: 27.637,
      longitude: 88.461
    },
    established: 1789,
    foundedBy: "Chogyal Phuntsog Namgyal II",
    sect: "Nyingmapa (Tibetan Buddhism)",
    description: "Tholung Monastery is a gompa located in remote upper Dzongu within the buffer zone of Khangchendzonga National Park and is considered one of the most sacred monasteries in Sikkim. It was originally constructed in the early 18th century by Chogyal Phuntsog Namgyal II and houses precious manuscripts and relics from other Sikkimese monasteries that were brought here for protection during the Nepalese invasion. The monastery follows the Nyingmapa school of Tibetan Buddhism and is listed as a World Heritage property.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    history: {
      sacredDiscovery: "Tholung was revealed as a sacred place by the 4th Lhatsun, Kunzang Jigmed Gyatso, in 1760, and in 1789 Pema Dechhen Gyatso constructed a monastery at the site.",
      relicProtection: "During the Gorkha invasion, the monastery became a refuge for ancient manuscripts, Sikkimese art, relics and sacred objects from other gompas.",
      caretakers: "After the Nepalese invasion, two monks were appointed to watch over the relics, and their descendants were curators until the 1940s, after which the Ecclesiastical Department of the Government of Sikkim took over."
    },
    features: ["Repository of ancient Sikkimese Buddhist manuscripts and relics", "Metal chorten enclosing ashes of an incarnate of Lama Latsun Chembo", "Located deep within the Dzongu region's sacred landscape"],
    festivals: [
      {
        name: "Kamsil Ceremony",
        description: "Held every three years during April when relics and sacred objects are removed from their protective boxes, ventilated and displayed to the public, and worshipers receive them."
      }
    ],
    culturalSignificance: "Tholung Monastery is one of the most sacred Buddhist sites in Sikkim, preserving priceless artefacts, ancient texts and relics of immeasurable spiritual importance. It occupies a central place in the religious history and traditions of the region.",
    architecture: {
      originalConstruction: "18th century gompa construction by royal authority",
      reconstruction: "The current monastery was reconstructed in 1980 because the old structure had deteriorated."
    },
    rating: 4.8,
    visitors: 8000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'April to June, September to November',
    nearbyAttractions: ['Khangchendzonga National Park', 'Dzongu region'],
    altitude: 2438,
    region: "North Sikkim"
  },
  
  {
    name: "Chawayng Ani Monastery",
    link: "https://en.wikipedia.org/wiki/Chawayng_Ani_Monastery",
    dataAvailable: true,
    location: {
      state: "Sikkim",
      country: "India"
    },
    coordinates: null,
    established: null,
    foundedBy: "Chogyal Tsugphud Namgyal",
    sect: "Tibetan Buddhism",
    description: "Chawayng Ani Monastery is a Buddhist monastery in Sikkim, northeastern India. It is one of the Buddhist monasteries located in the state of Sikkim.",
    imageUrl: "data:image/jpeg;base64,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cmsprrr8LL09cumi4mi3/DVsiyTOD5ePMBUbTjAHdW1ZgtlLvpJHgjlmpFKwTSIC8eRg7TjjI4OO+s1mookKp8G5JvFGTriHrfqOlq5EigNtVLfJSLToQzU6eZSPLGkhGX2SKzHB3fKm2NZfAO3WGohel6jvwhoKWppLLTtJT7LMk5G805EO5mAAVTMZdqjA7nOazUUUmh8A+lJhXTdVUkfiDcq2dKia4dU0VLUvuSPy0CIkKRRhVLAbEBO5iSSSdBKf8LvS1osVFaun7hdelYYbfLaqmSzGnhevpZH3vHNmEjOS2JIwki7mwwydZrNRRFf/AABsUd4SaluN0orH8fR3STpuneEUEtVSrCtPKcxGUbfh4DsWQITEpKnLZMr4XUtPY+raGivV3t1d1LUzVdZeqWWMV0buqovlOYyqiONEjT5SVVAclssc1moog9g8EEsXh1WdFf7ZdRVdnniSmjYrQ001NAD88cb09LFjzASGcgv8xKsrfNpkrvDqz1tf0pNseno+mWaS32yn2pSq/lGGNym3JMcbOEAIA3k4JClc1moomjWazWaiizWazWaiizWazWaiizWazWaiizWazWaiizWazWaiizWazWaiizWazWaii//Z",
    features: ["Buddhist monastery", "Affiliated with Tibetan Buddhism"],
    rating: 4.2,
    visitors: 7000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Year Round',
    nearbyAttractions: ['Gangtok'],
    region: "North Sikkim"
  },
  
  {
    name: "Namchi Monastery",
    link: "https://en.wikipedia.org/wiki/Namchi_Monastery",
    dataAvailable: true,
    location: {
      region: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.165,
      longitude: 88.366
    },
    established: null,
    foundedBy: null,
    sect: "Tibetan Buddhism",
    description: "Namchi Monastery is a Buddhist monastery in Sikkim, northeastern India. It is listed among the Buddhist monasteries in the state.",
    imageUrl: "https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800",
    features: ["Buddhist monastery", "Affiliated with Tibetan Buddhism"],
    rating: 4.3,
    visitors: 20000,
    openingHours: '6:00 AM - 6:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'Year Round',
    nearbyAttractions: ['Namchi Char Dham', 'Samdruptse Hill'],
    region: "South Sikkim"
  },
  
  {
    name: "Tendong Gumpa",
    link: "https://en.wikipedia.org/wiki/Tendong_Gumpa",
    dataAvailable: true,
    location: {
      peak: "Tendong Peak",
      district: "South Sikkim",
      state: "Sikkim",
      country: "India",
      altitudeFeet: 8530
    },
    coordinates: {
      latitude: 27.20611,
      longitude: 88.40806
    },
    established: 1955,
    foundedBy: "Gomchen Pema Chewang Tamang",
    sect: "Nyingma (Tibetan Buddhism)",
    architectureStyle: "Tibetan architecture",
    description: "Tendong Gumpa, also known as Tendong Dichhen Salhun Gumpa, is a Buddhist monastery situated atop Tendong Peak in South Sikkim, India. It lies at an altitude of 8,530 ft above mean sea level, surrounded by lush virgin reserve forest. The monastery was built in 1955 with the support of the then King and Queen of Sikkim and is affiliated with the Nyingma order of Tibetan Buddhism.",
    imageUrl: "https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800",
    architecture: {
      style: "Tibetan architecture",
      details: "Two-story Gurulakhang (main monastery) and separate Manilakhang for worshipping Cherenzig, prayer wheels, meditation hut, and 50 ft tower offering scenic views."
    },
    features: ["Buddhist monastery of the Nyingma sect", "Located atop Tendong Peak with panoramic views", "Tibetan architectural style", "Two shrines including Gurulakhang and Manilakhang", "Library with expanding collection"],
    festivals: [
      {
        name: "Tshechu",
        description: "Observed during March–April on the tenth day of the Tibetan lunar calendar, when local people come to offer prayers for health and prosperity. This coincides with Rama Navami in Sikkim."
      },
      {
        name: "Buddha Poornima",
        description: "Celebrated as one of the festivals at the monastery."
      }
    ],
    culturalSignificance: "Due to its seclusion and spiritual setting, Tendong Gumpa has traditionally been a site for meditation by Buddhist lamas seeking solitude atop Tendong Peak.",
    earthquakeDamage: {
      "2011": "The monastery was partially damaged in the 2011 Sikkim earthquake and was renovated with government aid."
    },
    infrastructure: {
      shrines: ["Gurulakhang (main monastery)", "Manilakhang (dedicated to Cherenzig)"],
      library: "Library established to impart Buddhist knowledge",
      observationTower: "Approximately 50 ft tall tower with views of the Kanchenjunga range."
    },
    nearbyAttractions: ["Damthang (6 km by foot)", "Namchi", "Gangtok", "Ravangla via Damthang"],
    rating: 4.6,
    visitors: 16000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, October to December',
    altitude: 2600,
    region: "South Sikkim"
  },
  
  {
    name: "Pemayangtse Monastery",
    link: "https://en.wikipedia.org/wiki/Pemayangtse_Monastery",
    dataAvailable: true,
    location: {
      village: "Pemayangtse",
      district: "Gyalshing district",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.30444,
      longitude: 88.25278
    },
    established: 1705,
    foundedBy: "Lama Lhatsun Chempo",
    sect: "Nyingma (Tibetan Buddhism)",
    description: "Pemayangtse Monastery is a Buddhist monastery in Pemayangtse, near Gyalshing city in the Gyalshing district of Sikkim, India. Planned, designed and founded by Lama Lhatsun Chempo, it is one of the oldest and premier monasteries in Sikkim and follows the Nyingma order of Tibetan Buddhism. Originally started as a small Lhakhang, it was enlarged and consecrated in the early 18th century. It controls other Nyingma monasteries in the state and is noted for traditions involving monks chosen from the Bhutia community.",
    imageUrl: "https://images.unsplash.com/photo-1591825378301-2e65e50d6837?w=800",
    features: ["Historic Nyingma order monastery", "Located on a scenic hilltop near Pelling", "One of the oldest monasteries in Sikkim", "Monks of pure lineage (ta-tshang)"],
    architecture: {
      style: "Three-storied Tibetan Buddhist monastery",
      details: "Built with colourful painted doors, windows and traditional Tibetan designs. The main prayer hall contains statues of Padmasambhava (in wrathful form) and his consorts, as well as walls with murals. The structure overlooks the Rabdentse ruins."
    },
    festivals: [
      {
        name: "Chaam Dance Festival",
        description: "Held annually on the 28th and 29th day of the 12th Tibetan lunar month (around February), when lamas perform masked dances symbolizing deities. Pilgrims from across Sikkim visit to witness the celebrations."
      }
    ],
    monks: 108,
    culturalSignificance: "Pemayangtse Monastery is one of the most revered Buddhist monasteries in Sikkim. The head lama traditionally had the privilege of anointing Sikkim's Chogyals (kings) with holy water. The monastery serves as an important religious seat and heritage site for the Nyingma tradition in the region.",
    nearbyAttractions: ["Rabdentse Ruins", "Sanga Choeling Monastery", "Khecheopalri Lake", "Dubdi Monastery", "Tashiding Monastery"],
    rating: 4.9,
    visitors: 35000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, September to December',
    altitude: 2085,
    region: "West Sikkim"
  },
  
  {
    name: "Sanga Choeling Monastery",
    link: "https://en.wikipedia.org/wiki/Sanga_Choeling_Monastery",
    dataAvailable: true,
    location: {
      village: "Sanga Choeling",
      nearTown: "Pelling",
      district: "Gyalshing district",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.26389,
      longitude: 88.22139
    },
    established: 1701,
    foundedBy: "Lhatsün Namkha Jikmé",
    sect: "Nyingma (Tibetan Buddhism)",
    description: "Sanga Choeling Monastery, also spelled Sange Choeling Monastery, is one of the oldest Buddhist monasteries in Sikkim, located on a ridge above Pelling. Established in 1701 by Lama Lhatsün Namkha Jikmé, its literal meaning is 'Island of the Guhyamantra teachings', referring to Vajrayana Buddhism. It sits about 10 km from Gyalshing city and is part of a traditional pilgrimage circuit in the region.",
    imageUrl: "https://images.unsplash.com/photo-1604329760661-e71dc83f8f26?w=800",
    features: ["One of the oldest monasteries in Sikkim", "Located on a scenic ridge above Pelling", "Historic Nyingma sect monastery", "Clay statues dating back to the 17th century"],
    architecture: {
      style: "Tibetan",
      details: "The monastery has Tibetan architectural style and houses ancient clay statues and religious paintings. It has been rebuilt multiple times after fire damage."
    },
    festivals: [
      {
        name: "Monthly Lamas Prayers",
        description: "On the tenth day of every Tibetan calendar month, lamas recite hymns and special prayers are held morning and evening. The monastery is traditionally reserved for men."
      }
    ],
    culturalSignificance: "Sanga Choeling Monastery is an important religious and heritage site for Buddhism in Sikkim. Pilgrims visit it as part of a circuit that includes Pemayangtse Monastery, Rabdentse ruins, Khecheopalri Lake, Norbugang Chorten, Dubdi Monastery, Yuksom and Tashiding Monastery.",
    nearbyAttractions: ["Pemayangtse Monastery", "Rabdentse Ruins", "Khecheopalri Lake", "Norbugang Chorten", "Dubdi Monastery", "Yuksom", "Tashiding Monastery"],
    rating: 4.7,
    visitors: 26000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, September to December',
    altitude: 2150,
    region: "West Sikkim"
  },
  
  {
    name: "Tashiding Monastery",
    link: "https://en.wikipedia.org/wiki/Tashiding_Monastery",
    dataAvailable: true,
    location: {
      village: "Tashiding",
      district: "Gyalshing district",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.30833,
      longitude: 88.29806
    },
    established: 1717,
    foundedBy: "Ngadak Sempa Chenpo",
    sect: "Nyingma (Tibetan Buddhism)",
    architectureStyle: "Traditional Tibetan Buddhist monastery complex",
    description: "Tashiding Monastery is a Buddhist monastery of the Nyingma sect of Tibetan Buddhism located in Tashiding, about 27 km from Gyalshing in the Gyalshing district of Sikkim, India. It is considered one of the most sacred and holiest monasteries in Sikkim and is often described as the 'Heart of Sikkim/Denzong' due to its religious significance. The monastery is situated atop a hill rising between the Rathong Chu and Rangeet Rivers with views of Mt. Kanchenjunga in the backdrop. It is part of the traditional Buddhist pilgrimage circuit of Sikkim. The site was originally marked by a small Lhakhang built in the 17th century and was extended and renovated into the present monastery in 1717 during the reign of the third Chogyal Chakdor Namgyal.",
    imageUrl: "https://images.unsplash.com/photo-1580407196238-dac33f57c410?w=800",
    architecture: {
      style: "Traditional Tibetan Buddhist monastery complex",
      details: "The monastery complex features multiple buildings including the main Gompa (Chogyal Lhakhang), chortens, butter lamp houses, prayer wheels, and mani stone slabs inscribed with Buddhist mantras such as 'Om Mani Padme Hum'. Some parts have been renovated over time while older structures and chortens still exist on site."
    },
    features: ["Perched on a heart-shaped hill above the Rathong Chu and Rangeet rivers", "Considered the spiritual centre of Sikkim", "Part of the traditional Buddhist pilgrimage circuit", "Houses sacred chortens and mani stones with Buddhist inscriptions", "Revered as 'Devoted Central Glory' (Tashiding)"],
    festivals: [
      {
        name: "Bhumchu Festival",
        description: "The Bhumchu (holy water) festival is held annually on the 14th and 15th day of the first month of the Tibetan lunar calendar. A sacred vase filled with holy water stored at the monastery is opened for public display and worship. The level and purity of the water are interpreted as a prediction of prosperity or adversity for the coming year. Pilgrims from across Sikkim and beyond attend this major religious event."
      }
    ],
    culturalSignificance: "Tashiding Monastery is revered as one of the holiest sacred places in Sikkim. It is associated with local legends involving Guru Padmasambhava and the consecration of the first Chogyal of Sikkim. The monastery also holds great significance within the region's Buddhist pilgrimage circuit alongside other historic sites such as Dubdi Monastery and Pemayangtse Monastery.",
    nearbyAttractions: ["Dubdi Monastery", "Norbugang Chorten", "Pemayangtse Monastery", "Rabdentse Ruins", "Sanga Choeling Monastery", "Khecheopalri Lake"],
    rating: 4.9,
    visitors: 28000,
    openingHours: '6:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'October to May',
    altitude: 1465,
    region: "West Sikkim"
  },
  
  {
    name: "Bermiok Monastery",
    link: "https://en.wikipedia.org/wiki/Bermiok_Monastery",
    dataAvailable: true,
    location: {
      region: "South Sikkim",
      state: "Sikkim",
      country: "India"
    },
    coordinates: {
      latitude: 27.2262832,
      longitude: 88.4574415
    },
    established: 1873,
    foundedBy: null,
    sect: "Karma Kagyu (Tibetan Buddhism)",
    description: "Bermiok Monastery, also known as Bermiok Wosel Choling Monastery, is a Buddhist monastery in South Sikkim above Singtam. The monastery belongs to the Karma Kagyu lineage of Tibetan Buddhism and was founded in 1873. Due to earthquake damage, it was renovated and reconstructed in 1954. The premises feature a manilhakang built in 1954 and rebuilt in 1987, which houses statues of Amitābha and the chagtong chentong form of Avalokiteśvara.",
    imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800",
    architecture: {
      details: "The monastery features a manilhakang (prayer wheel house) constructed in 1954 and rebuilt in 1987, containing statues of Amitābha and the chagtong chentong form of Avalokiteśvara. The manilhakang has mani wheels around its structure."
    },
    features: ["Monastery of the Karma Kagyu lineage", "Manilhakang housing Buddha Amitābha and Avalokiteśvara statues", "Rebuilt structure after earthquakes"],
    rating: 4.4,
    visitors: 13000,
    openingHours: '7:00 AM - 5:00 PM',
    entryFee: 'Free',
    bestTimeToVisit: 'March to June, October to December',
    nearbyAttractions: ['Singtam', 'Gangtok'],
    region: "South Sikkim"
  }
];

module.exports = monasteries;
