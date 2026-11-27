import sistemaData from '../data/sistema.json';
import { parseDieFaces } from './diceRoller';

export const INITIAL_CHARACTER = {
  // Metadados
  nome: "",
  foto: null,       // Base64 ou URL da foto do personagem
  atuacao: "",      // Começa vazio para o jogador escolher
  caminho: "",      // Começa vazio para o jogador escolher
  karmaAtual: "Neutro", // Positivo, Neutro, Negativo
  nivelPessoal: 1,
  pontosCaos: 1,    // Pontos de Caos editáveis na ficha
  maxPontosCaos: 1, // Máximo de Pontos de Caos (ajustável)

  // Atributos (Começam vazios para o jogador escolher)
  atributos: {
    forca: "",
    inteligencia: "",
    agilidade: "",
    vitalidade: "",
    aparencia: "",
    instinto: ""
  },

  // Perícias (Começam vazias para o jogador escolher)
  pericias: {
    esforco: "",
    mente: "",
    destreza: "",
    resistencia: "",
    social: "",
    sentidos: ""
  },

  // Status Vitais Atuais (Os máximos são calculados automaticamente)
  vidaAtual: 0,
  vidaEditada: false,
  equilibrioAtual: 0,
  equilibrioEditada: false,
  akashaAtual: 2,

  // Nível de Mão
  nivelMao: {
    terminus: { 1: false, 2: false, 3: false, 4: false, 5: false },
    genesis: { 1: false, 2: false, 3: false, 4: false, 5: false }
  },

  // Elementos (Iniciam vazios até escolher o Caminho)
  elementos: {
    elemento1: "",
    elemento2: "",
    elemento3: ""
  },

  // Runas Equipadas (1 de cada categoria)
  runasEquipadas: {
    corpo: null,
    mente: null,
    alma: null
  },

  // Habilidades de Atuação (3 slots)
  habilidadesAtuacao: [
    { nome: "", descricao: "", custo: "", nivelRequerido: 1 },
    { nome: "", descricao: "", custo: "", nivelRequerido: 3 },
    { nome: "", descricao: "", custo: "", nivelRequerido: 6 }
  ],

  // Habilidades de Caminho (3 slots)
  habilidadesCaminho: [
    { nome: "", descricao: "", custo: "", nivelRequerido: 2 },
    { nome: "", descricao: "", custo: "", nivelRequerido: 5 },
    { nome: "", descricao: "", custo: "", nivelRequerido: 8 }
  ],

  // Inventário (Começa 100% VAZIO para a pessoa criar os próprios itens)
  inventario: [],

  // Servos do Personagem (Até 6 servos)
  servos: []
};

// Helper para criar um novo Servo com a estrutura completa
export function createDefaultServo(index = 1) {
  return {
    id: `servo_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    nome: `Servo #${index}`,
    aparencia: "",
    objetivoBuff: "",
    elemento: "",
    nivel: 1,
    existenciaAtual: 10,
    existenciaMax: 10,
    akashaAtual: 2,
    akashaMax: 2,
    atributos: {
      forca: "1D4",
      inteligencia: "1D4",
      agilidade: "1D4",
      vitalidade: "1D4",
      aparencia: "1D4",
      instinto: "1D4"
    },
    pericias: {
      esforco: "1D4",
      mente: "1D4",
      destreza: "1D4",
      resistencia: "1D4",
      social: "1D4",
      sentidos: "1D4"
    },
    ataques: [
      { id: `atk_${Date.now()}_1`, nome: "Ataque Básico", dadoAtaque: "1D6", dadoDano: "1D6" }
    ]
  };
}

// Map face maximum and half face
export function getDieStats(dieStr) {
  if (!dieStr) return { faces: 0, max: 0, half: 0 };
  const faces = parseDieFaces(dieStr);
  return {
    faces,
    max: faces,
    half: Math.floor(faces / 2)
  };
}

