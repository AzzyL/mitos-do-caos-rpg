import React, { useRef, useState } from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  Dices,
  Plus,
  Trash2,
  Lock,
  Flame,
  PackageOpen,
  Camera,
  X,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Swords
} from 'lucide-react';
import sistemaData from '../data/sistema.json';
import { 
  calculateMaxVida, 
  calculateMaxEquilibrio, 
  calculateMaxAkasha, 
  calculateDefesaInfo,
  calculateInventoryWeight,
  calculateMaxWeight,
  getMaoLockStatus,
  getAtuacaoConfig,
  getCaminhoConfig,
  createDefaultServo
} from '../utils/characterCalculations';
import { DIE_STEPS } from '../utils/diceRoller';

const ROMAN_NUMERALS = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V' };

const SERVO_DIE_STEPS = ['1D4', '1D6', '1D8', '1D10', '1D12'];

const ATRIBUTOS_KEYS = [
  { id: 'forca', nome: 'Força' },
  { id: 'inteligencia', nome: 'Inteligência' },
  { id: 'agilidade', nome: 'Agilidade' },
  { id: 'vitalidade', nome: 'Vitalidade' },
  { id: 'aparencia', nome: 'Aparência' },
  { id: 'instinto', nome: 'Instinto' }
];

const PERICIAS_KEYS = [
  { id: 'esforco', nome: 'Esforço' },
  { id: 'mente', nome: 'Mente' },
  { id: 'destreza', nome: 'Destreza' },
  { id: 'resistencia', nome: 'Resistência' },
  { id: 'social', nome: 'Social' },
  { id: 'sentidos', nome: 'Sentidos' }
];

