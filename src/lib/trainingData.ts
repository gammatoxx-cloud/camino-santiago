import type { Week, Phase, WalkCompletion } from '../types';

// Phase definitions
export const phases: Phase[] = [
  {
    number: 1,
    name: 'Adaptación',
    weeks: [1, 2, 3, 4, 5, 6, 7, 8],
    description: 'Construye la base. Enfócate en establecer un hábito constante de caminata y aprender la técnica adecuada.',
    goals: [
      'Establecer una rutina constante de caminata',
      'Aprender la técnica adecuada de caminata',
      'Desarrollar resistencia básica',
      'Familiarizarse con el equipo'
    ],
    learning: [
      'Técnica y postura adecuadas para caminar',
      'Patrones de respiración',
      'Cuidado básico de los pies',
      'Familiarización con el equipo'
    ]
  },
  {
    number: 2,
    name: 'Aumento Progresivo',
    weeks: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    description: 'Aumenta gradualmente la distancia e introduce subidas suaves. Desarrolla resistencia sistemáticamente.',
    goals: [
      'Aumentar la distancia semanal a 20-30km',
      'Introducir entrenamiento en subidas',
      'Desarrollar resistencia cardiovascular',
      'Mejorar la eficiencia al caminar'
    ],
    learning: [
      'Técnica para subidas',
      'Estrategia de hidratación',
      'Estiramiento dinámico',
      'Momento de nutrición'
    ]
  },
  {
    number: 3,
    name: 'Consolidación',
    weeks: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36],
    description: 'Consolida tu progreso con caminatas más largas e introduce elementos de fortalecimiento.',
    goals: [
      'Mantener distancia semanal de 25-40km',
      'Desarrollar fuerza y resistencia',
      'Introducir entrenamiento cruzado',
      'Desarrollar resiliencia mental'
    ],
    learning: [
      'Manejo de ritmo sostenido',
      'Estrategias mentales para caminatas largas',
      'Entrenamiento con mochila',
      'Trabajo opcional de core y fuerza'
    ]
  },
  {
    number: 4,
    name: 'Resistencia Avanzada',
    weeks: [37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
    description: 'Prepárate para caminatas de larga distancia con sesiones extendidas y práctica con equipo completo.',
    goals: [
      'Completar 40-55km semanales',
      'Dominar el ritmo de larga distancia',
      'Practicar con equipo completo',
      'Desarrollar resistencia mental'
    ],
    learning: [
      'Estrategias de ritmo para todo el día',
      'Técnicas de resistencia mental',
      'Configuración y manejo de equipo completo',
      'Resistencia al clima'
    ]
  },
  {
    number: 5,
    name: 'Preparación Máxima',
    weeks: [49, 50, 51, 52],
    description: 'Fase final de preparación con distancias máximas seguidas de reducción gradual. Confía en tu entrenamiento.',
    goals: [
      'Completar caminatas de distancia máxima',
      'Preparación mental',
      'Reducir gradualmente y descansar',
      'Confiar en tu entrenamiento'
    ],
    learning: [
      'Confiar en tu entrenamiento',
      'Preparación mental para el Camino',
      'Importancia del descanso y recuperación',
      'Revisión final de equipo'
    ]
  }
];