// Find Atuação config from sistema.json
export function getAtuacaoConfig(atuacaoId) {
  if (!atuacaoId) return null;
  const at = sistemaData.atuacoes.find(a => a.id.toLowerCase() === (atuacaoId || '').toLowerCase());
  return at || null;
}

// Find Caminho config from sistema.json
export function getCaminhoConfig(caminhoId) {
  if (!caminhoId) return null;
  for (const mit of sistemaData.mitologias) {
    for (const cam of mit.caminhos) {
      if (cam.id.toLowerCase() === (caminhoId || '').toLowerCase()) {
        return { ...cam, mitologiaNome: mit.nome };
      }
    }
  }
  return null;
}

// Automatically resolve abilities for Caminho based on level
export function getAutomatedCaminhoAbilities(caminhoId, level = 1, currentAbilities = []) {
  const config = getCaminhoConfig(caminhoId);
  const slots = [
    { nivelRequerido: 2, defaultName: "Poder de Caminho (Nv 2)" },
    { nivelRequerido: 5, defaultName: "Poder de Caminho (Nv 5)" },
    { nivelRequerido: 8, defaultName: "Poder de Caminho (Nv 8)" }
  ];

  if (!config || !config.habilidades) {
    return slots.map(s => ({
      nome: "",
      descricao: "",
      custo: "",
      nivelRequerido: s.nivelRequerido,
      desbloqueado: level >= s.nivelRequerido
    }));
  }

  return slots.map((s, idx) => {
    const isUnlocked = level >= s.nivelRequerido;
    if (!isUnlocked) {
      return {
        nome: `Bloqueado (Requer Nível ${s.nivelRequerido})`,
        descricao: `Esta habilidade de ${config.deus} será desbloqueada automaticamente ao atingir o Nível Pessoal ${s.nivelRequerido}.`,
        custo: "—",
        nivelRequerido: s.nivelRequerido,
        desbloqueado: false
      };
    }

    // Find abilities in config matching this level
    const matchingPowers = config.habilidades.filter(h => h.nivel === s.nivelRequerido);
    const existing = currentAbilities[idx];

    // If existing matches one of the powers or user customized it, keep it
    if (existing && existing.nome && !existing.nome.startsWith("Bloqueado") && isUnlocked) {
      return { ...existing, nivelRequerido: s.nivelRequerido, desbloqueado: true };
    }

    // Default to the first matching power
    const power = matchingPowers[0] || config.habilidades[idx];
    if (power) {
      return {
        nome: power.nome,
        descricao: power.descricao,
        custo: power.custo,
        nivelRequerido: s.nivelRequerido,
        desbloqueado: true
      };
    }

    return {
      nome: s.defaultName,
      descricao: "",
      custo: "",
      nivelRequerido: s.nivelRequerido,
      desbloqueado: true
    };
  });
}

// Automatically resolve abilities for Atuação based on level
export function getAutomatedAtuacaoAbilities(atuacaoId, level = 1, currentAbilities = []) {
  const config = getAtuacaoConfig(atuacaoId);
  const slots = [
    { nivelRequerido: 1, defaultName: "Habilidade Inata de Atuação" },
    { nivelRequerido: 3, defaultName: "Aprofundamento de Atuação (Nv 3)" },
    { nivelRequerido: 6, defaultName: "Especialização de Atuação (Nv 6)" }
  ];

  if (!config) {
    return slots.map(s => ({
      nome: "",
      descricao: "",
      custo: "",
      nivelRequerido: s.nivelRequerido,
      desbloqueado: level >= s.nivelRequerido
    }));
  }

  return slots.map((s, idx) => {
    const isUnlocked = level >= s.nivelRequerido;
    if (!isUnlocked) {
      return {
        nome: `Bloqueado (Requer Nível ${s.nivelRequerido})`,
        descricao: `Esta habilidade de ${config.nome} será desbloqueada automaticamente ao atingir o Nível Pessoal ${s.nivelRequerido}.`,
        custo: "—",
        nivelRequerido: s.nivelRequerido,
        desbloqueado: false
      };
    }

    if (idx === 0 && config.habilidade_inata) {
      return {
        nome: config.habilidade_inata.nome,
        descricao: config.habilidade_inata.descricao,
        custo: config.habilidade_inata.custo,
        nivelRequerido: 1,
        desbloqueado: true
      };
    }

    const existing = currentAbilities[idx];
    if (existing && existing.nome && !existing.nome.startsWith("Bloqueado")) {
      return { ...existing, nivelRequerido: s.nivelRequerido, desbloqueado: true };
    }

    return {
      nome: s.defaultName,
      descricao: `Habilidade avançada de ${config.nome} desbloqueada no Nível ${s.nivelRequerido}.`,
      custo: "1x por cena",
      nivelRequerido: s.nivelRequerido,
      desbloqueado: true
    };
  });
}