export default function CharacterSheet({
  character,
  onChange,
  onQuickRoll
}) {
  const photoInputRef = useRef(null);

  // Calculated stats
  const maxVida = calculateMaxVida(character);
  const maxEquilibrio = calculateMaxEquilibrio(character);
  const maxAkasha = calculateMaxAkasha(character);
  const defesaInfo = calculateDefesaInfo(character);
  const totalPeso = calculateInventoryWeight(character);
  const maxPeso = calculateMaxWeight(character);
  const maoLocks = getMaoLockStatus(character.nivelMao);
  const atuacaoConfig = getAtuacaoConfig(character.atuacao);
  const caminhoConfig = getCaminhoConfig(character.caminho);

  const nivelAtual = character.nivelPessoal || 1;
  const pontosCaosAtuais = character.pontosCaos ?? 1;

  // Servos State
  const [expandedServos, setExpandedServos] = useState({});
  const toggleServoExpanded = (id) => {
    setExpandedServos(prev => ({ ...prev, [id]: prev[id] === undefined ? false : !prev[id] }));
  };

  const servosList = character.servos || [];
  const canAddServo = servosList.length < 6;
  const isVersado = (character.atuacao || '').toLowerCase() === 'versado';

  // Field update helper
  const updateField = (field, value) => {
    onChange({ ...character, [field]: value });
  };

  // Handle photo upload (Base64)
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      updateField('foto', event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Remove photo
  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    updateField('foto', null);
  };

  // Handle Pontos de Caos changes
  const handlePontosCaosChange = (delta) => {
    const newPC = Math.max(0, pontosCaosAtuais + delta);
    updateField('pontosCaos', newPC);
  };

  // Automatiza habilidades de Atuação e Caminho conforme o nível selecionado
  const buildAutomatedAbilities = (atuacaoId, caminhoId, nivel, currentAtuacaoHabs = [], currentCaminhoHabs = []) => {
    const atuacaoCfg = getAtuacaoConfig(atuacaoId);
    const caminhoCfg = getCaminhoConfig(caminhoId);

    // 1. Habilidades de Atuação: Nv 1 (Inata), Nv 3 (Adicional 1), Nv 6 (Adicional 2)
    const atuacaoSlotsCount = nivel >= 6 ? 3 : nivel >= 3 ? 2 : 1;
    const nextAtuacaoHabs = Array.from({ length: atuacaoSlotsCount }, (_, idx) => {
      const existing = currentAtuacaoHabs[idx] || { nome: '', descricao: '', custo: '' };
      if (idx === 0 && atuacaoCfg?.habilidade_inata) {
        return {
          nome: atuacaoCfg.habilidade_inata.nome,
          descricao: atuacaoCfg.habilidade_inata.descricao,
          custo: atuacaoCfg.habilidade_inata.custo,
          nivelDesbloqueio: 1
        };
      }
      return {
        ...existing,
        nivelDesbloqueio: idx === 1 ? 3 : 6
      };
    });

    // 2. Habilidades do Caminho: Nv 2, Nv 5 e Nv 8
    let nextCaminhoHabs = [];
    if (caminhoCfg?.habilidades) {
      const unlockedPowers = caminhoCfg.habilidades.filter(h => h.nivel <= nivel);
      nextCaminhoHabs = unlockedPowers.map(p => ({
        nome: p.nome,
        descricao: p.descricao,
        custo: p.custo,
        nivelDesbloqueio: p.nivel
      }));
    } else {
      nextCaminhoHabs = currentCaminhoHabs;
    }

    return {
      habilidadesAtuacao: nextAtuacaoHabs,
      habilidadesCaminho: nextCaminhoHabs
    };
  };

  // Alterar Nível Pessoal e atualizar habilidades automaticamente
  const handleNivelChange = (newNivel) => {
    const clampedNivel = Math.max(1, Math.min(8, newNivel));
    const synced = buildAutomatedAbilities(
      character.atuacao,
      character.caminho,
      clampedNivel,
      character.habilidadesAtuacao,
      character.habilidadesCaminho
    );
    const nextChar = {
      ...character,
      nivelPessoal: clampedNivel,
      ...synced
    };
    const nextMaxVida = calculateMaxVida(nextChar);
    const nextMaxEq = calculateMaxEquilibrio(nextChar);

    onChange({
      ...nextChar,
      vidaAtual: !character.vidaEditada ? nextMaxVida : character.vidaAtual,
      equilibrioAtual: !character.equilibrioEditada ? nextMaxEq : character.equilibrioAtual,
      sanidadeAtual: !character.equilibrioEditada ? nextMaxEq : character.sanidadeAtual
    });
  };

  // Alterar Atuação e preencher habilidade inata e status máximos iniciais
  const handleAtuacaoChange = (newAtuacaoId) => {
    const synced = buildAutomatedAbilities(
      newAtuacaoId,
      character.caminho,
      nivelAtual,
      character.habilidadesAtuacao,
      character.habilidadesCaminho
    );
    const nextChar = {
      ...character,
      atuacao: newAtuacaoId,
      habilidadesAtuacao: synced.habilidadesAtuacao
    };
    const nextMaxVida = calculateMaxVida(nextChar);
    const nextMaxEq = calculateMaxEquilibrio(nextChar);

    onChange({
      ...nextChar,
      vidaAtual: !character.vidaEditada ? nextMaxVida : character.vidaAtual,
      equilibrioAtual: !character.equilibrioEditada ? nextMaxEq : character.equilibrioAtual,
      sanidadeAtual: !character.equilibrioEditada ? nextMaxEq : character.sanidadeAtual
    });
  };

  // Alterar Caminho, sincronizar elementos e preencher habilidades do nível
  const handleCaminhoChange = (newCaminhoId) => {
    if (!newCaminhoId) {
      onChange({
        ...character,
        caminho: '',
        elementos: { elemento1: '', elemento2: '', elemento3: '' },
        habilidadesCaminho: []
      });
      return;
    }

    const config = getCaminhoConfig(newCaminhoId);
    if (!config) return;

    const synced = buildAutomatedAbilities(
      character.atuacao,
      newCaminhoId,
      nivelAtual,
      character.habilidadesAtuacao,
      []
    );

    onChange({
      ...character,
      caminho: newCaminhoId,
      elementos: {
        elemento1: config.elementos.elemento_1,
        elemento2: config.elementos.elemento_2,
        elemento3: config.elementos.elemento_3
      },
      habilidadesCaminho: synced.habilidadesCaminho
    });
  };

  const updateAtributo = (attr, die) => {
    const nextChar = {
      ...character,
      atributos: { ...character.atributos, [attr]: die }
    };
    const nextMaxVida = calculateMaxVida(nextChar);
    const nextMaxEq = calculateMaxEquilibrio(nextChar);

    onChange({
      ...nextChar,
      vidaAtual: !character.vidaEditada ? nextMaxVida : character.vidaAtual,
      equilibrioAtual: !character.equilibrioEditada ? nextMaxEq : character.equilibrioAtual,
      sanidadeAtual: !character.equilibrioEditada ? nextMaxEq : character.sanidadeAtual
    });
  };

  const updatePericia = (per, die) => {
    onChange({
      ...character,
      pericias: { ...character.pericias, [per]: die }
    });
  };

  const updateHandLevel = (hand, level) => {
    const isLocked = maoLocks[hand]?.[level];
    if (isLocked) {
      alert(`O Nível ${ROMAN_NUMERALS[level]} de ${hand === 'terminus' ? 'Terminus' : 'Gênesis'} está bloqueado devido à evolução na outra mão!`);
      return;
    }

    const currentVal = Boolean(character.nivelMao?.[hand]?.[level]);
    const updated = {
      ...character.nivelMao,
      [hand]: {
        ...character.nivelMao?.[hand],
        [level]: !currentVal
      }
    };
    onChange({ ...character, nivelMao: updated });
  };

  // Select ability manually for Caminho slot (override)
  const handleSelectCaminhoPower = (slotIndex, powerName) => {
    if (!caminhoConfig || !caminhoConfig.habilidades) return;
    const power = caminhoConfig.habilidades.find(h => h.nome === powerName);
    if (!power) return;

    const updated = [...(character.habilidadesCaminho || [])];
    updated[slotIndex] = {
      nome: power.nome,
      descricao: power.descricao,
      custo: power.custo,
      nivelDesbloqueio: power.nivel
    };
    updateField('habilidadesCaminho', updated);
  };

  // Inventory handlers
  const handleAddItem = () => {
    const newItem = {
      id: `item-${Date.now()}`,
      nome: "",
      tipo: "Arma",
      descricao: "",
      danoCura: "+1D6",
      peso: 1,
      equipado: true
    };
    updateField('inventario', [...(character.inventario || []), newItem]);
  };

  const handleUpdateItem = (index, field, value) => {
    const updated = [...(character.inventario || [])];
    updated[index] = { ...updated[index], [field]: value };
    updateField('inventario', updated);
  };

  const handleRemoveItem = (index) => {
    const updated = character.inventario.filter((_, i) => i !== index);
    updateField('inventario', updated);
  };

  // Servos Handlers
  const handleAddServo = () => {
    if (servosList.length >= 6) return;
    const newServo = createDefaultServo(servosList.length + 1);
    updateField('servos', [...servosList, newServo]);
    setExpandedServos(prev => ({ ...prev, [newServo.id]: true }));
  };

  const handleRemoveServo = (servoId, servoNome) => {
    if (window.confirm(`Deseja realmente remover o servo "${servoNome || 'Sem Nome'}"?`)) {
      const updated = servosList.filter(s => s.id !== servoId);
      updateField('servos', updated);
    }
  };

  const handleUpdateServo = (index, field, value) => {
    const updated = [...servosList];
    updated[index] = { ...updated[index], [field]: value };
    updateField('servos', updated);
  };

  const handleUpdateServoNested = (index, section, key, value) => {
    const updated = [...servosList];
    updated[index] = {
      ...updated[index],
      [section]: {
        ...updated[index][section],
        [key]: value
      }
    };
    updateField('servos', updated);
  };

  const handleAddServoAttack = (servoIndex) => {
    const updated = [...servosList];
    const atks = updated[servoIndex].ataques || [];
    updated[servoIndex] = {
      ...updated[servoIndex],
      ataques: [
        ...atks,
        { id: `atk_${Date.now()}`, nome: "Ataque", dadoAtaque: "1D6", dadoDano: "1D6" }
      ]
    };
    updateField('servos', updated);
  };

  const handleUpdateServoAttack = (servoIndex, atkIndex, field, value) => {
    const updated = [...servosList];
    const atks = [...(updated[servoIndex].ataques || [])];
    atks[atkIndex] = { ...atks[atkIndex], [field]: value };
    updated[servoIndex] = { ...updated[servoIndex], ataques: atks };
    updateField('servos', updated);
  };

  const handleRemoveServoAttack = (servoIndex, atkIndex) => {
    const updated = [...servosList];
    const atks = (updated[servoIndex].ataques || []).filter((_, i) => i !== atkIndex);
    updated[servoIndex] = { ...updated[servoIndex], ataques: atks };
    updateField('servos', updated);
  };

  // Quick Roll on clicking Atributo
  const handleRollAtributo = (attrName, die) => {
    if (!die) {
      alert(`Escolha um dado para o atributo ${attrName} antes de rolar!`);
      return;
    }
    onQuickRoll({
      title: `Teste de Atributo: ${attrName}`,
      periciaName: null,
      atributoName: attrName,
      periciaDie: null,
      atributoDie: die,
      bonusDice: [],
      bonusModifier: 0
    });
  };

  // Quick Roll on clicking Perícia
  const handleRollPericia = (perName, die) => {
    if (!die) {
      alert(`Escolha um dado para a perícia ${perName} antes de rolar!`);
      return;
    }
    onQuickRoll({
      title: `Teste de Perícia: ${perName}`,
      periciaName: perName,
      atributoName: null,
      periciaDie: die,
      atributoDie: null,
      bonusDice: [],
      bonusModifier: 0
    });
  };

  // Listas de níveis das mãos selecionados para exibição dos efeitos
  const activeTerminusEffects = (sistemaData.nivel_de_mao?.maos?.terminus?.niveis || []).filter(
    item => character.nivelMao?.terminus?.[item.nivel]
  );
  const activeGenesisEffects = (sistemaData.nivel_de_mao?.maos?.genesis?.niveis || []).filter(
    item => character.nivelMao?.genesis?.[item.nivel]
  );

  const currentVida = character.vidaAtual ?? (maxVida > 0 ? maxVida : 0);
  const currentEquilibrio = character.equilibrioAtual ?? character.sanidadeAtual ?? (maxEquilibrio > 0 ? maxEquilibrio : 0);

  return (
    <div className="print-page max-w-5xl mx-auto bg-[#7B7B7B] text-white p-3 sm:p-5 md:p-7 rounded-2xl shadow-2xl border border-neutral-600/50 my-4 sm:my-6 transition-all select-none">
      
      {/* =========================================================================
          BLOCO 1: CABEÇALHO E IDENTIDADE
          Linha 1: Foto no Octograma + Nome + Nível Pessoal ao lado do Nome
          Linha 2: Atuação, Caminho, Karma Atual e Pontos de Caos
          ========================================================================= */}
      <div className="bg-[#111111]/90 rounded-2xl p-3.5 sm:p-5 border border-black/40 shadow-xl mb-5 space-y-3.5">
        
        {/* LINHA 1: FOTO NO OCTOGRAMA + NOME + NÍVEL PESSOAL */}
        <div className="flex flex-col sm:flex-row items-center gap-3.5">
          
          {/* Octograma / Foto do Personagem */}
          <div className="relative flex-shrink-0">
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <div
              onClick={() => photoInputRef.current?.click()}
              className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center bg-black border-2 border-purple-500/60 rounded-full shadow-lg shadow-purple-950/70 cursor-pointer overflow-hidden group hover:border-purple-400 transition-all"
              title="Clique para inserir ou alterar a foto do personagem"
            >
              {character.foto ? (
                <>
                  <img
                    src={character.foto}
                    alt={character.nome || 'Personagem'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] text-purple-200 font-semibold">
                    <Camera className="w-4 h-4 mb-0.5 text-purple-300" />
                    <span>Trocar</span>
                  </div>
                </>
              ) : (
                <>
                  {/* Estrela do Octograma do Caos */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-45 group-hover:opacity-20 transition-opacity">
                    <div className="w-11 sm:w-14 h-0.5 bg-purple-400 rotate-0" />
                    <div className="w-11 sm:w-14 h-0.5 bg-purple-400 rotate-45" />
                    <div className="w-11 sm:w-14 h-0.5 bg-purple-400 rotate-90" />
                    <div className="w-11 sm:w-14 h-0.5 bg-purple-400 rotate-135" />
                  </div>
                  <Flame className="w-6 h-6 text-purple-300 relative z-10 group-hover:opacity-0 transition-opacity" />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-[9px] text-purple-200 font-semibold">
                    <Camera className="w-4 h-4 mb-0.5 text-purple-300" />
                    <span>Foto</span>
                  </div>
                </>
              )}
            </div>

            {/* Botão rápido para remover foto */}
            {character.foto && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="no-print absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-md border border-black"
                title="Remover foto"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Campo Nome (Acima de Atuação, Caminho, Karma) */}
          <div className="flex-1 w-full bg-black/90 border border-neutral-700/80 rounded-xl p-2.5 sm:p-3 shadow-inner">
            <label className="text-[9px] font-cinzel tracking-widest text-slate-400 uppercase block mb-1">
              NOME DO PERSONAGEM
            </label>
            <input
              type="text"
              value={character.nome || ''}
              onChange={(e) => updateField('nome', e.target.value)}
              placeholder="Insira o nome do personagem..."
              className="w-full bg-transparent text-sm sm:text-base font-cinzel font-bold text-white tracking-wide focus:outline-none placeholder-neutral-600"
            />
          </div>

          {/* Nível Pessoal (Ao lado do Nome) */}
          <div className="w-full sm:w-auto sm:min-w-[145px] bg-black/90 border border-neutral-700/80 rounded-xl p-2.5 sm:p-3 shadow-inner flex sm:flex-col items-center justify-between">
            <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase sm:mb-1">
              NÍVEL PESSOAL
            </label>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => handleNivelChange(nivelAtual - 1)}
                className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                -
              </button>
              <span className="font-cinzel font-bold text-base text-yellow-400 font-mono min-w-[20px] text-center">
                {nivelAtual}
              </span>
              <button
                type="button"
                onClick={() => handleNivelChange(nivelAtual + 1)}
                className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-300 hover:text-white flex items-center justify-center text-xs font-bold transition-colors"
              >
                +
              </button>
            </div>
          </div>

        </div>

        {/* LINHA 2: ATUAÇÃO, CAMINHO, KARMA ATUAL E PONTOS DE CAOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* ATUAÇÃO */}
          <div className="bg-black/90 border border-neutral-700/80 rounded-xl p-2.5 shadow-inner">
            <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
              ATUAÇÃO
            </label>
            <select
              value={character.atuacao || ''}
              onChange={(e) => handleAtuacaoChange(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-purple-300 focus:outline-none cursor-pointer"
            >
              <option value="" className="bg-neutral-900 text-slate-400">Escolha uma opção...</option>
              {sistemaData.atuacoes.map(at => (
                <option key={at.id} value={at.id} className="bg-neutral-900 text-white">
                  {at.nome}
                </option>
              ))}
            </select>
          </div>

          {/* CAMINHO */}
          <div className="bg-black/90 border border-neutral-700/80 rounded-xl p-2.5 shadow-inner">
            <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
              CAMINHO
            </label>
            <select
              value={character.caminho || ''}
              onChange={(e) => handleCaminhoChange(e.target.value)}
              className="w-full bg-transparent text-xs font-bold text-cyan-300 focus:outline-none cursor-pointer truncate"
            >
              <option value="" className="bg-neutral-900 text-slate-400">Escolha uma opção...</option>
              {sistemaData.mitologias.map(mit => (
                <optgroup key={mit.id} label={mit.nome} className="bg-neutral-900 text-slate-400 font-bold">
                  {mit.caminhos.map(cam => (
                    <option key={cam.id} value={cam.id} className="bg-neutral-900 text-white">
                      {cam.deus} ({cam.titulo})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* KARMA ATUAL */}
          <div className="bg-black/90 border border-neutral-700/80 rounded-xl p-2.5 shadow-inner">
            <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
              KARMA ATUAL
            </label>
            <select
              value={character.karmaAtual || 'Neutro'}
              onChange={(e) => updateField('karmaAtual', e.target.value)}
              className={`w-full bg-transparent text-xs font-bold focus:outline-none cursor-pointer ${
                character.karmaAtual === 'Positivo'
                  ? 'text-emerald-400'
                  : character.karmaAtual === 'Negativo'
                  ? 'text-red-400'
                  : 'text-slate-300'
              }`}
            >
              <option value="Positivo" className="bg-neutral-900 text-emerald-400">Positivo (+)</option>
              <option value="Neutro" className="bg-neutral-900 text-slate-300">Neutro (0)</option>
              <option value="Negativo" className="bg-neutral-900 text-red-400">Negativo (-)</option>
            </select>
          </div>

          {/* PONTOS DE CAOS */}
          <div className="bg-black/90 border border-red-900/50 rounded-xl p-2.5 shadow-inner flex items-center justify-between">
            <div>
              <label className="text-[9px] font-cinzel tracking-wider text-red-300/80 uppercase flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-red-400" /> PONTOS DE CAOS
              </label>
              <span className="text-[10px] text-slate-500 font-mono">Reserva de Aposta</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePontosCaosChange(-1)}
                className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-red-950 text-slate-300 hover:text-red-300 flex items-center justify-center text-xs font-bold transition-colors"
                title="Gastar / Diminuir Ponto de Caos"
              >
                -
              </button>
              <span className="font-cinzel font-bold text-sm text-red-400 font-mono min-w-[20px] text-center">
                {pontosCaosAtuais}
              </span>
              <button
                type="button"
                onClick={() => handlePontosCaosChange(1)}
                className="w-6 h-6 rounded-lg bg-neutral-800 hover:bg-red-950 text-slate-300 hover:text-red-300 flex items-center justify-center text-xs font-bold transition-colors"
                title="Adicionar Ponto de Caos"
              >
                +
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          BLOCO 2: STATUS VITAIS & DEFESA
          ========================================================================= */}
      <div className="bg-[#111111]/90 rounded-2xl p-4 sm:p-5 border border-black/40 shadow-xl mb-5">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2 mb-4">
          <h2 className="text-xs sm:text-sm font-cinzel font-bold tracking-widest text-slate-200 uppercase flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-400" /> STATUS VITAIS & DEFESA
          </h2>
          <span className="text-[10px] text-purple-400 font-mono">
            {atuacaoConfig ? `Cálculo: ${atuacaoConfig.nome}` : 'Selecione uma Atuação'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
          {/* 1. VIDA */}
          <div className="bg-black/70 rounded-xl p-3 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-cinzel font-bold tracking-wider flex items-center gap-1.5 text-red-400">
                <Heart className="w-4 h-4 fill-red-500/20" /> VIDA
              </span>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="number"
                  value={currentVida}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    onChange({
                      ...character,
                      vidaAtual: val,
                      vidaEditada: true
                    });
                  }}
                  className="w-12 text-center bg-neutral-900 text-red-300 font-bold text-sm rounded py-0.5 border border-neutral-700 focus:outline-none"
                />
                <span className="text-slate-400">/ {maxVida}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                style={{ width: `${maxVida > 0 ? Math.max(0, Math.min(100, (currentVida / maxVida) * 100)) : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>{atuacaoConfig ? `Base ${atuacaoConfig.formulas.vida.base_inicial} + VIT` : 'Defina Atuação e Vitalidade'}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.max(0, currentVida - 1);
                    onChange({
                      ...character,
                      vidaAtual: val,
                      vidaEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.min(maxVida, currentVida + 1);
                    onChange({
                      ...character,
                      vidaAtual: val,
                      vidaEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...character,
                      vidaAtual: maxVida,
                      vidaEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400"
                >
                  Full
                </button>
              </div>
            </div>
          </div>

          {/* 2. EQUILÍBRIO */}
          <div className="bg-black/70 rounded-xl p-3 border border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-cinzel font-bold tracking-wider flex items-center gap-1.5 text-indigo-400">
                <Brain className="w-4 h-4 fill-indigo-500/20" /> EQUILÍBRIO
              </span>
              <div className="flex items-center gap-1 font-mono font-bold">
                <input
                  type="number"
                  value={currentEquilibrio}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10) || 0;
                    onChange({
                      ...character,
                      equilibrioAtual: val,
                      sanidadeAtual: val,
                      equilibrioEditada: true
                    });
                  }}
                  className="w-12 text-center bg-neutral-900 text-indigo-300 font-bold text-sm rounded py-0.5 border border-neutral-700 focus:outline-none"
                />
                <span className="text-slate-400">/ {maxEquilibrio}</span>
              </div>
            </div>

            <div className="w-full h-2.5 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-purple-500 transition-all duration-300"
                style={{ width: `${maxEquilibrio > 0 ? Math.max(0, Math.min(100, (currentEquilibrio / maxEquilibrio) * 100)) : 0}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
              <span>{atuacaoConfig ? `Base ${atuacaoConfig.formulas.sanidade.base_inicial} + INT` : 'Defina Atuação e Inteligência'}</span>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.max(0, currentEquilibrio - 1);
                    onChange({
                      ...character,
                      equilibrioAtual: val,
                      sanidadeAtual: val,
                      equilibrioEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const val = Math.min(maxEquilibrio, currentEquilibrio + 1);
                    onChange({
                      ...character,
                      equilibrioAtual: val,
                      sanidadeAtual: val,
                      equilibrioEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      ...character,
                      equilibrioAtual: maxEquilibrio,
                      sanidadeAtual: maxEquilibrio,
                      equilibrioEditada: true
                    });
                  }}
                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400"
                >
                  Full
                </button>
              </div>
            </div>
          </div>

          {/* 3. AKASHA & DEFESA RESUMO */}
          <div className="bg-black/70 rounded-xl p-3 border border-neutral-800 flex flex-col justify-between space-y-2">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-cinzel font-bold tracking-wider flex items-center gap-1.5 text-cyan-400">
                  <Sparkles className="w-4 h-4 fill-cyan-500/20" /> AKASHA
                </span>
                <span className="font-mono font-bold text-cyan-300 text-xs">
                  {character.akashaAtual ?? maxAkasha} / {maxAkasha}
                </span>
              </div>

              {/* Orbes de Akasha */}
              <div className="flex flex-wrap items-center gap-1.5 py-1">
                {Array.from({ length: maxAkasha }).map((_, idx) => {
                  const isFilled = idx < (character.akashaAtual ?? maxAkasha);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => updateField('akashaAtual', isFilled ? idx : idx + 1)}
                      className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                        isFilled
                          ? 'bg-gradient-to-tr from-cyan-600 to-blue-400 border-cyan-300 shadow-md shadow-cyan-900/50 scale-105'
                          : 'bg-neutral-900 border-neutral-700 hover:border-cyan-500/50'
                      }`}
                      title={`Ponto de Akasha #${idx + 1}`}
                    >
                      {isFilled && <div className="w-2 h-2 rounded-full bg-white" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Esquiva info */}
            <div className="pt-2 border-t border-neutral-800 text-[10px] space-y-0.5 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Esquiva Ágil:</span>
                <strong className="text-cyan-300 font-mono">{defesaInfo.esquivaAgil}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Esquiva Resistente:</span>
                <strong className="text-red-300 font-mono">{defesaInfo.esquivaResistente}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOCO 3: ATRIBUTOS PRIMÁRIOS (GRAU DE DESENVOLVIMENTO)
          ========================================================================= */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-cinzel font-bold tracking-widest text-neutral-900 uppercase">
            ATRIBUTOS PRIMÁRIOS (GRAU DE DESENVOLVIMENTO)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {sistemaData.atributos.map((attr) => {
            const currentDie = character.atributos?.[attr.id] || '';
            return (
              <div
                key={attr.id}
                className="bg-black text-white rounded-xl p-2.5 border border-neutral-700/80 shadow-md flex flex-col justify-between group hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-cinzel font-bold tracking-wider text-[11px] text-slate-200">
                    {attr.nome}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRollAtributo(attr.nome, currentDie)}
                    className="p-1.5 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-300 hover:text-white transition-colors"
                    title={`Rolar ${attr.nome} (${currentDie || 'não definido'})`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-neutral-800">
                  <select
                    value={currentDie}
                    onChange={(e) => updateAtributo(attr.id, e.target.value)}
                    className="w-full bg-neutral-900 text-yellow-400 font-cinzel font-bold text-xs py-1.5 px-2 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-slate-500">Escolha uma opção...</option>
                    {DIE_STEPS.map(d => (
                      <option key={d} value={d} className="bg-neutral-900 text-yellow-400">
                        {d} ({sistemaData.dados_escala[d]?.grau})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BLOCO 4: PERÍCIAS GERAIS (GRAU DE CONHECIMENTO)
          ========================================================================= */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-cinzel font-bold tracking-widest text-neutral-900 uppercase">
            PERÍCIAS GERAIS (GRAU DE CONHECIMENTO)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {sistemaData.pericias.map((per) => {
            const currentDie = character.pericias?.[per.id] || '';
            return (
              <div
                key={per.id}
                className="bg-black text-white rounded-xl p-2.5 border border-neutral-700/80 shadow-md flex flex-col justify-between group hover:border-cyan-500/50 transition-all"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-cinzel font-bold tracking-wider text-[11px] text-slate-200">
                    {per.nome}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRollPericia(per.nome, currentDie)}
                    className="p-1.5 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300 hover:text-white transition-colors"
                    title={`Rolar ${per.nome} (${currentDie || 'não definido'})`}
                  >
                    <Dices className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-1 pt-1 border-t border-neutral-800">
                  <select
                    value={currentDie}
                    onChange={(e) => updatePericia(per.id, e.target.value)}
                    className="w-full bg-neutral-900 text-cyan-400 font-cinzel font-bold text-xs py-1.5 px-2 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="" className="text-slate-500">Escolha uma opção...</option>
                    {DIE_STEPS.map(d => (
                      <option key={d} value={d} className="bg-neutral-900 text-cyan-400">
                        {d} ({sistemaData.dados_escala[d]?.grau})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          BLOCO 5: AS MÃOS DO CAOS & ELEMENTOS & RUNAS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-6 items-stretch">
        
        {/* AS MÃOS DO CAOS (8 colunas) */}
        <div className="lg:col-span-8 bg-black/90 rounded-2xl p-4 sm:p-5 border border-neutral-700/80 shadow-xl flex flex-col justify-between">
          <div className="text-[10px] font-cinzel tracking-wider text-slate-400 uppercase border-b border-neutral-800 pb-1 text-center">
            NÍVEL DE MÃO — AS MÃOS DO CAOS
          </div>

          {/* Hands side-by-side */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 items-center justify-items-center">
            
            {/* MÃO ESQUERDA: TERMINUS (-) */}
            <div className="flex flex-col items-center w-full max-w-[200px]">
              <div className="relative w-full h-48 bg-gradient-to-b from-[#151515] to-[#050505] rounded-3xl border-2 border-neutral-700 p-2 flex flex-col justify-between shadow-2xl shadow-black/80">
                <div className="flex justify-between items-end px-1 pt-1 h-20">
                  {/* Pinky V */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">V</span>
                    <button
                      type="button"
                      disabled={maoLocks.terminus[5]}
                      onClick={() => updateHandLevel('terminus', 5)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.terminus?.[5]
                          ? 'bg-red-600 border-red-300 text-white shadow-md shadow-red-900'
                          : maoLocks.terminus[5]
                          ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-black border-neutral-600 text-slate-300 hover:border-red-400'
                      }`}
                    >
                      {maoLocks.terminus[5] ? <Lock className="w-2.5 h-2.5" /> : 'V'}
                    </button>
                  </div>

                  {/* Ring IV */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">IV</span>
                    <button
                      type="button"
                      disabled={maoLocks.terminus[4]}
                      onClick={() => updateHandLevel('terminus', 4)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.terminus?.[4]
                          ? 'bg-red-600 border-red-300 text-white shadow-md shadow-red-900'
                          : maoLocks.terminus[4]
                          ? 'bg-neutral-900 border-neutral-800 text-neutral-600 cursor-not-allowed'
                          : 'bg-black border-neutral-600 text-slate-300 hover:border-red-400'
                      }`}
                    >
                      {maoLocks.terminus[4] ? <Lock className="w-2.5 h-2.5" /> : 'IV'}
                    </button>
                  </div>

                  {/* Middle III */}
                  <div className="flex flex-col items-center mb-4">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">III</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('terminus', 3)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.terminus?.[3]
                          ? 'bg-red-600 border-red-300 text-white shadow-md shadow-red-900'
                          : 'bg-black border-neutral-600 text-slate-300 hover:border-red-400'
                      }`}
                    >
                      III
                    </button>
                  </div>

                  {/* Index II */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">II</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('terminus', 2)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.terminus?.[2]
                          ? 'bg-red-600 border-red-300 text-white shadow-md shadow-red-900'
                          : 'bg-black border-neutral-600 text-slate-300 hover:border-red-400'
                      }`}
                    >
                      II
                    </button>
                  </div>

                  {/* Thumb I */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-slate-400 mb-0.5">I</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('terminus', 1)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.terminus?.[1]
                          ? 'bg-red-600 border-red-300 text-white shadow-md shadow-red-900'
                          : 'bg-black border-neutral-600 text-slate-300 hover:border-red-400'
                      }`}
                    >
                      I
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <span className="text-3xl font-cinzel font-bold text-red-500/80">-</span>
                </div>

                <div className="text-center pb-1">
                  <span className="text-[10px] font-cinzel font-bold tracking-widest text-red-400">
                    TERMINUS
                  </span>
                </div>
              </div>
            </div>

            {/* MÃO DIREITA: GÊNESIS (+) */}
            <div className="flex flex-col items-center w-full max-w-[200px]">
              <div className="relative w-full h-48 bg-gradient-to-b from-[#e5e5e5] to-[#f8fafc] text-black rounded-3xl border-2 border-slate-300 p-2 flex flex-col justify-between shadow-2xl shadow-purple-950/30">
                <div className="flex justify-between items-end px-1 pt-1 h-20">
                  {/* Thumb I */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-neutral-600 mb-0.5">I</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('genesis', 1)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.genesis?.[1]
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900'
                          : 'bg-white border-neutral-400 text-neutral-800 hover:border-indigo-500'
                      }`}
                    >
                      I
                    </button>
                  </div>

                  {/* Index II */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-[8px] font-mono text-neutral-600 mb-0.5">II</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('genesis', 2)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.genesis?.[2]
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900'
                          : 'bg-white border-neutral-400 text-neutral-800 hover:border-indigo-500'
                      }`}
                    >
                      II
                    </button>
                  </div>

                  {/* Middle III */}
                  <div className="flex flex-col items-center mb-4">
                    <span className="text-[8px] font-mono text-neutral-600 mb-0.5">III</span>
                    <button
                      type="button"
                      onClick={() => updateHandLevel('genesis', 3)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.genesis?.[3]
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900'
                          : 'bg-white border-neutral-400 text-neutral-800 hover:border-indigo-500'
                      }`}
                    >
                      III
                    </button>
                  </div>

                  {/* Ring IV */}
                  <div className="flex flex-col items-center mb-2">
                    <span className="text-[8px] font-mono text-neutral-600 mb-0.5">IV</span>
                    <button
                      type="button"
                      disabled={maoLocks.genesis[4]}
                      onClick={() => updateHandLevel('genesis', 4)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.genesis?.[4]
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900'
                          : maoLocks.genesis[4]
                          ? 'bg-neutral-300 border-neutral-400 text-neutral-400 cursor-not-allowed'
                          : 'bg-white border-neutral-400 text-neutral-800 hover:border-indigo-500'
                      }`}
                    >
                      {maoLocks.genesis[4] ? <Lock className="w-2.5 h-2.5" /> : 'IV'}
                    </button>
                  </div>

                  {/* Pinky V */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-mono text-neutral-600 mb-0.5">V</span>
                    <button
                      type="button"
                      disabled={maoLocks.genesis[5]}
                      onClick={() => updateHandLevel('genesis', 5)}
                      className={`w-5 h-5 rounded-full border text-[9px] font-bold flex items-center justify-center transition-all ${
                        character.nivelMao?.genesis?.[5]
                          ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-900'
                          : maoLocks.genesis[5]
                          ? 'bg-neutral-300 border-neutral-400 text-neutral-400 cursor-not-allowed'
                          : 'bg-white border-neutral-400 text-neutral-800 hover:border-indigo-500'
                      }`}
                    >
                      {maoLocks.genesis[5] ? <Lock className="w-2.5 h-2.5" /> : 'V'}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <span className="text-3xl font-cinzel font-bold text-indigo-700/80">+</span>
                </div>

                <div className="text-center pb-1">
                  <span className="text-[10px] font-cinzel font-bold tracking-widest text-indigo-800">
                    GÊNESIS
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Efeitos Dinâmicos das Mãos Selecionadas */}
          <div className="text-[11px] bg-neutral-900 p-3 rounded-xl border border-neutral-800 text-slate-300 space-y-2">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono border-b border-neutral-800 pb-1">
              <span>Efeitos Ativos das Mãos:</span>
              <span>Bloqueio Mútuo Ativo</span>
            </div>

            {activeTerminusEffects.length === 0 && activeGenesisEffects.length === 0 ? (
              <p className="text-[10px] text-slate-500 italic">
                Nenhum dedo selecionado. Clique nos níveis (I a V) de Terminus ou Gênesis acima para ativar seus efeitos.
              </p>
            ) : (
              <div className="space-y-1.5">
                {activeTerminusEffects.map((eff) => (
                  <div key={`term-${eff.nivel}`} className="bg-red-950/30 border border-red-900/40 rounded-lg p-2 text-red-200 leading-relaxed">
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="font-cinzel text-red-300">
                        Terminus {ROMAN_NUMERALS[eff.nivel]} ({eff.dedo})
                      </strong>
                      <span className="text-[9px] font-mono text-red-400/80">
                        Bloqueia: {eff.bloqueia}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-200">{eff.efeito}</p>
                  </div>
                ))}

                {activeGenesisEffects.map((eff) => (
                  <div key={`gen-${eff.nivel}`} className="bg-indigo-950/30 border border-indigo-900/40 rounded-lg p-2 text-indigo-200 leading-relaxed">
                    <div className="flex items-center justify-between mb-0.5">
                      <strong className="font-cinzel text-indigo-300">
                        Gênesis {ROMAN_NUMERALS[eff.nivel]} ({eff.dedo})
                      </strong>
                      <span className="text-[9px] font-mono text-indigo-400/80">
                        Bloqueia: {eff.bloqueia}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-200">{eff.efeito}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ELEMENTOS & RUNAS (4 colunas) */}
        <div className="lg:col-span-4 bg-black/90 rounded-2xl p-4 sm:p-5 border border-neutral-700/80 shadow-xl flex flex-col justify-between space-y-4">
          <div className="text-[10px] font-cinzel tracking-wider text-slate-400 uppercase border-b border-neutral-800 pb-1 flex items-center justify-between">
            <span>TRÍADE ELEMENTAL</span>
            <span className="text-[9px] text-cyan-400">{caminhoConfig ? caminhoConfig.deus : 'Aguardando Caminho'}</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="text-[9px] font-cinzel font-bold text-slate-400 uppercase block mb-0.5">
                ELEMENTO 1
              </label>
              <input
                type="text"
                value={character.elementos?.elemento1 || ''}
                onChange={(e) => onChange({
                  ...character,
                  elementos: { ...character.elementos, elemento1: e.target.value }
                })}
                placeholder="Ex: Fogo"
                className="w-full bg-white text-black font-cinzel font-bold text-xs rounded-xl px-3 py-1.5 text-center shadow-md focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-cinzel font-bold text-slate-400 uppercase block mb-0.5">
                ELEMENTO 2
              </label>
              <input
                type="text"
                value={character.elementos?.elemento2 || ''}
                onChange={(e) => onChange({
                  ...character,
                  elementos: { ...character.elementos, elemento2: e.target.value }
                })}
                placeholder="Ex: Ar"
                className="w-full bg-white text-black font-cinzel font-bold text-xs rounded-xl px-3 py-1.5 text-center shadow-md focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[9px] font-cinzel font-bold text-slate-400 uppercase block mb-0.5">
                ELEMENTO 3 (FUSÃO DIVINA)
              </label>
              <input
                type="text"
                value={character.elementos?.elemento3 || ''}
                onChange={(e) => onChange({
                  ...character,
                  elementos: { ...character.elementos, elemento3: e.target.value }
                })}
                placeholder="Ex: Raio"
                className="w-full bg-white text-black font-cinzel font-bold text-xs rounded-xl px-3 py-1.5 text-center shadow-lg border-2 border-cyan-400 text-cyan-950 focus:outline-none"
              />
            </div>
          </div>

          {/* Sintonizar Runas */}
          <div className="pt-2 border-t border-neutral-800 space-y-2">
            <span className="text-[10px] font-cinzel tracking-wider text-slate-400 uppercase block">
              SINTONIZAR RUNAS
            </span>

            <div className="space-y-1.5">
              <select
                value={character.runasEquipadas?.corpo || ''}
                onChange={(e) => onChange({
                  ...character,
                  runasEquipadas: { ...character.runasEquipadas, corpo: e.target.value || null }
                })}
                className="w-full bg-neutral-900 border border-neutral-700 text-[10px] text-slate-200 rounded px-2 py-1.5"
              >
                <option value="">Runa de Corpo: Escolha uma opção...</option>
                {sistemaData.fragmentos_de_runa.runas.filter(r => r.categoria === 'Corpo').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nome} ({r.elemento}) - {r.efeito}
                  </option>
                ))}
              </select>

              <select
                value={character.runasEquipadas?.mente || ''}
                onChange={(e) => onChange({
                  ...character,
                  runasEquipadas: { ...character.runasEquipadas, mente: e.target.value || null }
                })}
                className="w-full bg-neutral-900 border border-neutral-700 text-[10px] text-slate-200 rounded px-2 py-1.5"
              >
                <option value="">Runa de Mente: Escolha uma opção...</option>
                {sistemaData.fragmentos_de_runa.runas.filter(r => r.categoria === 'Mente').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nome} ({r.elemento}) - {r.efeito}
                  </option>
                ))}
              </select>

              <select
                value={character.runasEquipadas?.alma || ''}
                onChange={(e) => onChange({
                  ...character,
                  runasEquipadas: { ...character.runasEquipadas, alma: e.target.value || null }
                })}
                className="w-full bg-neutral-900 border border-neutral-700 text-[10px] text-slate-200 rounded px-2 py-1.5"
              >
                <option value="">Runa de Alma: Escolha uma opção...</option>
                {sistemaData.fragmentos_de_runa.runas.filter(r => r.categoria === 'Alma').map(r => (
                  <option key={r.id} value={r.id}>
                    {r.nome} ({r.elemento}) - {r.efeito}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </div>

      {/* =========================================================================
          BLOCO 6: TABELAS DE HABILIDADES (Automatizadas conforme o Nível Pessoal)
          ========================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        
        {/* HABILIDADES DE ATUAÇÃO */}
        <div className="bg-[#111111]/90 rounded-2xl p-4 sm:p-5 border border-black/40 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-purple-300 uppercase">
              HABILIDADES DE ATUAÇÃO
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {atuacaoConfig ? `${atuacaoConfig.nome} • Nv ${nivelAtual}` : 'Escolha uma Atuação'}
            </span>
          </div>

          <div className="space-y-3">
            {(character.habilidadesAtuacao || []).map((hab, idx) => {
              const unlockLvl = hab.nivelDesbloqueio || (idx === 0 ? 1 : idx === 1 ? 3 : 6);
              return (
                <div key={idx} className="bg-black/80 rounded-xl p-3 border border-neutral-800 space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                      Nv {unlockLvl}
                    </span>
                    <input
                      type="text"
                      value={hab.nome || ''}
                      onChange={(e) => {
                        const updated = [...character.habilidadesAtuacao];
                        updated[idx] = { ...updated[idx], nome: e.target.value };
                        updateField('habilidadesAtuacao', updated);
                      }}
                      placeholder={idx === 0 ? 'Habilidade Inata...' : `Habilidade Adicional (Nv ${unlockLvl})...`}
                      className="bg-transparent font-cinzel font-bold text-xs text-white placeholder-neutral-600 focus:outline-none flex-1"
                    />
                    <input
                      type="text"
                      value={hab.custo || ''}
                      onChange={(e) => {
                        const updated = [...character.habilidadesAtuacao];
                        updated[idx] = { ...updated[idx], custo: e.target.value };
                        updateField('habilidadesAtuacao', updated);
                      }}
                      placeholder="Custo..."
                      className="w-24 text-right bg-neutral-900 text-[10px] text-purple-300 px-2 py-1 rounded border border-neutral-700 focus:outline-none"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={hab.descricao || ''}
                    onChange={(e) => {
                      const updated = [...character.habilidadesAtuacao];
                      updated[idx] = { ...updated[idx], descricao: e.target.value };
                      updateField('habilidadesAtuacao', updated);
                    }}
                    placeholder="Descrição da habilidade..."
                    className="w-full bg-transparent text-[11px] text-slate-300 placeholder-neutral-700 resize-none focus:outline-none leading-relaxed"
                  />
                </div>
              );
            })}

            {nivelAtual < 6 && (
              <div className="text-[10px] text-slate-500 font-mono text-center pt-1">
                {nivelAtual < 3
                  ? 'Próxima habilidade de Atuação desbloqueia no Nível 3.'
                  : 'Próxima habilidade de Atuação desbloqueia no Nível 6.'}
              </div>
            )}
          </div>
        </div>

        {/* HABILIDADES DO CAMINHO */}
        <div className="bg-[#111111]/90 rounded-2xl p-4 sm:p-5 border border-black/40 shadow-xl">
          <div className="flex items-center justify-between mb-3 border-b border-neutral-800 pb-2">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-cyan-300 uppercase">
              HABILIDADES DO CAMINHO
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">
              {caminhoConfig ? `${caminhoConfig.deus} • Nv ${nivelAtual}` : 'Escolha um Caminho'}
            </span>
          </div>

          {!caminhoConfig ? (
            <div className="text-center py-8 px-4 bg-black/50 rounded-xl border border-neutral-800 text-slate-400 text-xs">
              Selecione um <strong>Caminho</strong> no topo da ficha para carregar os poderes divinos automaticamente.
            </div>
          ) : (character.habilidadesCaminho || []).length === 0 ? (
            <div className="text-center py-8 px-4 bg-black/50 rounded-xl border border-neutral-800 text-slate-400 text-xs space-y-1">
              <p className="font-semibold text-cyan-300">Nenhuma habilidade de Caminho ativa no Nível 1.</p>
              <p className="text-[11px] text-slate-500">
                Os poderes de {caminhoConfig.deus} desbloqueiam automaticamente nos Níveis 2, 5 e 8.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {character.habilidadesCaminho.map((hab, idx) => (
                <div key={idx} className="bg-black/80 rounded-xl p-3 border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    {hab.nivelDesbloqueio && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                        Nv {hab.nivelDesbloqueio}
                      </span>
                    )}
                    <input
                      type="text"
                      value={hab.nome || ''}
                      onChange={(e) => {
                        const updated = [...character.habilidadesCaminho];
                        updated[idx] = { ...updated[idx], nome: e.target.value };
                        updateField('habilidadesCaminho', updated);
                      }}
                      placeholder={`Habilidade #${idx + 1}...`}
                      className="bg-transparent font-cinzel font-bold text-xs text-white placeholder-neutral-600 focus:outline-none flex-1"
                    />
                    <input
                      type="text"
                      value={hab.custo || ''}
                      onChange={(e) => {
                        const updated = [...character.habilidadesCaminho];
                        updated[idx] = { ...updated[idx], custo: e.target.value };
                        updateField('habilidadesCaminho', updated);
                      }}
                      placeholder="Custo..."
                      className="w-24 text-right bg-neutral-900 text-[10px] text-cyan-300 px-2 py-1 rounded border border-neutral-700 focus:outline-none"
                    />
                  </div>

                  <textarea
                    rows={2}
                    value={hab.descricao || ''}
                    onChange={(e) => {
                      const updated = [...character.habilidadesCaminho];
                      updated[idx] = { ...updated[idx], descricao: e.target.value };
                      updateField('habilidadesCaminho', updated);
                    }}
                    placeholder="Descrição da habilidade de caminho..."
                    className="w-full bg-transparent text-[11px] text-slate-300 placeholder-neutral-700 resize-none focus:outline-none leading-relaxed"
                  />

                  {/* Seletor opcional caso queira trocar o poder manualmente */}
                  {caminhoConfig.habilidades && (
                    <select
                      onChange={(e) => handleSelectCaminhoPower(idx, e.target.value)}
                      value=""
                      className="w-full bg-neutral-900/70 border border-neutral-800 text-[10px] text-slate-400 rounded px-2 py-1 focus:outline-none"
                    >
                      <option value="">Trocar poder manualmente ({caminhoConfig.deus})...</option>
                      {caminhoConfig.habilidades.map((h, hIdx) => (
                        <option key={hIdx} value={h.nome}>
                          Nv {h.nivel}: {h.nome} ({h.custo})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ))}

              {nivelAtual < 8 && (
                <div className="text-[10px] text-slate-500 font-mono text-center pt-1">
                  {nivelAtual < 5
                    ? 'Próximo poder do Caminho desbloqueia no Nível 5.'
                    : 'Próximos poderes do Caminho desbloqueiam no Nível 8.'}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* =========================================================================
          BLOCO 7: TABELA DE INVENTÁRIO
          ========================================================================= */}
      <div className="bg-[#111111]/90 rounded-2xl p-4 sm:p-5 border border-black/40 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 border-b border-neutral-800 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <h3 className="font-cinzel text-xs font-bold tracking-widest text-slate-200 uppercase">
              INVENTÁRIO & EQUIPAMENTO
            </h3>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              totalPeso > maxPeso ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-neutral-800 text-slate-300'
            }`}>
              Carga: {totalPeso.toFixed(1)} / {maxPeso} kg
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddItem}
            className="flex items-center gap-1.5 text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-200 px-3 py-1.5 rounded-xl border border-purple-700/50 transition-all font-semibold shadow-md active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Item
          </button>
        </div>

        {(!character.inventario || character.inventario.length === 0) ? (
          <div className="text-center py-8 px-4 bg-black/50 rounded-xl border border-neutral-800 text-slate-400">
            <PackageOpen className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-300">O inventário está vazio.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clique no botão "+ Adicionar Item" acima para criar suas armas, itens de suporte ou documentos.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
              <thead>
                <tr className="border-b border-neutral-800 text-[10px] font-cinzel text-slate-400 uppercase">
                  <th className="py-2 px-2 w-10 text-center">Eq.</th>
                  <th className="py-2 px-2 w-32">Nome</th>
                  <th className="py-2 px-2 w-28">Tipo</th>
                  <th className="py-2 px-2">Descrição</th>
                  <th className="py-2 px-2 w-28">Dano / Cura</th>
                  <th className="py-2 px-2 w-16 text-center">Peso</th>
                  <th className="py-2 px-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {character.inventario.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-neutral-900/60 transition-colors">
                    <td className="py-2 px-2 text-center">
                      <input
                        type="checkbox"
                        checked={Boolean(item.equipado)}
                        onChange={(e) => handleUpdateItem(idx, 'equipado', e.target.checked)}
                        className="rounded accent-purple-600 w-4 h-4 cursor-pointer"
                        title="Equipado"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.nome || ''}
                        onChange={(e) => handleUpdateItem(idx, 'nome', e.target.value)}
                        placeholder="Nome do item..."
                        className="w-full bg-transparent font-bold text-white focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <select
                        value={item.tipo || 'Arma'}
                        onChange={(e) => handleUpdateItem(idx, 'tipo', e.target.value)}
                        className="bg-neutral-900 border border-neutral-800 text-[11px] text-slate-300 rounded px-1.5 py-0.5 focus:outline-none"
                      >
                        <option value="Arma">Arma</option>
                        <option value="Item Suporte">Item Suporte</option>
                        <option value="Documentos">Documentos</option>
                        <option value="Besteirol">Besteiról</option>
                      </select>
                    </td>
                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={item.descricao || ''}
                        onChange={(e) => handleUpdateItem(idx, 'descricao', e.target.value)}
                        placeholder="Efeito ou anotações..."
                        className="w-full bg-transparent text-slate-400 focus:outline-none text-[11px]"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={item.danoCura || ''}
                          onChange={(e) => handleUpdateItem(idx, 'danoCura', e.target.value)}
                          placeholder="Ex: +1D6"
                          className="w-16 bg-neutral-900 font-mono text-[11px] text-yellow-300 px-1.5 py-0.5 rounded border border-neutral-800 focus:outline-none text-center"
                        />
                        {item.danoCura && item.danoCura.includes('D') && (
                          <button
                            type="button"
                            onClick={() => {
                              const match = item.danoCura.match(/D(\d+)/i);
                              const dieFaces = match ? match[1] : 6;
                              onQuickRoll({
                                title: `Dano/Efeito: ${item.nome || 'Item'}`,
                                periciaName: null,
                                atributoName: null,
                                periciaDie: `D${dieFaces}`,
                                atributoDie: null,
                                bonusDice: [],
                                bonusModifier: item.tipo === 'Arma' ? 1 : 0
                              });
                            }}
                            className="p-1 rounded bg-yellow-950/60 hover:bg-yellow-900 text-yellow-400"
                            title="Rolar Dano/Cura deste item"
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.peso ?? 0}
                        onChange={(e) => handleUpdateItem(idx, 'peso', parseFloat(e.target.value) || 0)}
                        className="w-12 bg-neutral-900 font-mono text-[11px] text-slate-300 px-1 py-0.5 rounded border border-neutral-800 text-center focus:outline-none"
                      />
                    </td>
                    <td className="py-2 px-2 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="text-neutral-600 hover:text-red-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          BLOCO 8: SERVOS DO PERSONAGEM (Até 6 Servos)
          ========================================================================= */}
      <div className="bg-[#111111]/90 rounded-2xl p-4 sm:p-5 border border-black/40 shadow-xl mt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-neutral-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <h3 className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-slate-200 uppercase flex items-center gap-2">
              <Swords className="w-4 h-4 text-purple-400" /> SERVOS ({servosList.length} / 6)
            </h3>
            {isVersado && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40">
                Versado: Akasha de Servo Ativo
              </span>
            )}
          </div>

          {canAddServo ? (
            <button
              type="button"
              onClick={handleAddServo}
              className="flex items-center gap-1.5 text-xs bg-purple-950/80 hover:bg-purple-900 text-purple-200 px-3.5 py-1.5 rounded-xl border border-purple-700/50 transition-all font-semibold shadow-md active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" /> Adicionar Servo
            </button>
          ) : (
            <span className="text-[11px] font-mono text-slate-500 bg-neutral-900 px-3 py-1 rounded-lg border border-neutral-800">
              Limite de 6 servos atingido
            </span>
          )}
        </div>

        {servosList.length === 0 ? (
          <div className="text-center py-8 px-4 bg-black/50 rounded-xl border border-neutral-800 text-slate-400">
            <p className="text-xs font-semibold text-slate-300">Nenhum servo invocado ou vinculado.</p>
            <p className="text-[11px] text-slate-500 mt-1">
              Clique em "+ Adicionar Servo" acima para cadastrar seus familiares, invocações ou construtos.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {servosList.map((servo, idx) => {
              const isExpanded = expandedServos[servo.id] !== false; // Expansível por padrão

              return (
                <div
                  key={servo.id || idx}
                  className="bg-black/75 rounded-2xl border border-neutral-800 hover:border-purple-900/60 transition-all overflow-hidden shadow-lg"
                >
                  {/* Cabeçalho do Card de Servo (Expansível / Recolhível) */}
                  <div
                    onClick={() => toggleServoExpanded(servo.id)}
                    className="p-3.5 sm:p-4 flex items-center justify-between gap-3 cursor-pointer bg-neutral-950/80 hover:bg-neutral-900/80 transition-colors select-none"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        className="p-1 rounded bg-neutral-800 text-slate-300 hover:text-white"
                        title={isExpanded ? "Recolher" : "Expandir"}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-cinzel font-bold text-sm text-purple-200 truncate">
                            {servo.nome || `Servo #${idx + 1}`}
                          </span>
                          <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.2 rounded-full font-mono font-bold">
                            Nv {servo.nivel || 1}
                          </span>
                          {servo.elemento && (
                            <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2 py-0.2 rounded-full font-mono">
                              {servo.elemento}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                          <span className="text-red-400 flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {servo.existenciaAtual ?? 10} / {servo.existenciaMax ?? 10}
                          </span>
                          {isVersado && (
                            <span className="text-cyan-400 flex items-center gap-1">
                              <Sparkles className="w-3 h-3" /> {servo.akashaAtual ?? 2} / {servo.akashaMax ?? 2}
                            </span>
                          )}
                          {servo.objetivoBuff && (
                            <span className="text-slate-400 hidden sm:inline truncate max-w-[200px]">
                              • Buff: {servo.objetivoBuff}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveServo(servo.id, servo.nome);
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Remover servo"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Conteúdo Expansível do Servo */}
                  {isExpanded && (
                    <div className="p-4 sm:p-5 border-t border-neutral-800 space-y-4">
                      {/* Linha 1: Nome, Aparência, Nível */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-5 bg-neutral-900/80 rounded-xl p-2.5 border border-neutral-800">
                          <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
                            NOME DO SERVO
                          </label>
                          <input
                            type="text"
                            value={servo.nome || ''}
                            onChange={(e) => handleUpdateServo(idx, 'nome', e.target.value)}
                            placeholder="Ex: Lobo Espectral..."
                            className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-4 bg-neutral-900/80 rounded-xl p-2.5 border border-neutral-800">
                          <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
                            APARÊNCIA / FORMA
                          </label>
                          <input
                            type="text"
                            value={servo.aparencia || ''}
                            onChange={(e) => handleUpdateServo(idx, 'aparencia', e.target.value)}
                            placeholder="Ex: Quimera de chamas..."
                            className="w-full bg-transparent text-xs text-slate-200 focus:outline-none"
                          />
                        </div>

                        <div className="sm:col-span-3 bg-neutral-900/80 rounded-xl p-2.5 border border-neutral-800 flex flex-col justify-between">
                          <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
                            NÍVEL (1 A 8)
                          </label>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleUpdateServo(idx, 'nivel', Math.max(1, (parseInt(servo.nivel, 10) || 1) - 1))}
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-slate-200"
                            >
                              -
                            </button>
                            <span className="font-cinzel font-bold text-xs text-yellow-400 font-mono">
                              Nível {servo.nivel || 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateServo(idx, 'nivel', Math.min(8, (parseInt(servo.nivel, 10) || 1) + 1))}
                              className="w-6 h-6 rounded bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-slate-200"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Linha 2: Elemento e Objetivo (Buff) */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-neutral-900/80 rounded-xl p-2.5 border border-neutral-800">
                          <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
                            ELEMENTO DO SERVO
                          </label>
                          <input
                            type="text"
                            value={servo.elemento || ''}
                            onChange={(e) => handleUpdateServo(idx, 'elemento', e.target.value)}
                            placeholder="Ex: Fogo, Sombra, Sangue..."
                            className="w-full bg-transparent text-xs font-bold text-cyan-300 focus:outline-none"
                          />
                        </div>

                        <div className="bg-neutral-900/80 rounded-xl p-2.5 border border-neutral-800">
                          <label className="text-[9px] font-cinzel tracking-wider text-slate-400 uppercase block mb-1">
                            OBJETIVO (BUFF CONCEDIDO AO JOGADOR)
                          </label>
                          <input
                            type="text"
                            value={servo.objetivoBuff || ''}
                            onChange={(e) => handleUpdateServo(idx, 'objetivoBuff', e.target.value)}
                            placeholder="Ex: Concede +1D4 em Defesa ou Esquiva..."
                            className="w-full bg-transparent text-xs font-medium text-purple-300 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Linha 3: Status Vitais do Servo (Existência & Akasha [se Versado]) */}
                      <div className={`grid grid-cols-1 ${isVersado ? 'sm:grid-cols-2' : ''} gap-3`}>
                        {/* EXISTÊNCIA (VIDA) */}
                        <div className="bg-neutral-900/90 rounded-xl p-3 border border-neutral-800 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-cinzel font-bold text-red-400 flex items-center gap-1.5">
                              <Heart className="w-4 h-4 fill-red-500/20" /> EXISTÊNCIA (VIDA)
                            </span>
                            <div className="flex items-center gap-1.5 font-mono">
                              <input
                                type="number"
                                value={servo.existenciaAtual ?? 10}
                                onChange={(e) => handleUpdateServo(idx, 'existenciaAtual', parseInt(e.target.value, 10) || 0)}
                                className="w-12 text-center bg-black text-red-300 font-bold text-xs rounded py-0.5 border border-neutral-700 focus:outline-none"
                              />
                              <span className="text-slate-500">/</span>
                              <input
                                type="number"
                                value={servo.existenciaMax ?? 10}
                                onChange={(e) => handleUpdateServo(idx, 'existenciaMax', parseInt(e.target.value, 10) || 0)}
                                className="w-12 text-center bg-black text-slate-300 font-bold text-xs rounded py-0.5 border border-neutral-700 focus:outline-none"
                                title="Existência Máxima"
                              />
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                            <span>Resistência Vital</span>
                            <div className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => handleUpdateServo(idx, 'existenciaAtual', Math.max(0, (servo.existenciaAtual ?? 10) - 1))}
                                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                              >
                                -1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateServo(idx, 'existenciaAtual', Math.min(servo.existenciaMax ?? 10, (servo.existenciaAtual ?? 10) + 1))}
                                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                              >
                                +1
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateServo(idx, 'existenciaAtual', servo.existenciaMax ?? 10)}
                                className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-400"
                              >
                                Full
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* AKASHA (RENDERIZADO APENAS SE VERSADO) */}
                        {isVersado && (
                          <div className="bg-neutral-900/90 rounded-xl p-3 border border-neutral-800 space-y-2">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-cinzel font-bold text-cyan-400 flex items-center gap-1.5">
                                <Sparkles className="w-4 h-4 fill-cyan-500/20" /> AKASHA DO SERVO
                              </span>
                              <div className="flex items-center gap-1.5 font-mono">
                                <input
                                  type="number"
                                  value={servo.akashaAtual ?? 2}
                                  onChange={(e) => handleUpdateServo(idx, 'akashaAtual', parseInt(e.target.value, 10) || 0)}
                                  className="w-12 text-center bg-black text-cyan-300 font-bold text-xs rounded py-0.5 border border-neutral-700 focus:outline-none"
                                />
                                <span className="text-slate-500">/</span>
                                <input
                                  type="number"
                                  value={servo.akashaMax ?? 2}
                                  onChange={(e) => handleUpdateServo(idx, 'akashaMax', parseInt(e.target.value, 10) || 0)}
                                  className="w-12 text-center bg-black text-slate-300 font-bold text-xs rounded py-0.5 border border-neutral-700 focus:outline-none"
                                  title="Akasha Máximo"
                                />
                              </div>
                            </div>

                            <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1">
                              <span className="text-cyan-400/80">Canalização Mântrica</span>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateServo(idx, 'akashaAtual', Math.max(0, (servo.akashaAtual ?? 2) - 1))}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                                >
                                  -1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateServo(idx, 'akashaAtual', Math.min(servo.akashaMax ?? 2, (servo.akashaAtual ?? 2) + 1))}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-slate-200"
                                >
                                  +1
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateServo(idx, 'akashaAtual', servo.akashaMax ?? 2)}
                                  className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-cyan-400"
                                >
                                  Full
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Linha 4: Atributos do Servo */}
                      <div>
                        <span className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          ATRIBUTOS DO SERVO (D4 A D12)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {ATRIBUTOS_KEYS.map((attr) => {
                            const dieVal = servo.atributos?.[attr.id] || '1D4';
                            return (
                              <div key={attr.id} className="bg-black/80 rounded-xl p-2 border border-neutral-800 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-300 font-cinzel font-bold text-[10px] truncate">
                                    {attr.nome}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onQuickRoll({
                                      title: `Servo ${servo.nome || 'Servo'}: ${attr.nome}`,
                                      periciaName: null,
                                      atributoName: attr.nome,
                                      periciaDie: null,
                                      atributoDie: dieVal,
                                      bonusDice: [],
                                      bonusModifier: 0
                                    })}
                                    className="p-1 rounded bg-purple-950/60 hover:bg-purple-900 text-purple-300"
                                    title={`Rolar ${attr.nome} (${dieVal})`}
                                  >
                                    <Dices className="w-3 h-3" />
                                  </button>
                                </div>
                                <select
                                  value={dieVal}
                                  onChange={(e) => handleUpdateServoNested(idx, 'atributos', attr.id, e.target.value)}
                                  className="w-full bg-neutral-900 text-yellow-400 font-cinzel font-bold text-xs py-1 px-1.5 rounded focus:outline-none cursor-pointer"
                                >
                                  {SERVO_DIE_STEPS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Linha 5: Perícias do Servo */}
                      <div>
                        <span className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          PERÍCIAS DO SERVO (D4 A D12)
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                          {PERICIAS_KEYS.map((per) => {
                            const dieVal = servo.pericias?.[per.id] || '1D4';
                            return (
                              <div key={per.id} className="bg-black/80 rounded-xl p-2 border border-neutral-800 space-y-1">
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-300 font-cinzel font-bold text-[10px] truncate">
                                    {per.nome}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => onQuickRoll({
                                      title: `Servo ${servo.nome || 'Servo'}: ${per.nome}`,
                                      periciaName: per.nome,
                                      atributoName: null,
                                      periciaDie: dieVal,
                                      atributoDie: null,
                                      bonusDice: [],
                                      bonusModifier: 0
                                    })}
                                    className="p-1 rounded bg-cyan-950/60 hover:bg-cyan-900 text-cyan-300"
                                    title={`Rolar ${per.nome} (${dieVal})`}
                                  >
                                    <Dices className="w-3 h-3" />
                                  </button>
                                </div>
                                <select
                                  value={dieVal}
                                  onChange={(e) => handleUpdateServoNested(idx, 'pericias', per.id, e.target.value)}
                                  className="w-full bg-neutral-900 text-cyan-400 font-cinzel font-bold text-xs py-1 px-1.5 rounded focus:outline-none cursor-pointer"
                                >
                                  {SERVO_DIE_STEPS.map(d => (
                                    <option key={d} value={d}>{d}</option>
                                  ))}
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Linha 6: Ataques do Servo */}
                      <div className="space-y-2 pt-2 border-t border-neutral-800">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-cinzel font-bold text-slate-400 uppercase tracking-wider">
                            ATAQUES DO SERVO
                          </span>
                          <button
                            type="button"
                            onClick={() => handleAddServoAttack(idx)}
                            className="flex items-center gap-1 text-[11px] text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900 px-2 py-0.5 rounded border border-purple-800/40"
                          >
                            <Plus className="w-3 h-3" /> Adicionar Ataque
                          </button>
                        </div>

                        {(!servo.ataques || servo.ataques.length === 0) ? (
                          <p className="text-[11px] text-slate-500 italic">Nenhum ataque configurado para este servo.</p>
                        ) : (
                          <div className="space-y-2">
                            {servo.ataques.map((atk, atkIdx) => (
                              <div key={atk.id || atkIdx} className="flex flex-wrap items-center gap-2 bg-neutral-950 p-2 rounded-xl border border-neutral-800">
                                <input
                                  type="text"
                                  value={atk.nome || ''}
                                  onChange={(e) => handleUpdateServoAttack(idx, atkIdx, 'nome', e.target.value)}
                                  placeholder="Nome do ataque..."
                                  className="flex-1 min-w-[120px] bg-transparent text-xs font-bold text-white focus:outline-none px-1"
                                />

                                <div className="flex items-center gap-1.5">
                                  <label className="text-[9px] text-slate-400 uppercase">Acerto:</label>
                                  <input
                                    type="text"
                                    value={atk.dadoAtaque || ''}
                                    onChange={(e) => handleUpdateServoAttack(idx, atkIdx, 'dadoAtaque', e.target.value)}
                                    placeholder="Ex: 1D6"
                                    className="w-16 bg-neutral-900 text-center font-mono text-xs text-cyan-300 px-1 py-0.5 rounded border border-neutral-700"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onQuickRoll({
                                      title: `Ataque: ${servo.nome} — ${atk.nome || 'Ataque'}`,
                                      periciaName: null,
                                      atributoName: null,
                                      periciaDie: atk.dadoAtaque || '1D6',
                                      atributoDie: null,
                                      bonusDice: [],
                                      bonusModifier: 0
                                    })}
                                    className="p-1 rounded bg-cyan-950 text-cyan-300 hover:text-white"
                                    title="Rolar Ataque"
                                  >
                                    <Dices className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <div className="flex items-center gap-1.5">
                                  <label className="text-[9px] text-slate-400 uppercase">Dano:</label>
                                  <input
                                    type="text"
                                    value={atk.dadoDano || ''}
                                    onChange={(e) => handleUpdateServoAttack(idx, atkIdx, 'dadoDano', e.target.value)}
                                    placeholder="Ex: 1D8"
                                    className="w-16 bg-neutral-900 text-center font-mono text-xs text-yellow-300 px-1 py-0.5 rounded border border-neutral-700"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => onQuickRoll({
                                      title: `Dano: ${servo.nome} — ${atk.nome || 'Ataque'}`,
                                      periciaName: null,
                                      atributoName: null,
                                      periciaDie: atk.dadoDano || '1D8',
                                      atributoDie: null,
                                      bonusDice: [],
                                      bonusModifier: 0
                                    })}
                                    className="p-1 rounded bg-yellow-950 text-yellow-300 hover:text-white"
                                    title="Rolar Dano"
                                  >
                                    <Dices className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveServoAttack(idx, atkIdx)}
                                  className="p-1 text-neutral-600 hover:text-red-400 ml-auto"
                                  title="Remover ataque"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}