// Generate all 52 weeks of training
function generateWeeks(): Week[] {
  const weeks: Week[] = [];

  // Phase 1: Adaptation (Weeks 1-8)
  // Week 1-2: Mon 3km, Wed 3km, Fri 3km (9km total)
  for (let week = 1; week <= 2; week++) {
    weeks.push({
      weekNumber: week,
      phaseNumber: 1,
      days: [
        { day: 'Monday', distance: 3, focus: 'Enfócate en la postura y la respiración' },
        { day: 'Wednesday', distance: 3, focus: 'Mantén un ritmo constante' },
        { day: 'Friday', distance: 3, focus: 'Practica la colocación adecuada de los pies' }
      ],
      weeklyTotal: 9
    });
  }

  // Week 3-4: Mon 3km, Wed 4km, Fri 3km, Sun 4km (14km total)
  for (let week = 3; week <= 4; week++) {
    weeks.push({
      weekNumber: week,
      phaseNumber: 1,
      days: [
        { day: 'Monday', distance: 3, focus: 'Calienta adecuadamente' },
        { day: 'Wednesday', distance: 4, focus: 'Desarrolla resistencia gradualmente' },
        { day: 'Friday', distance: 3, focus: 'Enfócate en la técnica' },
        { day: 'Sunday', distance: 4, focus: 'Disfruta el recorrido' }
      ],
      weeklyTotal: 14
    });
  }

  // Week 5-6: Mon 4km, Wed 4km, Fri 4km, Sun 4km (16km total)
  for (let week = 5; week <= 6; week++) {
    weeks.push({
      weekNumber: week,
      phaseNumber: 1,
      days: [
        { day: 'Monday', distance: 4, focus: 'Ritmo constante' },
        { day: 'Wednesday', distance: 4, focus: 'Ritmo de respiración' },
        { day: 'Friday', distance: 4, focus: 'Conciencia de postura' },
        { day: 'Sunday', distance: 4, focus: 'Caminata de recuperación' }
      ],
      weeklyTotal: 16
    });
  }

  // Week 7-8: Mon 4km, Tue 4km, Thu 4km, Sat 4km (16km total)
  for (let week = 7; week <= 8; week++) {
    weeks.push({
      weekNumber: week,
      phaseNumber: 1,
      days: [
        { day: 'Monday', distance: 4, focus: 'Desarrolla consistencia' },
        { day: 'Tuesday', distance: 4, focus: 'Refinamiento de técnica' },
        { day: 'Thursday', distance: 4, focus: 'Desarrollo de resistencia' },
        { day: 'Saturday', distance: 4, focus: 'Fuerza del fin de semana' }
      ],
      weeklyTotal: 16
    });
  }

  // Phase 2: Progressive Increase (Weeks 9-20)
  // 4 walks per week, progressive 0.5-1km increases, 20-30km weekly
  let baseDistance = 4.5;
  for (let week = 9; week <= 20; week++) {
    const weekInPhase = week - 8;
    const distance1 = Math.round(baseDistance * 10) / 10;
    const distance2 = Math.round((baseDistance + 0.5) * 10) / 10;
    const distance3 = Math.round((baseDistance + 1) * 10) / 10;
    const distance4 = Math.round((baseDistance + 1.5) * 10) / 10;
    const weeklyTotal = distance1 + distance2 + distance3 + distance4;

    weeks.push({
      weekNumber: week,
      phaseNumber: 2,
      days: [
        { day: 'Monday', distance: distance1, focus: weekInPhase <= 4 ? 'Introduce subidas suaves' : 'Práctica de técnica para subidas' },
        { day: 'Wednesday', distance: distance2, focus: 'Aumento progresivo de distancia' },
        { day: 'Friday', distance: distance3, focus: 'Desarrollo de resistencia' },
        { day: 'Sunday', distance: distance4, focus: 'Caminata de recuperación más larga' }
      ],
      weeklyTotal: Math.round(weeklyTotal * 10) / 10
    });

    baseDistance += 0.5;
  }

  // Phase 3: Consolidation (Weeks 21-36)
  // 4-5 walks per week, 6-10km, 25-40km weekly
  let phase3Distance = 6;
  for (let week = 21; week <= 36; week++) {
    const weekInPhase = week - 20;
    const isLongWeek = weekInPhase % 3 === 0; // Every 3rd week has 5 walks
    
    if (isLongWeek) {
      // 5 walks: Mon, Tue, Thu, Fri, Sun
      const distance1 = phase3Distance;
      const distance2 = phase3Distance;
      const distance3 = phase3Distance + 1;
      const distance4 = phase3Distance;
      const distance5 = phase3Distance + 2;
      const weeklyTotal = distance1 + distance2 + distance3 + distance4 + distance5;

      weeks.push({
        weekNumber: week,
        phaseNumber: 3,
        days: [
          { day: 'Monday', distance: distance1, focus: 'Fuerza de inicio de semana' },
          { day: 'Tuesday', distance: distance2, focus: 'Desarrollo de consistencia' },
          { day: 'Thursday', distance: distance3, focus: 'Desafío de mitad de semana' },
          { day: 'Friday', distance: distance4, focus: 'Enfoque en técnica' },
          { day: 'Sunday', distance: distance5, focus: 'Caminata larga de fin de semana' }
        ],
        weeklyTotal: weeklyTotal
      });
    } else {
      // 4 walks: Mon, Wed, Fri, Sun
      const distance1 = phase3Distance;
      const distance2 = phase3Distance + 1;
      const distance3 = phase3Distance;
      const distance4 = phase3Distance + 2;
      const weeklyTotal = distance1 + distance2 + distance3 + distance4;

      weeks.push({
        weekNumber: week,
        phaseNumber: 3,
        days: [
          { day: 'Monday', distance: distance1, focus: 'Práctica de ritmo sostenido' },
          { day: 'Wednesday', distance: distance2, focus: 'Enfoque en resistencia' },
          { day: 'Friday', distance: distance3, focus: 'Desarrollo de fuerza' },
          { day: 'Sunday', distance: distance4, focus: 'Caminata de larga distancia' }
        ],
        weeklyTotal: weeklyTotal
      });
    }

    if (weekInPhase % 4 === 0) {
      phase3Distance += 0.5;
    }
  }

  // Phase 4: Advanced Endurance (Weeks 37-48)
  // 4-5 walks per week, 12-20km long walks, 40-55km weekly
  let phase4Base = 8;
  let phase4Long = 12;
  for (let week = 37; week <= 48; week++) {
    const weekInPhase = week - 36;
    const isLongWeek = weekInPhase % 2 === 0; // Every other week has 5 walks
    
    if (isLongWeek) {
      // 5 walks with longer distances
      const distance1 = phase4Base;
      const distance2 = phase4Base + 1;
      const distance3 = phase4Base + 2;
      const distance4 = phase4Base;
      const distance5 = phase4Long; // Long walk
      const weeklyTotal = distance1 + distance2 + distance3 + distance4 + distance5;

      weeks.push({
        weekNumber: week,
        phaseNumber: 4,
        days: [
          { day: 'Monday', distance: distance1, focus: 'Práctica de ritmo para todo el día' },
          { day: 'Tuesday', distance: distance2, focus: 'Desarrollo de resistencia' },
          { day: 'Thursday', distance: distance3, focus: 'Mantenimiento de fuerza' },
          { day: 'Friday', distance: distance4, focus: 'Caminata de recuperación' },
          { day: 'Sunday', distance: distance5, focus: 'Desafío de larga distancia' }
        ],
        weeklyTotal: weeklyTotal
      });
    } else {
      // 4 walks with one long walk
      const distance1 = phase4Base;
      const distance2 = phase4Base + 2;
      const distance3 = phase4Base + 1;
      const distance4 = phase4Long; // Long walk
      const weeklyTotal = distance1 + distance2 + distance3 + distance4;

      weeks.push({
        weekNumber: week,
        phaseNumber: 4,
        days: [
          { day: 'Monday', distance: distance1, focus: 'Inicio de semana' },
          { day: 'Wednesday', distance: distance2, focus: 'Resistencia de mitad de semana' },
          { day: 'Friday', distance: distance3, focus: 'Enfoque en fuerza' },
          { day: 'Sunday', distance: distance4, focus: 'Preparación de larga distancia' }
        ],
        weeklyTotal: weeklyTotal
      });
    }

    if (weekInPhase % 3 === 0) {
      phase4Base += 0.5;
      phase4Long += 1;
    }
  }

  // Phase 5: Peak Preparation (Weeks 49-52)
  // Week 49: 18km long walk, total 42km
  weeks.push({
    weekNumber: 49,
    phaseNumber: 5,
    days: [
      { day: 'Monday', distance: 8, focus: 'Inicio de semana máxima' },
      { day: 'Wednesday', distance: 10, focus: 'Construir hacia el máximo' },
      { day: 'Friday', distance: 6, focus: 'Recuperación antes de caminata larga' },
      { day: 'Sunday', distance: 18, focus: 'Caminata larga de distancia máxima' }
    ],
    weeklyTotal: 42
  });

  // Week 50: 22km long walk, total 38km
  weeks.push({
    weekNumber: 50,
    phaseNumber: 5,
    days: [
      { day: 'Monday', distance: 6, focus: 'Recuperación del máximo' },
      { day: 'Wednesday', distance: 5, focus: 'Mantenimiento ligero' },
      { day: 'Friday', distance: 5, focus: 'Ritmo fácil' },
      { day: 'Sunday', distance: 22, focus: 'Distancia larga máxima' }
    ],
    weeklyTotal: 38
  });

  // Week 51: 12km, total 23km
  weeks.push({
    weekNumber: 51,
    phaseNumber: 5,
    days: [
      { day: 'Monday', distance: 5, focus: 'Comenzar reducción gradual' },
      { day: 'Wednesday', distance: 6, focus: 'Distancia moderada' },
      { day: 'Saturday', distance: 12, focus: 'Caminata larga final' }
    ],
    weeklyTotal: 23
  });

  // Week 52: Taper week, 6-8km total
  weeks.push({
    weekNumber: 52,
    phaseNumber: 5,
    days: [
      { day: 'Monday', distance: 3, focus: 'Movimiento ligero' },
      { day: 'Wednesday', distance: 2, focus: 'Caminata fácil' },
      { day: 'Friday', distance: 3, focus: 'Preparación final' }
    ],
    weeklyTotal: 8
  });

  return weeks;
}