// Calculate Maximum Vida
export function calculateMaxVida(character) {
  const atuacao = getAtuacaoConfig(character.atuacao);
  if (!atuacao) return 0;

  const vitStats = getDieStats(character.atributos?.vitalidade);
  const level = Math.max(1, parseInt(character.nivelPessoal, 10) || 1);

  const baseInicial = atuacao.formulas.vida.base_inicial;
  const baseNivel = atuacao.formulas.vida.base_nivel;

  let maxVida = (baseInicial + vitStats.max) + (level - 1) * (baseNivel + vitStats.half);

  // Bonus from Rune Heiwaz (Terra/Corpo): +10 Max HP
  if (character.runasEquipadas?.corpo === 'heiwaz') {
    maxVida += 10;
  }

  // Bonus from Support Items equipped
  if (Array.isArray(character.inventario)) {
    character.inventario.forEach(item => {
      if (item.equipado && item.tipo === 'Item Suporte' && /vida/i.test(item.danoCura || item.descricao || '')) {
        maxVida += 5;
      }
    });
  }

  return maxVida;
}

// Calculate Maximum Equilíbrio
export function calculateMaxEquilibrio(character) {
  const atuacao = getAtuacaoConfig(character.atuacao);
  if (!atuacao) return 0;

  const intStats = getDieStats(character.atributos?.inteligencia);
  const level = Math.max(1, parseInt(character.nivelPessoal, 10) || 1);

  const baseInicial = atuacao.formulas.sanidade.base_inicial;
  const baseNivel = atuacao.formulas.sanidade.base_nivel;

  let maxEquilibrio = (baseInicial + intStats.max) + (level - 1) * (baseNivel + intStats.half);

  // Bonus from Rune Algiz (Terra/Mente): +10 Max Equilíbrio
  if (character.runasEquipadas?.mente === 'algiz') {
    maxEquilibrio += 10;
  }

  // Bonus from Support Items equipped
  if (Array.isArray(character.inventario)) {
    character.inventario.forEach(item => {
      if (item.equipado && item.tipo === 'Item Suporte' && /(equilibrio|sanidade)/i.test(item.danoCura || item.descricao || '')) {
        maxEquilibrio += 5;
      }
    });
  }

  return maxEquilibrio;
}

// Calculate Maximum Akasha
export function calculateMaxAkasha(character) {
  const level = Math.max(1, parseInt(character.nivelPessoal, 10) || 1);
  let maxAkasha = 2 + Math.floor(level / 2);

  if (character.runasEquipadas?.alma === 'thaan') {
    maxAkasha += 2;
  }

  return maxAkasha;
}

// Calculate Base Defense / Evasion
export function calculateDefesaInfo(character) {
  const destreza = character.pericias?.destreza || '—';
  const resistencia = character.pericias?.resistencia || '—';
  const agilidade = character.atributos?.agilidade || '—';
  const vitalidade = character.atributos?.vitalidade || '—';
  const hasIsaRune = character.runasEquipadas?.corpo === 'isa';

  return {
    esquivaAgil: `${destreza} + ${agilidade}${hasIsaRune ? ' + 1D4 (Runa Isa)' : ''}`,
    esquivaResistente: `${resistencia} + ${vitalidade}`,
    hasIsaRune
  };
}

