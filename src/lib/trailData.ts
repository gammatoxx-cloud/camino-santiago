export interface Trail {
  id: string;
  name: string;
  description: string;
  level: string;
  elevation: string;
  distance: string;
  imagePath: string;
  mapsUrl: string;
}

export const trails: Trail[] = [
  {
    id: 'mission-trails',
    name: 'Mission Trails Regional Park (Visitor Center Loop)',
    description:
      'Mission Trails es enorme, pero el área del Centro de Visitantes ofrece la experiencia más accesible. Es una excelente caminata de introducción con vistas al río San Diego y monumentos históricos como la antigua presa Old Mission Dam.',
    level: 'Fácil a Moderado',
    elevation: '~200–400 ft (~60–120 m)',
    distance: '1.5–3 millas (dependiendo de la ruta)',
    imagePath: '/trails/mission-trails.jpg',
    mapsUrl: 'https://maps.app.goo.gl/Xc8ziCXQx1mtaMpu6',
  },
  {
    id: 'torrey-pines',
    name: 'Torrey Pines State Natural Reserve (Beach Trail)',
    description:
      'Este es, posiblemente, el sendero más escénico de la ciudad. Caminarás entre pinos poco comunes a lo largo de acantilados de arenisca antes de descender por una serie de escalones empinados directamente hacia la playa.',
    level: 'Fácil a Moderado',
    elevation: '~350 ft (~105 m)',
    distance: '2.3 millas (circuito)',
    imagePath: '/trails/torrey-pines.jpg',
    mapsUrl: 'https://maps.app.goo.gl/VbuPyTy7LU6XwARP7',
  },
  {
    id: 'cowles-mountain',
    name: 'Cowles Mountain (por Golfcrest Dr.)',
    description:
      'Al ser el punto más alto dentro de los límites de la ciudad de San Diego, esta es la caminata "fitness" más popular. Es un ascenso constante lleno de curvas cerradas (zigzags) que te recompensa con una vista de 360 grados de todo el condado.',
    level: 'Moderado a Difícil (debido a la inclinación)',
    elevation: '~910 ft (~277 m)',
    distance: '3.0 millas',
    imagePath: '/trails/cowles-mountain.jpg',
    mapsUrl: 'https://maps.app.goo.gl/h7teXPaABccASVn88',
  },
  {
    id: 'iron-mountain',
    name: 'Iron Mountain',
    description:
      'Ubicado en Poway, este sendero es famoso por su paisaje lleno de enormes rocas y lilas silvestres en primavera. Es un poco más largo que Cowles, pero generalmente tiene una inclinación más gradual.',
    level: 'Moderado',
    elevation: '~1,100 ft (~335 m)',
    distance: '5.8 millas',
    imagePath: '/trails/iron-mountain.jpg',
    mapsUrl: 'https://maps.app.goo.gl/uiAQfVFDifXEU4FbA',
  },
  {
    id: 'penasquitos-canyon',
    name: 'Los Peñasquitos Canyon Preserve',
    description:
      'Este es un sendero relativamente plano y con sombra, perfecto para una caminata larga o para ciclismo de montaña. Lo más destacado es una pequeña cascada y un arroyo a mitad del cañón.',
    level: 'Fácil (mayormente plano)',
    elevation: '~150 ft (~45 m)',
    distance: '7.0 millas (hasta la cascada e ida y vuelta)',
    imagePath: '/trails/penasquitos-canyon.jpg',
    mapsUrl: 'https://maps.app.goo.gl/VTLGSFLDxyHbs5DZ7',
  },
  {
    id: 'mount-woodson',
    name: 'Mount Woodson ("Potato Chip Rock")',
    description:
      'Esta es una caminata extenuante y muy expuesta al sol que comienza desde el lago Poway. Es mundialmente famosa por la delgada lámina de roca en la cima que permite fotos increíbles.',
    level: 'Difícil/Extenuante',
    elevation: '~2,100 ft (~640 m)',
    distance: '7.5 millas',
    imagePath: '/trails/mount-woodson.jpg',
    mapsUrl: 'https://maps.app.goo.gl/2Y5Xi52GeyBLrthY6',
  },
  {
    id: 'annies-canyon',
    name: "Annie's Canyon Trail",
    description:
      'Ubicado en la laguna de San Elijo, este sendero ofrece una experiencia única de "cañón de ranura" (slot canyon). Tendrás que navegar por paredes estrechas de arenisca y subir algunas escaleras metálicas para llegar a un mirador con vista a la laguna y al Océano Pacífico.',
    level: 'Fácil a Moderado (la sección del cañón es estrecha)',
    elevation: '~200 ft (~60 m)',
    distance: '1.5 millas',
    imagePath: '/trails/annies-canyon.jpg',
    mapsUrl: 'https://maps.app.goo.gl/29eqBvTNbsBF1BMs7',
  },
  {
    id: 'batiquitos-lagoon',
    name: 'Batiquitos Lagoon',
    description:
      'Sendero costero muy llano. Es ideal para los primeros días de entrenamiento con la mochila cargada para acostumbrar los hombros sin castigar las rodillas.',
    level: 'Fácil',
    elevation: '~50 ft (~15 m)',
    distance: '5.4 km',
    imagePath: '/batiquitos1.jpg',
    mapsUrl: 'https://maps.app.goo.gl/ejJfA8MdRJYerpRv9',
  },
  {
    id: 'lake-hodges',
    name: 'Lake Hodges',
    description:
      'Rutas extensas y llanas. Es el mejor lugar para entrenar la "distancia pura" y simular una etapa completa del Camino (20-25 km) en un solo día.',
    level: 'Fácil',
    elevation: '~150 ft (~45 m)',
    distance: 'Hasta 30 km',
    imagePath: '/lakehodges1.jpg',
    mapsUrl: 'https://maps.app.goo.gl/5i89T3GW7MDFLxnb6',
  },
  {
    id: 'black-mountain',
    name: 'Black Mountain',
    description:
      'Subida moderada con terreno de grava suelta. Muy similar a las bajadas pedregosas que encontrarás en los montes de León o Castilla.',
    level: 'Moderado',
    elevation: '~1,200 ft (~365 m)',
    distance: '6.5 km',
    imagePath: '/blackmountain.jpg',
    mapsUrl: 'https://maps.app.goo.gl/HhUhxuD4Sh6zPVSy5',
  },
  {
    id: 'blue-sky-ecological-reserve',
    name: 'Blue Sky Ecological Reserve',
    description:
      'Un sendero sombreado con una subida final fuerte. Perfecto para practicar el control de la respiración con peso.',
    level: 'Moderado a Difícil',
    elevation: '~800 ft (~245 m)',
    distance: '8.5 km',
    imagePath: '/blueskyreserve.webp',
    mapsUrl: 'https://maps.app.goo.gl/eGv6szPrUJpU1sC49',
  },
  {
    id: 'double-peak-park',
    name: 'Double Peak Park',
    description:
      'Pendiente constante y algunas zonas pavimentadas. Simula perfectamente las entradas a pueblos gallegos que suelen ser en cuesta arriba.',
    level: 'Moderado',
    elevation: '~500 ft (~150 m)',
    distance: '6.5 km',
    imagePath: '/doublepeak1.jpg',
    mapsUrl: 'https://maps.app.goo.gl/R9W12k9XauVCEj6c9',
  },
  {
    id: 'calavera-lake',
    name: 'Calavera Lake',
    description:
      'Terreno volcánico con muchas variantes. Excelente para entrenar la agilidad de los pies en senderos estrechos y técnicos.',
    level: 'Moderado',
    elevation: '~600 ft (~180 m)',
    distance: '7.8 km',
    imagePath: '/calavera1.webp',
    mapsUrl: 'https://maps.app.goo.gl/TygWgidQQeJppEWc7',
  },
  {
    id: 'el-cajon-mountain',
    name: 'El Cajon Mountain',
    description:
      'Extremadamente difícil debido a sus constantes subidas y bajadas ("rompepiernas"). Solo para cuando ya tengan una base sólida de entrenamiento.',
    level: 'Difícil/Extenuante',
    elevation: '~3,400 ft (~1,035 m)',
    distance: '17.7 km',
    imagePath: '/cajonmountain1.jpg',
    mapsUrl: 'https://maps.app.goo.gl/H6jdfpVoFX1iaojz5',
  },
  {
    id: 'stonewall-peak',
    name: 'Stonewall Peak',
    description:
      'Senderos en zig-zag (switchbacks). Ideal para practicar el uso de los bastones de senderismo en ascenso y descenso.',
    level: 'Moderado',
    elevation: '~900 ft (~275 m)',
    distance: '6.4 km',
    imagePath: '/stonewallpeak.jpg',
    mapsUrl: 'https://maps.app.goo.gl/SBNrdTYveHbCWzUt7',
  },
  {
    id: 'cuyamaca-peak',
    name: 'Cuyamaca Peak',
    description:
      'Entrenamiento de gran altitud y desniveles importantes. Es lo más parecido a cruzar los Pirineos o subir a O Cebreiro.',
    level: 'Difícil/Extenuante',
    elevation: '~2,000 ft (~610 m)',
    distance: '12.3 km',
    imagePath: '/cuyamaca.jpg',
    mapsUrl: 'https://maps.app.goo.gl/K85M8zAZza42Qays7',
  },
  {
    id: 'volcan-mountain',
    name: 'Volcan Mountain',
    description:
      'Paisaje boscoso y aire de montaña. Ofrece un entorno muy similar a los bosques de eucaliptos y robles de las etapas gallegas.',
    level: 'Moderado',
    elevation: '~1,400 ft (~425 m)',
    distance: '8.2 km',
    imagePath: '/volcanmountain.webp',
    mapsUrl: 'https://maps.app.goo.gl/Gqy1qXNJyH8BBH9LA',
  },
  {
    id: 'san-elijo-lagoon',
    name: 'San Elijo Lagoon',
    description:
      'Senderos costeros muy planos. Ideal para caminatas suaves, recuperación activa y entrenamiento de ritmo constante.',
    level: 'Fácil',
    elevation: '~50 ft (~15 m)',
    distance: 'Hasta 7 km',
    imagePath: '/sanelijo.jpg',
    mapsUrl: 'https://maps.google.com/?q=San+Elijo+Lagoon+Ecological+Reserve',
  },
  {
    id: 'morrison-pond-sweetwater',
    name: 'Morrison Pond – Sweetwater Summit Regional Park',
    description:
      'Caminata tranquila alrededor de lagunas con terreno firme. Ideal para entrenamientos iniciales y caminatas sociales.',
    level: 'Fácil',
    elevation: '~50 ft (~15 m)',
    distance: '5–6 km',
    imagePath: '/summit_regional.webp',
    mapsUrl: 'https://maps.google.com/?q=Morrison+Pond+Sweetwater+Summit+Regional+Park',
  },
  {
    id: 'guajome-regional-park',
    name: 'Guajome Regional Park',
    description:
      'Senderos planos alrededor de lagunas. Perfecto para personas que inician o días de recuperación activa.',
    level: 'Fácil',
    elevation: '~50 ft (~15 m)',
    distance: '5–7 km',
    imagePath: '/guajome.jpg',
    mapsUrl: 'https://maps.google.com/?q=Guajome+Regional+Park',
  },
  {
    id: 'ramona-grasslands',
    name: 'Ramona Grasslands County Preserve',
    description:
      'Terreno abierto y mayormente plano. Ideal para trabajar postura, respiración y paso sostenido.',
    level: 'Fácil',
    elevation: '~100 ft (~30 m)',
    distance: 'Hasta 8 km',
    imagePath: '/Ramona_Grasslands_trail.jpeg',
    mapsUrl: 'https://maps.google.com/?q=Ramona+Grasslands+County+Preserve',
  },
  {
    id: 'penasquitos-canyon-extended',
    name: 'Los Peñasquitos Canyon Preserve',
    description:
      'Sendero largo y amplio. Excelente para empezar a sumar kilómetros de forma segura.',
    level: 'Fácil',
    elevation: '~150 ft (~45 m)',
    distance: 'Hasta 11 km',
    imagePath: '/penasquitos_falls.jpg',
    mapsUrl: 'https://maps.google.com/?q=Los+Pe%C3%B1asquitos+Canyon+Preserve',
  },
  {
    id: 'louis-stelzer-county-park',
    name: 'Louis A. Stelzer County Park',
    description:
      'Colinas suaves y terreno irregular. Ideal para fortalecer piernas y resistencia progresiva.',
    level: 'Moderado',
    elevation: '~400 ft (~120 m)',
    distance: '6–8 km',
    imagePath: '/stelzer_park.jpg',
    mapsUrl: 'https://maps.google.com/?q=Luis+A+Stelzer+County+Park',
  },
  {
    id: 'del-dios-highlands',
    name: 'Del Dios Highlands County Preserve',
    description:
      'Subidas y bajadas constantes. Muy bueno para estabilidad y control de respiración.',
    level: 'Moderado',
    elevation: '~600 ft (~180 m)',
    distance: '8–10 km',
    imagePath: '/deldios.jpg',
    mapsUrl: 'https://maps.google.com/?q=Del+Dios+Highlands+County+Preserve',
  },
  {
    id: 'sycamore-canyon-goodan-ranch',
    name: 'Sycamore Canyon / Goodan Ranch',
    description:
      'Senderos amplios con desniveles moderados. Ideal para caminatas largas sin ser técnicas.',
    level: 'Moderado',
    elevation: '~500 ft (~150 m)',
    distance: '8–12 km',
    imagePath: '/sycamore_canyon.jpg',
    mapsUrl: 'https://maps.google.com/?q=Sycamore+Canyon+Goodan+Ranch',
  },
  {
    id: 'wilderness-gardens',
    name: 'Wilderness Gardens County Preserve',
    description:
      'Caminata natural con cambios de elevación y sombra. Buena para resistencia media.',
    level: 'Moderado',
    elevation: '~450 ft (~135 m)',
    distance: '6–9 km',
    imagePath: '/wilderness_gardens.jpeg',
    mapsUrl: 'https://maps.google.com/?q=Wilderness+Gardens+County+Preserve',
  },
  {
    id: 'el-monte-county-park',
    name: 'El Monte County Park',
    description:
      'Colinas suaves y senderos tranquilos. Buen balance entre reto físico y caminata recreativa.',
    level: 'Moderado',
    elevation: '~350 ft (~105 m)',
    distance: '6–8 km',
    imagePath: '/el_monte.jpeg',
    mapsUrl: 'https://maps.google.com/?q=El+Monte+County+Park+Lakeside',
  },
  {
    id: 'santa-ysabel-east',
    name: 'Santa Ysabel East County Preserve',
    description:
      'Subidas pronunciadas y terreno irregular. Recomendado para caminantes con base sólida.',
    level: 'Difícil',
    elevation: '~1,200 ft (~365 m)',
    distance: '8–12 km',
    imagePath: '/santa_ysabel.jpg',
    mapsUrl: 'https://maps.google.com/?q=Santa+Ysabel+East+County+Preserve',
  },
  {
    id: 'hellhole-canyon',
    name: 'Hellhole Canyon County Preserve',
    description:
      'Terreno demandante y clima retador. Ideal para fortaleza física y mental.',
    level: 'Difícil',
    elevation: '~1,500 ft (~455 m)',
    distance: '10–12 km',
    imagePath: '/hell_hole_canyon.webp',
    mapsUrl: 'https://maps.google.com/?q=Hellhole+Canyon+County+Preserve',
  },
  {
    id: 'mount-gower',
    name: 'Mount Gower County Preserve',
    description:
      'Subidas largas y sostenidas. Excelente preparación para etapas duras del Camino.',
    level: 'Difícil',
    elevation: '~1,800 ft (~550 m)',
    distance: '10–14 km',
    imagePath: '/mount_gower.webp',
    mapsUrl: 'https://maps.google.com/?q=Mount+Gower+County+Preserve',
  },
];

