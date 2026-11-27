import React, { useState, useEffect } from 'react';
import {
  Crown,
  Dices,
  Eye,
  EyeOff,
  Skull,
  Plus,
  Trash2,
  Shield,
  Heart,
  ShieldAlert,
  BookOpen,
  Sparkles,
  AlertTriangle,
  Swords,
  Edit,
  X,
  ChevronDown,
  ChevronUp,
  Brain
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { executeRoll, rollDie, DIE_STEPS } from '../utils/diceRoller';
import sistemaData from '../data/sistema.json';

const MONSTER_ATTRS = [
  { id: 'forca', nome: 'Força' },
  { id: 'inteligencia', nome: 'Inteligência' },
  { id: 'agilidade', nome: 'Agilidade' },
  { id: 'vitalidade', nome: 'Vitalidade' },
  { id: 'aparencia', nome: 'Aparência' },
  { id: 'instinto', nome: 'Instinto' }
];

const MONSTER_PERICIAS = [
  { id: 'esforco', nome: 'Esforço' },
  { id: 'mente', nome: 'Mente' },
  { id: 'destreza', nome: 'Destreza' },
  { id: 'resistencia', nome: 'Resistência' },
  { id: 'social', nome: 'Social' },
  { id: 'sentidos', nome: 'Sentidos' }
];

const DEFAULT_MONSTER_FORM = {
  nome: '',
  nd: 1,
  elementoCategoria: '',
  defesa: 7,
  vida_atual: 25,
  vida_max: 25,
  equilibrioAtual: 10,
  equilibrioMax: 10,
  akashaAtual: 2,
  akashaMax: 2,
  atributos: {
    forca: '1D6',
    inteligencia: '1D6',
    agilidade: '1D6',
    vitalidade: '1D6',
    aparencia: '1D6',
    instinto: '1D6'
  },
  pericias: {
    esforco: '1D6',
    mente: '1D6',
    destreza: '1D6',
    resistencia: '1D6',
    social: '1D6',
    sentidos: '1D6'
  },
  ataques: [
    { id: 'atk_1', nome: 'Ataque Primário', dadoAtaque: '1D6', dadoDano: '1D8' }
  ],
  limiar_efeito: '',
  habilidades: [
    { id: 'hab_1', nome: '', descricao: '', custo: '' }
  ],
  notas: '',
  visivel_jogadores: false
};

export default function GMScreen({ campaign, user, allRolls, pendingBets }) {
  const [gmSubTab, setGmSubTab] = useState('monstros'); // 'monstros' | 'rolador' | 'tabelas'

  // Rolador do Mestre
  const [gmRollTitle, setGmRollTitle] = useState('Teste Oculto do Mestre');
  const [gmDie1, setGmDie1] = useState('D6');
  const [gmDie2, setGmDie2] = useState('D6');
  const [gmMod, setGmMod] = useState(0);
  const [isPublicRoll, setIsPublicRoll] = useState(false);

  // Monstros
  const [monsters, setMonsters] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMonsterId, setEditingMonsterId] = useState(null);
  const [monsterForm, setMonsterForm] = useState(DEFAULT_MONSTER_FORM);
  const [expandedMonsterCard, setExpandedMonsterCard] = useState({});

  // Tabelas de Mantra/Karma da Sessão
  const [activeMantraTable, setActiveMantraTable] = useState('tabela_1');
  const [activeKarmaTable, setActiveKarmaTable] = useState('tabela_1');

  useEffect(() => {
    if (!supabase || !campaign) return;
    const fetchMonsters = async () => {
      const { data } = await supabase
        .from('campaign_monsters')
        .select('*')
        .eq('campaign_id', campaign.id)
        .order('created_at', { ascending: true });
      if (data) setMonsters(data);
    };
    fetchMonsters();

    const channel = supabase
      .channel(`monsters-${campaign.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaign_monsters',
        filter: `campaign_id=eq.${campaign.id}`
      }, fetchMonsters)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [campaign.id]);

  // Rolar dados do Mestre (Oculto ou Público)
  const handleGmRoll = async () => {
    const result = executeRoll({
      title: gmRollTitle || 'Rolagem do Mestre',
      periciaName: 'Mestre',
      atributoName: 'Criatura/Cena',
      periciaDie: gmDie1,
      atributoDie: gmDie2,
      bonusDice: [],
      bonusModifier: gmMod,
      dt: null,
      karmaAtual: 'Neutro'
    });

    await supabase.from('campaign_rolls').insert({
      campaign_id: campaign.id,
      user_id: user.id,
      sender_name: 'Mestre',
      is_gm_roll: true,
      is_public: isPublicRoll,
      roll_data: result
    });
  };

  // Rolar ataque de um monstro diretamente
  const handleRollMonsterAttack = async (monster, atk) => {
    const atkDie = atk.dadoAtaque || monster.dado_ataque || '1D6';
    const danoDie = atk.dadoDano || monster.dano || '1D6';

    const result = executeRoll({
      title: `Ataque de ${monster.nome}: ${atk.nome || 'Golpe'}`,
      periciaName: monster.nome,
      atributoName: 'Ataque',
      periciaDie: atkDie.includes('D') ? atkDie : `D${atkDie}`,
      atributoDie: null,
      bonusDice: [],
      bonusModifier: 0,
      dt: null,
      karmaAtual: 'Neutro'
    });

    await supabase.from('campaign_rolls').insert({
      campaign_id: campaign.id,
      user_id: user.id,
      sender_name: `Mestre (${monster.nome})`,
      is_gm_roll: true,
      is_public: true,
      roll_data: {
        ...result,
        danoRecomendado: danoDie
      }
    });
  };

  // Responder à Aposta com o Caos de um jogador
  const handleResolveChaosBet = async (bet) => {
    const gmDice = Array.from({ length: 8 }, () => rollDie(8));
    const gmTotal = gmDice.reduce((a, b) => a + b, 0);
    const status = bet.player_total >= gmTotal ? 'player_won' : 'gm_won';

    await supabase
      .from('chaos_bets')
      .update({
        gm_dice: gmDice,
        gm_total: gmTotal,
        status
      })
      .eq('id', bet.id);
  };

  // Abrir formulário para novo monstro
  const handleOpenNewMonsterForm = () => {
    setEditingMonsterId(null);
    setMonsterForm(DEFAULT_MONSTER_FORM);
    setIsFormOpen(true);
  };

  // Abrir formulário para editar monstro existente
  const handleOpenEditMonsterForm = (monster) => {
    setEditingMonsterId(monster.id);
    const fichaData = monster.ficha_data || {};
    setMonsterForm({
      nome: monster.nome || '',
      nd: monster.nd || 1,
      elementoCategoria: fichaData.elementoCategoria || '',
      defesa: monster.defesa || 7,
      vida_atual: monster.vida_atual ?? 20,
      vida_max: monster.vida_max ?? 20,
      equilibrioAtual: fichaData.equilibrioAtual ?? 10,
      equilibrioMax: fichaData.equilibrioMax ?? 10,
      akashaAtual: fichaData.akashaAtual ?? 2,
      akashaMax: fichaData.akashaMax ?? 2,
      atributos: fichaData.atributos || DEFAULT_MONSTER_FORM.atributos,
      pericias: fichaData.pericias || DEFAULT_MONSTER_FORM.pericias,
      ataques: fichaData.ataques && fichaData.ataques.length > 0
        ? fichaData.ataques
        : [{ id: 'atk_1', nome: 'Ataque', dadoAtaque: monster.dado_ataque || '1D6', dadoDano: monster.dano || '1D6' }],
      limiar_efeito: monster.limiar_efeito || fichaData.limiar_efeito || '',
      habilidades: fichaData.habilidades || [{ id: 'hab_1', nome: '', descricao: '', custo: '' }],
      notas: monster.notas || fichaData.notas || '',
      visivel_jogadores: Boolean(monster.visivel_jogadores ?? fichaData.visivel_jogadores)
    });
    setIsFormOpen(true);
  };

  // Salvar Monstro Completo (Criação ou Edição)
  const handleSaveMonster = async (e) => {
    e.preventDefault();
    if (!monsterForm.nome.trim()) return;

    const payload = {
      campaign_id: campaign.id,
      nome: monsterForm.nome.trim(),
      nd: Number(monsterForm.nd) || 1,
      defesa: Number(monsterForm.defesa) || 7,
      vida_atual: Number(monsterForm.vida_atual) || 20,
      vida_max: Number(monsterForm.vida_max) || 20,
      dado_ataque: monsterForm.ataques?.[0]?.dadoAtaque || 'D6',
      dano: monsterForm.ataques?.[0]?.dadoDano || '1D6',
      limiar_efeito: monsterForm.limiar_efeito || '',
      notas: monsterForm.notas || '',
      visivel_jogadores: Boolean(monsterForm.visivel_jogadores),
      ficha_data: monsterForm
    };

    if (editingMonsterId) {
      await supabase
        .from('campaign_monsters')
        .update(payload)
        .eq('id', editingMonsterId);
    } else {
      await supabase
        .from('campaign_monsters')
        .insert(payload);
    }

    setIsFormOpen(false);
    setEditingMonsterId(null);
  };

  // Toggle "Mostrar na Cena"
  const handleToggleSceneVisibility = async (monster) => {
    const isVisible = monster.visivel_jogadores === true || monster.ficha_data?.visivel_jogadores === true;
    const nextVal = !isVisible;
    const updatedFichaData = {
      ...(monster.ficha_data || {}),
      visivel_jogadores: nextVal
    };

    await supabase
      .from('campaign_monsters')
      .update({
        visivel_jogadores: nextVal,
        ficha_data: updatedFichaData
      })
      .eq('id', monster.id);
  };

  const handleUpdateMonsterHp = async (monster, delta) => {
    const nextHp = Math.max(0, Math.min(monster.vida_max, monster.vida_atual + delta));
    await supabase
      .from('campaign_monsters')
      .update({ vida_atual: nextHp })
      .eq('id', monster.id);
  };

  const handleDeleteMonster = async (id, nome) => {
    if (window.confirm(`Deseja realmente excluir o monstro "${nome || 'Monstro'}"?`)) {
      await supabase.from('campaign_monsters').delete().eq('id', id);
    }
  };

  // Helper para adicionar/remover ataques no form
  const handleAddAttackToForm = () => {
    setMonsterForm(prev => ({
      ...prev,
      ataques: [
        ...(prev.ataques || []),
        { id: `atk_${Date.now()}`, nome: 'Novo Ataque', dadoAtaque: '1D6', dadoDano: '1D6' }
      ]
    }));
  };

  const handleRemoveAttackFromForm = (idx) => {
    setMonsterForm(prev => ({
      ...prev,
      ataques: prev.ataques.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateAttackInForm = (idx, field, value) => {
    const atks = [...(monsterForm.ataques || [])];
    atks[idx] = { ...atks[idx], [field]: value };
    setMonsterForm(prev => ({ ...prev, ataques: atks }));
  };

  // Helper para adicionar/remover habilidades no form
  const handleAddHabToForm = () => {
    setMonsterForm(prev => ({
      ...prev,
      habilidades: [
        ...(prev.habilidades || []),
        { id: `hab_${Date.now()}`, nome: '', descricao: '', custo: '' }
      ]
    }));
  };

  const handleRemoveHabFromForm = (idx) => {
    setMonsterForm(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateHabInForm = (idx, field, value) => {
    const habs = [...(monsterForm.habilidades || [])];
    habs[idx] = { ...habs[idx], [field]: value };
    setMonsterForm(prev => ({ ...prev, habilidades: habs }));
  };

  return (
    <div className="bg-[#13101d] border-2 border-yellow-600/40 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-5">
      {/* Cabeçalho do Escudo do Mestre */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-yellow-600/30 pb-3">
        <div className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <h3 className="font-cinzel text-base font-bold text-yellow-200 tracking-wider">
            ESCUDO DO MESTRE (ACESSO EXCLUSIVO)
          </h3>
        </div>

        <div className="flex flex-wrap gap-1.5 text-xs">
          <button
            onClick={() => setGmSubTab('monstros')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${
              gmSubTab === 'monstros' ? 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/50' : 'bg-black/50 text-slate-400'
            }`}
          >
            <Skull className="w-3.5 h-3.5" /> Fichas de Criaturas ({monsters.length})
          </button>
          <button
            onClick={() => setGmSubTab('rolador')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${
              gmSubTab === 'rolador' ? 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/50' : 'bg-black/50 text-slate-400'
            }`}
          >
            <Dices className="w-3.5 h-3.5" /> Dados & Log Total ({allRolls.length})
          </button>
          <button
            onClick={() => setGmSubTab('tabelas')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 ${
              gmSubTab === 'tabelas' ? 'bg-yellow-600/30 text-yellow-200 border border-yellow-500/50' : 'bg-black/50 text-slate-400'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> Tabelas do Mestre
          </button>
        </div>
      </div>

      {/* ALERTA DE APOSTA COM O CAOS PENDENTE PARA O MESTRE */}
      {pendingBets.length > 0 && (
        <div className="space-y-2">
          {pendingBets.map(bet => (
            <div key={bet.id} className="bg-red-950/60 border border-red-500 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
              <div>
                <div className="flex items-center gap-1.5 font-cinzel font-bold text-sm text-red-200">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>DESAFIO DE APOSTA COM O CAOS!</span>
                </div>
                <p className="text-xs text-slate-200 mt-1">
                  <strong>{bet.player_name}</strong> apostou 8D8 e tirou <strong className="text-yellow-300 font-mono text-sm">{bet.player_total}</strong>
                  {bet.desejo && <> • Desejo: <em>"{bet.desejo}"</em></>}
                </p>
              </div>
              <button
                onClick={() => handleResolveChaosBet(bet)}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-cinzel font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Dices className="w-4 h-4" /> Rolar 8D8 do Mestre (Ao Vivo)
              </button>
            </div>
          ))}
        </div>
      )}

      {/* SUB-ABA 1: FICHAS DE MONSTROS / CRIATURAS */}
      {gmSubTab === 'monstros' && (
        <div className="space-y-4">
          {/* Barra de ações dos Monstros */}
          <div className="flex items-center justify-between bg-black/60 p-3 rounded-xl border border-neutral-800">
            <div>
              <span className="font-cinzel text-xs font-bold text-slate-200 uppercase">
                CRIATURAS DA CAMPANHA
              </span>
              <p className="text-[11px] text-slate-400">
                Monstros visíveis na cena aparecem em tempo real no combate dos jogadores.
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenNewMonsterForm}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-yellow-700 to-amber-600 hover:from-yellow-600 hover:to-amber-500 text-white font-cinzel font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-4 h-4" /> Nova Ficha de Criatura
            </button>
          </div>

          {/* FORMULÁRIO COMPLETO DE CRIATURA (MODAL OU PAINEL EXPANSÍVEL) */}
          {isFormOpen && (
            <div className="bg-[#171424] border-2 border-yellow-600/60 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-yellow-600/30 pb-2">
                <h4 className="font-cinzel text-sm font-bold text-yellow-200 flex items-center gap-2">
                  <Skull className="w-4 h-4 text-yellow-400" />
                  {editingMonsterId ? 'Editar Ficha da Criatura' : 'Criar Nova Ficha de Criatura (Base Modelo Oficial)'}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMonster} className="space-y-4">
                {/* 1. IDENTIDADE */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                  <div className="sm:col-span-4 bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-slate-400 uppercase block mb-1">Nome da Criatura</label>
                    <input
                      type="text"
                      required
                      value={monsterForm.nome}
                      onChange={(e) => setMonsterForm({ ...monsterForm, nome: e.target.value })}
                      placeholder="Ex: Devorador de Éter, Espectro..."
                      className="w-full bg-transparent text-xs font-bold text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2 bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-slate-400 uppercase block mb-1">ND (Dificuldade)</label>
                    <input
                      type="number"
                      value={monsterForm.nd}
                      onChange={(e) => setMonsterForm({ ...monsterForm, nd: e.target.value })}
                      className="w-full bg-transparent font-mono text-xs font-bold text-purple-300 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-slate-400 uppercase block mb-1">Elemento / Categoria</label>
                    <input
                      type="text"
                      value={monsterForm.elementoCategoria}
                      onChange={(e) => setMonsterForm({ ...monsterForm, elementoCategoria: e.target.value })}
                      placeholder="Ex: Fogo / Primordial"
                      className="w-full bg-transparent text-xs text-cyan-300 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-3 bg-black/60 p-2.5 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <div>
                      <label className="text-[9px] font-cinzel text-slate-400 uppercase block">Mostrar na Cena?</label>
                      <span className="text-[10px] text-slate-500 font-mono">Visível aos Jogadores</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={monsterForm.visivel_jogadores}
                      onChange={(e) => setMonsterForm({ ...monsterForm, visivel_jogadores: e.target.checked })}
                      className="w-4 h-4 rounded accent-emerald-500 cursor-pointer"
                    />
                  </div>
                </div>

                {/* 2. STATUS VITAIS & DEFESA */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-red-400 uppercase block mb-1 flex items-center gap-1">
                      <Heart className="w-3 h-3" /> Vida (Atual / Máx)
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <input
                        type="number"
                        value={monsterForm.vida_atual}
                        onChange={(e) => setMonsterForm({ ...monsterForm, vida_atual: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-red-300 text-center font-bold"
                      />
                      <span className="text-slate-500">/</span>
                      <input
                        type="number"
                        value={monsterForm.vida_max}
                        onChange={(e) => setMonsterForm({ ...monsterForm, vida_max: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-slate-300 text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-indigo-400 uppercase block mb-1 flex items-center gap-1">
                      <Brain className="w-3 h-3" /> Equilíbrio
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <input
                        type="number"
                        value={monsterForm.equilibrioAtual}
                        onChange={(e) => setMonsterForm({ ...monsterForm, equilibrioAtual: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-indigo-300 text-center font-bold"
                      />
                      <span className="text-slate-500">/</span>
                      <input
                        type="number"
                        value={monsterForm.equilibrioMax}
                        onChange={(e) => setMonsterForm({ ...monsterForm, equilibrioMax: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-slate-300 text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-cyan-400 uppercase block mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Akasha
                    </label>
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <input
                        type="number"
                        value={monsterForm.akashaAtual}
                        onChange={(e) => setMonsterForm({ ...monsterForm, akashaAtual: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-cyan-300 text-center font-bold"
                      />
                      <span className="text-slate-500">/</span>
                      <input
                        type="number"
                        value={monsterForm.akashaMax}
                        onChange={(e) => setMonsterForm({ ...monsterForm, akashaMax: parseInt(e.target.value, 10) || 0 })}
                        className="w-12 bg-neutral-900 border border-neutral-700 rounded px-1.5 py-0.5 text-slate-300 text-center font-bold"
                      />
                    </div>
                  </div>

                  <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                    <label className="text-[9px] font-cinzel text-cyan-300 uppercase block mb-1 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Defesa / Esquiva
                    </label>
                    <input
                      type="number"
                      value={monsterForm.defesa}
                      onChange={(e) => setMonsterForm({ ...monsterForm, defesa: parseInt(e.target.value, 10) || 0 })}
                      className="w-full bg-neutral-900 border border-neutral-700 rounded px-2 py-0.5 font-mono text-xs text-cyan-300 font-bold"
                    />
                  </div>
                </div>

                {/* 3. ATRIBUTOS PRIMÁRIOS */}
                <div>
                  <span className="text-[10px] font-cinzel font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    ATRIBUTOS DA CRIATURA
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MONSTER_ATTRS.map(attr => (
                      <div key={attr.id} className="bg-black/70 p-2 rounded-xl border border-neutral-800 text-center">
                        <label className="text-[10px] font-cinzel text-slate-400 block mb-1">{attr.nome}</label>
                        <select
                          value={monsterForm.atributos?.[attr.id] || '1D6'}
                          onChange={(e) => setMonsterForm({
                            ...monsterForm,
                            atributos: { ...monsterForm.atributos, [attr.id]: e.target.value }
                          })}
                          className="w-full bg-neutral-900 text-yellow-400 font-cinzel font-bold text-xs py-1 rounded text-center"
                        >
                          {['1D4', '1D6', '1D8', '1D10', '1D12'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. PERÍCIAS */}
                <div>
                  <span className="text-[10px] font-cinzel font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    PERÍCIAS DA CRIATURA
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {MONSTER_PERICIAS.map(per => (
                      <div key={per.id} className="bg-black/70 p-2 rounded-xl border border-neutral-800 text-center">
                        <label className="text-[10px] font-cinzel text-slate-400 block mb-1">{per.nome}</label>
                        <select
                          value={monsterForm.pericias?.[per.id] || '1D6'}
                          onChange={(e) => setMonsterForm({
                            ...monsterForm,
                            pericias: { ...monsterForm.pericias, [per.id]: e.target.value }
                          })}
                          className="w-full bg-neutral-900 text-cyan-400 font-cinzel font-bold text-xs py-1 rounded text-center"
                        >
                          {['1D4', '1D6', '1D8', '1D10', '1D12'].map(d => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. ATAQUES DA CRIATURA */}
                <div className="space-y-2 pt-1 border-t border-neutral-800">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-cinzel font-bold text-slate-300 uppercase">
                      ATAQUES DA CRIATURA
                    </span>
                    <button
                      type="button"
                      onClick={handleAddAttackToForm}
                      className="text-[10px] bg-purple-950/70 hover:bg-purple-900 text-purple-300 px-2 py-0.5 rounded border border-purple-800/40 flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Ataque
                    </button>
                  </div>

                  <div className="space-y-2">
                    {monsterForm.ataques?.map((atk, idx) => (
                      <div key={atk.id || idx} className="flex flex-wrap items-center gap-2 bg-black/60 p-2 rounded-xl border border-neutral-800">
                        <input
                          type="text"
                          value={atk.nome}
                          onChange={(e) => handleUpdateAttackInForm(idx, 'nome', e.target.value)}
                          placeholder="Nome do ataque..."
                          className="flex-1 min-w-[120px] bg-transparent text-xs text-white font-bold focus:outline-none"
                        />
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 uppercase">Acerto:</span>
                          <input
                            type="text"
                            value={atk.dadoAtaque}
                            onChange={(e) => handleUpdateAttackInForm(idx, 'dadoAtaque', e.target.value)}
                            placeholder="1D6"
                            className="w-16 bg-neutral-900 border border-neutral-700 rounded text-center text-xs font-mono text-cyan-300"
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-[9px] text-slate-400 uppercase">Dano:</span>
                          <input
                            type="text"
                            value={atk.dadoDano}
                            onChange={(e) => handleUpdateAttackInForm(idx, 'dadoDano', e.target.value)}
                            placeholder="1D8"
                            className="w-16 bg-neutral-900 border border-neutral-700 rounded text-center text-xs font-mono text-yellow-300"
                          />
                        </div>
                        {monsterForm.ataques.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveAttackFromForm(idx)}
                            className="text-neutral-500 hover:text-red-400 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 6. LIMIAR DE EFEITO, HABILIDADES E NOTAS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-neutral-800">
                  <div className="space-y-2">
                    <label className="text-[9px] font-cinzel text-purple-300 uppercase block">
                      Limiar de Efeito (Abalar / Desespero / Medo)
                    </label>
                    <input
                      type="text"
                      value={monsterForm.limiar_efeito}
                      onChange={(e) => setMonsterForm({ ...monsterForm, limiar_efeito: e.target.value })}
                      placeholder="Ex: Medo Intenso (DT 12), Grito Aterrorizante..."
                      className="w-full bg-black/60 border border-neutral-800 rounded-xl p-2.5 text-xs text-white"
                    />

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] font-cinzel text-slate-400 uppercase">Habilidades Especiais</span>
                      <button
                        type="button"
                        onClick={handleAddHabToForm}
                        className="text-[10px] bg-neutral-800 text-slate-300 px-2 py-0.5 rounded"
                      >
                        + Habilidade
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {monsterForm.habilidades?.map((h, hIdx) => (
                        <div key={h.id || hIdx} className="bg-black/60 p-2 rounded-xl border border-neutral-800 space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <input
                              type="text"
                              value={h.nome}
                              onChange={(e) => handleUpdateHabInForm(hIdx, 'nome', e.target.value)}
                              placeholder="Nome da habilidade..."
                              className="w-full bg-transparent text-xs font-bold text-yellow-300 focus:outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveHabFromForm(hIdx)}
                              className="text-neutral-600 hover:text-red-400 p-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <textarea
                            rows={1}
                            value={h.descricao}
                            onChange={(e) => handleUpdateHabInForm(hIdx, 'descricao', e.target.value)}
                            placeholder="Efeito mecânico da habilidade..."
                            className="w-full bg-transparent text-[11px] text-slate-300 resize-none focus:outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-cinzel text-slate-400 uppercase block">
                      Notas, Fraquezas e Táticas
                    </label>
                    <textarea
                      rows={5}
                      value={monsterForm.notas}
                      onChange={(e) => setMonsterForm({ ...monsterForm, notas: e.target.value })}
                      placeholder="Imunidade a dano mental, vulnerável a eletricidade, táticas de combate..."
                      className="w-full bg-black/60 border border-neutral-800 rounded-xl p-2.5 text-xs text-slate-200 resize-none leading-relaxed focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-neutral-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-yellow-700 to-amber-600 text-white font-cinzel font-bold text-xs shadow-lg"
                  >
                    {editingMonsterId ? 'Salvar Alterações' : 'Salvar Criatura'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* LISTA DE CRIATURAS CADASTRADAS */}
          {monsters.length === 0 ? (
            <div className="text-center py-10 px-4 bg-black/50 rounded-xl border border-neutral-800 text-slate-400">
              <Skull className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-300">Nenhuma criatura cadastrada nesta campanha.</p>
              <p className="text-[11px] text-slate-500 mt-1">
                Clique no botão "+ Nova Ficha de Criatura" acima para criar seus monstros e chefes.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {monsters.map(m => {
                const ficha = m.ficha_data || {};
                const isVisible = m.visivel_jogadores === true || ficha.visivel_jogadores === true;
                const isExpanded = Boolean(expandedMonsterCard[m.id]);
                const ataques = ficha.ataques && ficha.ataques.length > 0
                  ? ficha.ataques
                  : [{ nome: 'Ataque', dadoAtaque: m.dado_ataque || '1D6', dadoDano: m.dano || '1D6' }];

                return (
                  <div
                    key={m.id}
                    className={`rounded-2xl border p-4 space-y-3 transition-all ${
                      isVisible
                        ? 'bg-[#151221] border-emerald-600/50 shadow-lg shadow-emerald-950/20'
                        : 'bg-black/80 border-neutral-800 shadow-md'
                    }`}
                  >
                    {/* Topo do Card de Monstro */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="font-cinzel text-base text-red-200">{m.nome}</strong>
                          <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800/40 px-2 py-0.2 rounded font-bold">
                            ND {m.nd}
                          </span>
                          {ficha.elementoCategoria && (
                            <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/40 px-2 py-0.2 rounded">
                              {ficha.elementoCategoria}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {/* TOGGLE MOSTRAR NA CENA */}
                        <button
                          type="button"
                          onClick={() => handleToggleSceneVisibility(m)}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                            isVisible
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500 hover:bg-emerald-900'
                              : 'bg-neutral-900 text-slate-400 border-neutral-700 hover:text-white'
                          }`}
                          title={isVisible ? "Visível aos jogadores (Clique para ocultar)" : "Oculto dos jogadores (Clique para mostrar na cena)"}
                        >
                          {isVisible ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                          <span>{isVisible ? 'Na Cena' : 'Oculto'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEditMonsterForm(m)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-yellow-300 hover:bg-neutral-800"
                          title="Editar Ficha Completa"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteMonster(m.id, m.nome)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-950/40"
                          title="Excluir monstro"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Barra de Vida & Defesa */}
                    <div className="bg-black/60 rounded-xl p-2.5 border border-neutral-900 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-red-400 flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-red-500/20" /> {m.vida_atual} / {m.vida_max}
                        </span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleUpdateMonsterHp(m, -5)} className="px-1.5 py-0.5 bg-red-950 text-red-200 rounded text-[10px]">-5</button>
                          <button onClick={() => handleUpdateMonsterHp(m, -1)} className="px-1.5 py-0.5 bg-neutral-800 text-slate-300 rounded text-[10px]">-1</button>
                          <button onClick={() => handleUpdateMonsterHp(m, 1)} className="px-1.5 py-0.5 bg-neutral-800 text-slate-300 rounded text-[10px]">+1</button>
                          <button onClick={() => handleUpdateMonsterHp(m, 5)} className="px-1.5 py-0.5 bg-neutral-800 text-slate-300 rounded text-[10px]">+5</button>
                        </div>
                        <span className="text-cyan-300 font-bold flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" /> Def {m.defesa}
                        </span>
                      </div>

                      <div className="w-full h-2 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
                        <div
                          className="h-full bg-gradient-to-r from-red-600 to-rose-500 transition-all duration-300"
                          style={{ width: `${m.vida_max > 0 ? Math.max(0, Math.min(100, (m.vida_atual / m.vida_max) * 100)) : 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Ataques com botão de rolagem rápida */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-cinzel text-slate-400 uppercase tracking-wider block">
                        Ataques & Ações:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {ataques.map((atk, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleRollMonsterAttack(m, atk)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-xs font-mono text-yellow-300 transition-colors"
                            title={`Rolar ataque ${atk.nome} (${atk.dadoAtaque || '1D6'}) + dano (${atk.dadoDano || '1D6'})`}
                          >
                            <Dices className="w-3 h-3 text-yellow-400" />
                            <span>{atk.nome}: {atk.dadoAtaque} ({atk.dadoDano})</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Limiar de efeito e notas rápidas */}
                    {m.limiar_efeito && (
                      <div className="text-[11px] text-purple-300 bg-purple-950/30 border border-purple-900/40 p-2 rounded-lg">
                        <strong>Limiar de Efeito:</strong> {m.limiar_efeito}
                      </div>
                    )}

                    {/* Botão de ver ficha completa expandida */}
                    <button
                      type="button"
                      onClick={() => setExpandedMonsterCard(prev => ({ ...prev, [m.id]: !prev[m.id] }))}
                      className="w-full text-center text-[11px] text-slate-400 hover:text-slate-200 py-1 flex items-center justify-center gap-1 pt-1 border-t border-neutral-900"
                    >
                      <span>{isExpanded ? 'Ocultar Atributos e Perícias' : 'Ver Ficha Completa (Atributos, Perícias, Habilidades)'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {/* Detalhes expandidos da ficha do monstro */}
                    {isExpanded && (
                      <div className="pt-2 border-t border-neutral-800 space-y-3 text-xs">
                        {/* Atributos */}
                        <div>
                          <span className="text-[9px] font-cinzel text-slate-400 uppercase block mb-1">Atributos</span>
                          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
                            {MONSTER_ATTRS.map(a => (
                              <div key={a.id} className="bg-neutral-950 p-1 rounded border border-neutral-800">
                                <span className="text-slate-500 block text-[8px]">{a.nome.slice(0, 3)}</span>
                                <strong className="text-yellow-400">{ficha.atributos?.[a.id] || '1D6'}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Perícias */}
                        <div>
                          <span className="text-[9px] font-cinzel text-slate-400 uppercase block mb-1">Perícias</span>
                          <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px]">
                            {MONSTER_PERICIAS.map(p => (
                              <div key={p.id} className="bg-neutral-950 p-1 rounded border border-neutral-800">
                                <span className="text-slate-500 block text-[8px]">{p.nome.slice(0, 3)}</span>
                                <strong className="text-cyan-400">{ficha.pericias?.[p.id] || '1D6'}</strong>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Habilidades e Notas */}
                        {ficha.habilidades && ficha.habilidades.some(h => h.nome) && (
                          <div className="space-y-1">
                            <span className="text-[9px] font-cinzel text-slate-400 uppercase block">Habilidades</span>
                            {ficha.habilidades.filter(h => h.nome).map((h, i) => (
                              <p key={i} className="text-[11px] text-slate-300">
                                <strong className="text-yellow-300">{h.nome}:</strong> {h.descricao}
                              </p>
                            ))}
                          </div>
                        )}

                        {m.notas && (
                          <div className="text-[11px] text-slate-400 bg-neutral-950 p-2 rounded border border-neutral-900">
                            <strong>Notas / Fraquezas:</strong> {m.notas}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUB-ABA 2: ROLADOR DO MESTRE + LOG COMPLETO DE TODOS */}
      {gmSubTab === 'rolador' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Rolador do Mestre */}
          <div className="lg:col-span-5 bg-black/70 border border-neutral-800 rounded-xl p-4 space-y-3">
            <h4 className="font-cinzel text-xs font-bold text-yellow-300 uppercase">Rolador do Mestre</h4>
            <input
              type="text"
              value={gmRollTitle}
              onChange={(e) => setGmRollTitle(e.target.value)}
              placeholder="Descrição da rolagem..."
              className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
            <div className="grid grid-cols-3 gap-2">
              <select value={gmDie1} onChange={(e) => setGmDie1(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-yellow-300">
                {['D4', 'D6', 'D8', 'D10', 'D12'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={gmDie2} onChange={(e) => setGmDie2(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-yellow-300">
                {['D4', 'D6', 'D8', 'D10', 'D12'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <input
                type="number"
                value={gmMod}
                onChange={(e) => setGmMod(parseInt(e.target.value, 10) || 0)}
                placeholder="+0"
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-white text-center font-mono"
              />
            </div>

            {/* Botão Toggle: Oculto vs Visível aos Jogadores */}
            <button
              type="button"
              onClick={() => setIsPublicRoll(!isPublicRoll)}
              className={`w-full py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                isPublicRoll
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-200'
                  : 'bg-neutral-900 border-neutral-700 text-slate-300'
              }`}
            >
              {isPublicRoll ? (
                <>
                  <Eye className="w-4 h-4 text-emerald-400" />
                  <span>Visível: Jogadores PODEM ver esta jogada</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 text-red-400" />
                  <span>Oculto: Apenas o Mestre vê esta jogada</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleGmRoll}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-yellow-700 to-amber-600 hover:from-yellow-600 hover:to-amber-500 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-2"
            >
              <Dices className="w-4 h-4" /> Rolar Dados do Mestre
            </button>
          </div>

          {/* Histórico Completo (Incluindo Ocultos) */}
          <div className="lg:col-span-7 bg-black/70 border border-neutral-800 rounded-xl p-4 space-y-2 max-h-80 overflow-y-auto">
            <h4 className="font-cinzel text-xs font-bold text-slate-300 uppercase">Todas as Rolagens da Mesa</h4>
            {allRolls.map(r => (
              <div key={r.id} className="bg-neutral-900/90 border border-neutral-800 rounded-lg p-2.5 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-purple-300">{r.sender_name}:</strong>
                    <span className="text-white">{r.roll_data?.title}</span>
                    {r.is_gm_roll && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                        r.is_public ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'
                      }`}>
                        {r.is_public ? 'Pública' : 'Oculta'}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Dados: {r.roll_data?.diceRolled?.map(d => `${d.die}(${d.value})`).join(' + ')}
                    {r.roll_data?.danoRecomendado && (
                      <span className="ml-2 text-yellow-300 font-bold">• Dano: {r.roll_data.danoRecomendado}</span>
                    )}
                  </div>
                </div>
                <span className="font-cinzel font-bold text-base text-yellow-300">{r.roll_data?.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-ABA 3: TABELAS DO ESCUDO (MANTRA, KARMA E XP) */}
      {gmSubTab === 'tabelas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Tabela de Mantra */}
          <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="font-cinzel text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Tabela de Mantra (1D8)
              </strong>
              <select value={activeMantraTable} onChange={(e) => setActiveMantraTable(e.target.value)} className="bg-black border border-emerald-800 rounded px-2 py-0.5 text-[10px] text-emerald-200">
                <option value="tabela_1">Tabela 1</option>
                <option value="tabela_2">Tabela 2</option>
              </select>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {Object.entries(sistemaData.dados_do_caos.tabelas.mantra[activeMantraTable]).map(([face, desc]) => (
                <li key={face}><strong className="text-emerald-400 font-mono">{face}:</strong> {desc}</li>
              ))}
            </ul>
          </div>

          {/* Tabela de Karma */}
          <div className="bg-red-950/20 border border-red-800/40 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="font-cinzel text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> Tabela de Karma (1D8)
              </strong>
              <select value={activeKarmaTable} onChange={(e) => setActiveKarmaTable(e.target.value)} className="bg-black border border-red-800 rounded px-2 py-0.5 text-[10px] text-red-200">
                <option value="tabela_1">Tabela 1</option>
                <option value="tabela_2">Tabela 2</option>
              </select>
            </div>
            <ul className="space-y-1 text-[11px] text-slate-300">
              {Object.entries(sistemaData.dados_do_caos.tabelas.karma[activeKarmaTable]).map(([face, desc]) => (
                <li key={face}><strong className="text-red-400 font-mono">{face}:</strong> {desc}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