// Calculate Total Inventory Weight
export function calculateInventoryWeight(character) {
  if (!Array.isArray(character.inventario)) return 0;
  return character.inventario.reduce((acc, item) => acc + (parseFloat(item.peso) || 0), 0);
}

// Calculate Max Recommended Weight based on Força
export function calculateMaxWeight(character) {
  const forcaFaces = character.atributos?.forca ? parseDieFaces(character.atributos.forca) : 4;
  return Math.round(forcaFaces * 1.6 + 2);
}

// Mutual exclusion checks for Hand Levels (Gênesis & Terminus)
export function getMaoLockStatus(nivelMao) {
  const t = nivelMao?.terminus || {};
  const g = nivelMao?.genesis || {};

  return {
    terminus: {
      1: false,
      2: false,
      3: false,
      4: Boolean(g[2]),
      5: Boolean(g[1])
    },
    genesis: {
      1: false,
      2: false,
      3: false,
      4: Boolean(t[2]),
      5: Boolean(t[1])
    }
  };
}

// Detailed description of each Hand level's mechanical effect
export const HAND_EFFECTS = {
  terminus: {
    1: {
      romano: "I",
      titulo: "Terminus I — Aumento de Desenvolvimento",
      efeito: "+1 passo em atributo ou perícia. Ao rolar um Karma, o resultado na tabela sempre será 1 a menos do que o rolado no D8.",
      bloqueio: "Bloqueia o Nível V de Gênesis."
    },
    2: {
      romano: "II",
      titulo: "Terminus II — Inversão do Caos",
      efeito: "Uma vez por cena, um resultado negativo na mesa gera o efeito oposto. Efeito colateral: O número 8 do Mantra passa a ter efeito negativo.",
      bloqueio: "Bloqueia o Nível IV de Gênesis."
    },
    3: {
      romano: "III",
      titulo: "Terminus III — Sintonização Caótica Avançada",
      efeito: "Aprofundamento na canalização das forças entrópicas do Caos.",
      bloqueio: "Bloqueia o Nível III de Gênesis."
    },
    4: {
      romano: "IV",
      titulo: "Terminus IV — Domínio Entrópico",
      efeito: "Manipulação avançada de probabilidades desfavoráveis em prol do personagem.",
      bloqueio: "Bloqueia o Nível II de Gênesis."
    },
    5: {
      romano: "V",
      titulo: "Terminus V — Ápice do Caos Primordial",
      efeito: "Fusão definitiva com a essência do Caos absoluto.",
      bloqueio: "Bloqueia o Nível I de Gênesis."
    }
  },
  genesis: {
    1: {
      romano: "I",
      titulo: "Gênesis I — Aumento de Desenvolvimento",
      efeito: "+1 passo em atributo ou perícia. Ao rolar um Mantra, o resultado na tabela sempre será 1 a mais do que o rolado no D8.",
      bloqueio: "Bloqueia o Nível V de Terminus."
    },
    2: {
      romano: "II",
      titulo: "Gênesis II — Ressonância Mântrica",
      efeito: "Uma vez por cena, pode rerrolar um dado de Mantra. Efeito colateral: O número 8 do Karma tem efeito dobrado.",
      bloqueio: "Bloqueia o Nível IV de Terminus."
    },
    3: {
      romano: "III",
      titulo: "Gênesis III — Harmonia Celestial",
      efeito: "Aprofundamento na canalização das bênçãos e da harmonia cósmica.",
      bloqueio: "Bloqueia o Nível III de Terminus."
    },
    4: {
      romano: "IV",
      titulo: "Gênesis IV — Transcendência Divina",
      efeito: "Conexão direta com os pilares da ordem e restauração primordial.",
      bloqueio: "Bloqueia o Nível II de Terminus."
    },
    5: {
      romano: "V",
      titulo: "Gênesis V — Ápice da Criação Absoluta",
      efeito: "Fusão definitiva com a essência da Ordem mântrica suprema.",
      bloqueio: "Bloqueia o Nível I de Terminus."
    }
  }
};
