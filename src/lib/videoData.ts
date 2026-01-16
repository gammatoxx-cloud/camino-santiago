export interface Video {
  id: string;
  url: string;
  title: string;
  description: string;
}

export interface VideoSection {
  id: string;
  weekRange: string;
  title: string;
  videos: Video[];
}

// Extract YouTube video ID from URL
function extractVideoId(url: string): string {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
  const match = url.match(regex);
  return match ? match[1] : '';
}

// Helper function to create video object
function createVideo(url: string, title: string, description: string): Video {
  return {
    id: extractVideoId(url),
    url,
    title,
    description,
  };
}

export const videoSections: VideoSection[] = [
  {
    id: 'semanas-1-4',
    weekRange: 'Semanas 1–4',
    title: 'Inspiración y Contexto',
    videos: [
      createVideo(
        'https://www.youtube.com/watch?v=EFjZLyIPewc',
        'Historia y significado del Camino de Santiago',
        '¿Sabes cuál es el origen del Camino de Santiago? ¿Cómo surgió? ¿Quiénes fueron los primeros peregrinos? ¿Qué es el Códice Calixtino o el Año Santo Jacobeo? Hoy conocemos como Camino de Santiago a un conjunto de rutas de peregrinación que se dirigen a la ciudad de Santiago de Compostela a rendir culto al apóstol Santiago.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=_OPyER9UtNU',
        'Camino de Santiago – Ruta Francesa | Documental Completo',
        'Documental que muestra pueblos, paisajes y la experiencia real del Camino Francés.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=eswDoKBpEgc',
        'Estiramiento antes o después del ejercicio',
        'Los estiramientos musculares son una de las herramientas más útiles, efectivas y necesarias en cualquier tratamiento de fisioterapia, en esta colección de vídeos desgrano todas las características de los estiramientos para que cualquier persona pueda estirar de una forma más correcta, sana y efectiva.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=-92qwf-XgjY',
        '4 simple exercises that will help you walk better',
        'In this video, we offer you a routine of four simple exercises that will help you walk much better and This way, if you also enjoy running, you can do it more effectively without disrupting the natural mechanics of these activities.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=ylFtVYbgXO0',
        'Cómo respirar correctamente mientras caminas',
        'En este vídeo te enseñamos a llevar el ritmo adecuado de respiración mientras estás de ruta.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=kXMq1JE_F4E',
        'Cómo respirar mientras caminas',
        'Técnicas de respiración para caminar con mayor control y menor fatiga.'
      ),
    ],
  },
  {
    id: 'semanas-5-10',
    weekRange: 'Semanas 5–10',
    title: 'Preparación Realista',
    videos: [
      createVideo(
        'https://www.youtube.com/watch?v=3MSRUsnf2Gg',
        'Guía completa del Camino Francés',
        'Consejos sobre planificación, ritmo, descanso y logística.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=blK3IF51B0M',
        'Vida diaria en el Camino Francés',
        'Cómo funcionan albergues, comidas y rutinas del peregrino.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=lVEnNfBd-aU',
        'Como evitar Ampollas en los Pies haciendo el Camino',
        'Descubrirás todos los trucos, remedios y productos que son esenciales para evitar las tan molestas ampollas y poder hacer todo el camino de la manera más cómoda posible 🦶'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=Q3fb16ZYfzA',
        'Camino de Santiago: 5 consejos para evitar lesiones',
        'La región anatómica que más sufre cuando caminamos es el pie; en él la lesión más frecuente y que causa más incomodidad a los peregrinos es la ampolla. En IQTRA hemos consultado con nuestra podóloga y nos ha explicado cómo podemos entrenar nuestros pies para que no aparezcan ampollas.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=jhbcJl13ytE',
        'Cómo evitar ampollas en el Camino de Santiago. Recomendaciones para elegir calcetines.',
        'En este video comparto mis mejores consejos para cuidar tus pies en el Camino y evitar que las ampollas arruinen tu experiencia como peregrino. También hablamos de algo fundamental: los calcetines. Te cuento qué tejidos funcionan mejor (como la lana merino), por qué es clave que sean ajustados, secos y sin pliegues, y cómo elegir los adecuados para disfrutar de cada etapa sin dolor.'
      ),
    ],
  },
  {
    id: 'semanas-11-24',
    weekRange: 'Semanas 11–24',
    title: 'Técnica, Cuerpo y Prevención',
    videos: [
      createVideo(
        'https://www.youtube.com/watch?v=yQ9OvR7wNS0',
        'Cómo entrenar para el Camino de Santiago',
        'Recomendaciones físicas y de resistencia.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=Fbh2_XaT0Og',
        'Técnica correcta para caminar largas distancias',
        'Mejora postura y eficiencia.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=-8SdBUvPeBg',
        'Uso correcto de bastones de senderismo',
        'Explica cómo usar bastones correctamente.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=AIOgfF3lFxs',
        'Preparación física para hacer senderismo, ejercicios y recomendaciones',
        '¿Quieres mejorar tu rendimiento y disfrutar al máximo de tus rutas de senderismo? En este video te enseñamos los mejores ejercicios y consejos para estar en forma y preparado para cualquier aventura en la naturaleza. Desde cardio hasta fortalecimiento, ¡todo lo que necesitas está aquí!'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=gBkLvdSnoio',
        'Prepara tus pies antes de salir de ruta',
        '¿Quieres mejorar tu rendimiento y disfrutar al máximo de tus rutas de senderismo? En este video te enseñamos los mejores ejercicios y consejos para estar en forma y preparado para cualquier aventura en la naturaleza. Desde cardio hasta fortalecimiento, ¡todo lo que necesitas está aquí!'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=n4jaHkUeBTk',
        'Cuidado de tus pies tras una caminata',
        'Aprende a mimar tus pies cuando vuelvas de excursión, para evitar ampollas, rozaduras y otros problemas.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=b1rAXS0-FL4',
        'Conoce tu condición física: la ruta de prueba',
        'En senderismo, antes de realizar tu primera excursión, te aconsejamos que estimes tu condición física siguiendo los consejos que te damos en este tutorial. Hacerlo te servirá para conocer tus límites y adaptarte a ellos. Así, podrás establecer metas realistas antes de comenzar la ruta.'
      ),
    ],
  },
  {
    id: 'semanas-25-36',
    weekRange: 'Semanas 25–36',
    title: 'Equipo, Alimentación y Autocuidado',
    videos: [
      createVideo(
        'https://www.youtube.com/watch?v=pCTO2rnR3Lw',
        'Cómo elegir el calzado para el Camino de Santiago',
        'Guía para seleccionar calzado adecuado.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=0s2JmKKzWqA',
        'Qué llevar en la mochila del peregrino',
        'Equipaje esencial y qué evitar.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=nFOWVqG47YU',
        '¿Qué debo comer durante la ruta?',
        'Con este tutorial aprenderás qué alimentos debes comer durante tus excursiones, en qué momentos y cuánta cantidad. Conocer esta información resulta esencial para que mantengas siempre un nivel de energía óptimo y puedas conseguir tus objetivos.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=_HOTMHFpQ7U',
        '¿Cuál es la mejor comida para una excursión?',
        'Si vas a salir de ruta y no sabes qué alimentos debes llevar, ni cuánta cantidad, ¡aquí tienes la respuesta! Recuerda que la alimentación es una parte esencial de los preparativos de tu excursión. Aprende qué comer y cuándo hacerlo para reponer tus energías tras el esfuerzo realizado y disfrutar de la caminata.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=jV26kIFugaw',
        '¿Qué beber y cuánta cantidad?',
        'Aprende a mantener tu cuerpo hidratado durante tu ruta bebiendo agua y otros líquidos a menudo y comiendo alimentos que te aportarán la energía necesaria.'
      ),
      createVideo(
        'https://www.youtube.com/watch?v=olNIKawCyGI',
        'Equiparse: hidratación para senderismo',
        'Hidratación y mineralización. Beba agua, no esperete ner sed, ésta es el primer síntoma de la deshidratación. En cada descanso debe tomarse 1/8 de litro (125 ml) más o menos. Una persona mal hidratada rinde menos que la que está en el balance correcto del agua.'
      ),
    ],
  },
  {
    id: 'semanas-37-52',
    weekRange: 'Semanas 37–52',
    title: 'Cierre, Motivación y Visualización',
    videos: [
      createVideo(
        'https://www.youtube.com/watch?v=MeDgp36cc-U',
        'Llegar a Santiago de Compostela',
        'La experiencia final y llegada a la Catedral.'
      ),
    ],
  },
];