export const allWeeks: Week[] = generateWeeks();

// Helper functions
export function getWeekByNumber(weekNumber: number): Week | undefined {
  return allWeeks.find(w => w.weekNumber === weekNumber);
}

export function getPhaseByNumber(phaseNumber: number): Phase | undefined {
  return phases.find(p => p.number === phaseNumber);
}

export function getCurrentPhase(weekNumber: number): Phase | undefined {
  const week = getWeekByNumber(weekNumber);
  if (!week) return undefined;
  return getPhaseByNumber(week.phaseNumber);
}

export function getWeeksInPhase(phaseNumber: number): Week[] {
  return allWeeks.filter(w => w.phaseNumber === phaseNumber);
}

/**
 * Check if a specific phase is complete by verifying all weeks in that phase
 * have all their days completed
 */
export function checkPhaseCompletion(
  phaseNumber: number,
  allCompletions: WalkCompletion[]
): boolean {
  const weeksInPhase = getWeeksInPhase(phaseNumber);
  
  for (const week of weeksInPhase) {
    // Get all completions for this week
    const weekCompletions = allCompletions.filter(
      (c) => c.week_number === week.weekNumber
    );
    
    // Check if all days in this week are completed
    const completedDays = weekCompletions.map((c) => c.day_of_week);
    const requiredDays = week.days.map((d) => d.day);
    
    // Check if we have all required days
    const allDaysComplete = requiredDays.every((day) =>
      completedDays.includes(day)
    );
    
    if (!allDaysComplete) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get array of completed phase numbers (1-5) based on walk completions
 */
export function getCompletedPhases(allCompletions: WalkCompletion[]): number[] {
  const completedPhases: number[] = [];
  
  for (let phaseNumber = 1; phaseNumber <= 5; phaseNumber++) {
    if (checkPhaseCompletion(phaseNumber, allCompletions)) {
      completedPhases.push(phaseNumber);
    }
  }
  
  return completedPhases;
}

