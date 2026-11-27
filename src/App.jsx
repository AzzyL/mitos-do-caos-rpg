import React, { useState, useEffect, useRef } from 'react';
import HeaderNav from './components/HeaderNav';
import CharacterSheet from './components/CharacterSheet';
import DiceRollerDrawer from './components/DiceRollerDrawer';
import ApostaCaosModal from './components/ApostaCaosModal';
import RulesQuickReferenceModal from './components/RulesQuickReferenceModal';
import AuthModal from './components/AuthModal';
import CampaignHub from './components/CampaignHub';
import CampaignRoom from './components/CampaignRoom';
import {
  INITIAL_CHARACTER,
  calculateMaxVida,
  calculateMaxEquilibrio,
  calculateMaxAkasha,
  getAtuacaoConfig,
  getCaminhoConfig
} from './utils/characterCalculations';
import { executeRoll } from './utils/diceRoller';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';
import {
  Plus,
  FileUp,
  FileDown,
  Trash2,
  Heart,
  Brain,
  Sparkles,
  ArrowLeft,
  Flame,
  Users,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';

const CHARACTERS_STORAGE_KEY = 'mitos_do_caos_characters_v1';
const LEGACY_STORAGE_KEY = 'mitos_do_caos_character_v2';
const NAV_STORAGE_KEY = 'mitos_do_caos_nav_state';
const ROLLS_STORAGE_KEY = 'mitos_do_caos_rolls_v2';

export function normalizeCharacterVitals(rawChar) {
  if (!rawChar || typeof rawChar !== 'object') {
    return INITIAL_CHARACTER;
  }

  const base = {
    ...INITIAL_CHARACTER,
    ...rawChar
  };

  const maxVida = calculateMaxVida(base);
  const maxEquilibrio = calculateMaxEquilibrio(base);
  const maxAkasha = calculateMaxAkasha(base);

  let vidaAtual = base.vidaAtual;
  if (!base.vidaEditada && (vidaAtual === undefined || vidaAtual === null || (vidaAtual === 0 && maxVida > 0))) {
    vidaAtual = maxVida;
  }

  let eqAtual = base.equilibrioAtual ?? base.sanidadeAtual;
  if (!base.equilibrioEditada && (eqAtual === undefined || eqAtual === null || (eqAtual === 0 && maxEquilibrio > 0))) {
    eqAtual = maxEquilibrio;
  }

  const akashaAtual = base.akashaAtual ?? maxAkasha;

  return {
    ...base,
    vidaAtual: vidaAtual ?? 0,
    equilibrioAtual: eqAtual ?? 0,
    sanidadeAtual: eqAtual ?? 0,
    akashaAtual
  };
}

const loadInitialCharacters = () => {
  try {
    const saved = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(c => ({
          ...normalizeCharacterVitals(c),
          id: c.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        }));
      }
    }

    // Migração automática da ficha antiga (v2) se existir
    const legacySaved = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacySaved) {
      const parsedLegacy = JSON.parse(legacySaved);
      if (parsedLegacy && typeof parsedLegacy === 'object') {
        const migrated = {
          ...normalizeCharacterVitals(parsedLegacy),
          id: parsedLegacy.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
        };
        const initialList = [migrated];
        localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(initialList));
        return initialList;
      }
    }
  } catch (e) {
    console.error("Erro ao carregar fichas:", e);
  }
  return [];
};

const getInitialNav = () => {
  try {
    const saved = localStorage.getItem(NAV_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        activeView: parsed.activeView || 'fichas',
        selectedCharacterId: parsed.selectedCharacterId || null,
        activeCampaign: parsed.activeCampaign || null
      };
    }
  } catch (e) {}
  return { activeView: 'fichas', selectedCharacterId: null, activeCampaign: null };
};

export default function App() {
  const [navState] = useState(getInitialNav);
  const [characters, setCharacters] = useState(loadInitialCharacters);
  const [activeView, setActiveView] = useState(navState.activeView || 'fichas'); // 'fichas' | 'ficha' | 'campanha'
  const [selectedCharacterId, setSelectedCharacterId] = useState(navState.selectedCharacterId || null);
  const [activeCampaign, setActiveCampaign] = useState(navState.activeCampaign || null);

  const [rollHistory, setRollHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(ROLLS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Auth & Carregamento de Sessão (Evita deslogar ou resetar tela no F5)
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals / Drawers
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState(false);
  const [isApostaModalOpen, setIsApostaModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  // Ficha ativa selecionada
  const selectedCharacter = characters.find(c => c.id === selectedCharacterId) || (characters.length > 0 ? characters[0] : null);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    }).catch(() => {}).finally(() => {
      setAuthLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setAuthLoading(false);
      if (!session?.user) {
        setActiveCampaign(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // Salva lista de fichas no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
      if (selectedCharacter) {
        localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(selectedCharacter));
      }
    } catch (e) {}
  }, [characters, selectedCharacter]);

  // Salva estado de navegação (activeView, selectedCharacterId, activeCampaign) para persistir no F5
  useEffect(() => {
    try {
      localStorage.setItem(NAV_STORAGE_KEY, JSON.stringify({
        activeView,
        selectedCharacterId: selectedCharacter?.id || selectedCharacterId,
        activeCampaign
      }));
    } catch (e) {}
  }, [activeView, selectedCharacterId, selectedCharacter, activeCampaign]);

  // Se estiver na visão 'ficha' mas não houver ficha selecionada ou ela não existir, ajusta para 'fichas'
  useEffect(() => {
    if (activeView === 'ficha') {
      if (characters.length === 0) {
        setActiveView('fichas');
      } else if (!selectedCharacterId || !characters.some(c => c.id === selectedCharacterId)) {
        setSelectedCharacterId(characters[0].id);
      }
    }
  }, [activeView, characters, selectedCharacterId]);

  // Sincroniza a ficha ativa com a campanha no Supabase sempre que houver alteração
  useEffect(() => {
    if (!supabase || !activeCampaign || !user || !selectedCharacter) return;
    if (activeCampaign.mestre_id === user.id) return;

    const timer = setTimeout(async () => {
      await supabase.from('campaign_members').upsert({
        campaign_id: activeCampaign.id,
        user_id: user.id,
        role: 'jogador',
        character_data: selectedCharacter,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id,user_id' });
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedCharacter, activeCampaign, user]);

  useEffect(() => {
    try {
      localStorage.setItem(ROLLS_STORAGE_KEY, JSON.stringify(rollHistory.slice(0, 50)));
    } catch (e) {}
  }, [rollHistory]);

  const broadcastRollToCampaign = async (rollResult) => {
    if (!supabase || !activeCampaign || !user) return;
    const isGM = activeCampaign.mestre_id === user.id;
    await supabase.from('campaign_rolls').insert({
      campaign_id: activeCampaign.id,
      user_id: user.id,
      sender_name: isGM ? 'Mestre' : (selectedCharacter?.nome || user.email?.split('@')[0] || 'Jogador'),
      is_gm_roll: isGM,
      is_public: !isGM,
      roll_data: rollResult
    });
  };

  const handleAddRoll = (newRoll) => {
    setRollHistory(prev => [newRoll, ...prev]);
    broadcastRollToCampaign(newRoll);
  };

  const handleQuickRoll = (rollParams) => {
    const result = executeRoll({
      ...rollParams,
      karmaAtual: selectedCharacter?.karmaAtual || 'Neutro'
    });

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
    }

    handleAddRoll(result);
    setIsDiceDrawerOpen(true);
  };

  // Gerenciamento de Fichas
  const handleOpenCharacter = (charId) => {
    setSelectedCharacterId(charId);
    setActiveView('ficha');
  };

  const handleNewCharacter = () => {
    const newChar = {
      ...normalizeCharacterVitals(INITIAL_CHARACTER),
      id: `char_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      nome: 'Novo Personagem'
    };
    setCharacters(prev => [newChar, ...prev]);
    setSelectedCharacterId(newChar.id);
    setActiveView('ficha');
  };

  const handleDeleteCharacter = (charId, charName, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Deseja realmente excluir a ficha "${charName || 'Sem Nome'}"? Esta ação não pode ser desfeita.`)) {
      setCharacters(prev => {
        const next = prev.filter(c => c.id !== charId);
        if (selectedCharacterId === charId) {
          const nextSelected = next[0]?.id || null;
          setSelectedCharacterId(nextSelected);
          if (!nextSelected) {
            setActiveView('fichas');
          }
        }
        return next;
      });
    }
  };

  const handleUpdateSelectedCharacter = (updatedChar) => {
    const normalized = normalizeCharacterVitals(updatedChar);
    setCharacters(prev => {
      const idx = prev.findIndex(c => c.id === normalized.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = normalized;
        return copy;
      }
      return [...prev, normalized];
    });
  };

  const handleResetCharacter = () => {
    if (!selectedCharacter) return;
    if (window.confirm("Deseja realmente redefinir os dados desta ficha para uma ficha em branco?")) {
      handleUpdateSelectedCharacter({
        ...normalizeCharacterVitals(INITIAL_CHARACTER),
        id: selectedCharacter.id
      });
    }
  };

  const handleExportJSON = (charToExport) => {
    const targetChar = charToExport || selectedCharacter;
    if (!targetChar) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(targetChar, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = (targetChar.nome || 'personagem').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `ficha_mitos_${safeName || 'em_branco'}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = async (importedData) => {
    if (!importedData || typeof importedData !== 'object') {
      alert("Arquivo inválido!");
      return;
    }

    const normalized = normalizeCharacterVitals(importedData);
    const newChar = {
      ...normalized,
      id: normalized.id || `char_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    };

    setCharacters(prev => {
      const exists = prev.some(c => c.id === newChar.id);
      if (exists) {
        return prev.map(c => (c.id === newChar.id ? newChar : c));
      }
      return [newChar, ...prev];
    });

    setSelectedCharacterId(newChar.id);
    setActiveView('ficha');

    if (supabase && activeCampaign && user && activeCampaign.mestre_id !== user.id) {
      await supabase.from('campaign_members').upsert({
        campaign_id: activeCampaign.id,
        user_id: user.id,
        role: 'jogador',
        character_data: newChar,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id,user_id' });
    }

    alert(`Ficha "${newChar.nome || 'Importada'}" importada com sucesso!`);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          handleImportJSON(parsed);
        } catch (err) {
          alert('Erro ao importar JSON. Verifique se o arquivo é válido.');
        }
      };
      reader.readAsText(file);
    }
    e.target.value = '';
  };

  // 1. TELA DE CARREGAMENTO (Evita piscar tela de login ao dar F5 com sessão ativa)
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0a0f] text-slate-100 p-4">
        <div className="w-14 h-14 rounded-2xl bg-purple-950/80 border border-purple-500/50 flex items-center justify-center shadow-2xl shadow-purple-950/70 mb-4 animate-bounce">
          <Flame className="w-7 h-7 text-purple-400" />
        </div>
        <h2 className="font-cinzel text-lg font-bold tracking-widest text-purple-200">
          MITOS DO CAOS RPG
        </h2>
        <p className="text-xs text-purple-300/60 font-mono mt-1">
          Carregando sessão...
        </p>
      </div>
    );
  }

  // 2. TELA DE LOGIN INICIAL (Sem botão fechar, exigida antes de liberar fichas ou campanhas)
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-[#0b0a0f] text-slate-100 p-4 selection:bg-purple-600 selection:text-white">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-900 via-indigo-950 to-black border border-purple-500/40 flex items-center justify-center shadow-xl shadow-purple-950/50 mx-auto mb-3">
            <Flame className="w-8 h-8 text-purple-400 animate-pulse" />
          </div>
          <h1 className="font-cinzel text-2xl font-bold tracking-widest bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
            MITOS DO CAOS RPG
          </h1>
          <p className="text-xs text-purple-300/70 font-mono mt-1">
            Ficha Interativa & Mesas Virtuais
          </p>
        </div>

        <AuthModal
          isOpen={true}
          inline={true}
          hideClose={true}
          onGuestLogin={() => setUser({ id: 'guest', email: 'jogador@local' })}
        />
      </div>
    );
  }

  // 3. APLICAÇÃO PRINCIPAL (Usuário autenticado)
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0a0f] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
      {/* Input oculto para importação de JSON na lista de fichas */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept=".json"
        className="hidden"
      />

      <HeaderNav
        character={selectedCharacter || INITIAL_CHARACTER}
        user={user}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => {
          supabase?.auth.signOut();
          setUser(null);
        }}
        onReset={handleResetCharacter}
        onImport={handleImportJSON}
        onExport={() => handleExportJSON(selectedCharacter)}
        onPrint={() => window.print()}
        onToggleDiceDrawer={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
        onOpenApostaModal={() => setIsApostaModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        diceHistoryCount={rollHistory.length}
      />

      <main className="flex-1 p-3 sm:p-5 md:p-6 max-w-7xl mx-auto w-full">
        {/* ABA: SELETOR DE FICHAS */}
        {activeView === 'fichas' ? (
          <div className="space-y-6">
            {/* Cabeçalho da Lista de Fichas */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#12101b] border border-purple-900/50 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div>
                <h2 className="font-cinzel text-lg sm:text-xl font-bold tracking-wider text-white flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-purple-400" /> MINHAS FICHAS
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Selecione um personagem para abrir a ficha completa ou crie uma nova.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-slate-200 text-xs font-semibold transition-all shadow-md"
                  title="Importar ficha em arquivo .json"
                >
                  <FileUp className="w-4 h-4 text-emerald-400" />
                  <span>Importar JSON</span>
                </button>

                <button
                  type="button"
                  onClick={handleNewCharacter}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-cinzel font-bold shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Nova Ficha</span>
                </button>
              </div>
            </div>

            {/* Grid de Cards de Fichas */}
            {characters.length === 0 ? (
              <div className="text-center py-16 px-4 bg-[#12101b]/60 border border-purple-900/30 rounded-2xl">
                <div className="w-12 h-12 rounded-2xl bg-purple-950/70 border border-purple-500/30 flex items-center justify-center mx-auto mb-3">
                  <Flame className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-cinzel text-base font-bold text-white mb-1">
                  Nenhuma ficha encontrada
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mb-5">
                  Você ainda não possui personagens cadastrados. Comece criando uma ficha em branco ou importando um arquivo JSON existente.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleNewCharacter}
                    className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white font-cinzel font-bold text-xs shadow-lg"
                  >
                    + Criar Primeira Ficha
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-slate-300 text-xs font-semibold"
                  >
                    Importar JSON
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {characters.map((char) => {
                  const maxV = calculateMaxVida(char);
                  const maxE = calculateMaxEquilibrio(char);
                  const maxA = calculateMaxAkasha(char);
                  const atuacaoCfg = getAtuacaoConfig(char.atuacao);
                  const caminhoCfg = getCaminhoConfig(char.caminho);

                  return (
                    <div
                      key={char.id}
                      onClick={() => handleOpenCharacter(char.id)}
                      className="bg-[#12101b] border border-purple-900/40 hover:border-purple-500/70 rounded-2xl p-4 sm:p-5 shadow-xl transition-all hover:scale-[1.02] cursor-pointer group flex flex-col justify-between space-y-4"
                    >
                      {/* Topo do Card: Foto/Símbolo + Nome + Nível */}
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-black border border-purple-500/50 flex-shrink-0 overflow-hidden flex items-center justify-center shadow-md">
                          {char.foto ? (
                            <img src={char.foto} alt={char.nome} className="w-full h-full object-cover" />
                          ) : (
                            <Flame className="w-5 h-5 text-purple-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-cinzel font-bold text-sm sm:text-base text-white group-hover:text-purple-300 transition-colors truncate">
                              {char.nome || 'Sem Nome'}
                            </h3>
                            <span className="text-[10px] bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono font-bold whitespace-nowrap">
                              Nv {char.nivelPessoal || 1}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 truncate mt-0.5">
                            <span className="text-purple-300 font-medium">
                              {atuacaoCfg?.nome || char.atuacao || 'Sem Atuação'}
                            </span>
                            {caminhoCfg && (
                              <>
                                <span className="mx-1.5">•</span>
                                <span className="text-cyan-300 font-medium">{caminhoCfg.deus}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status Vitais Resumidos */}
                      <div className="grid grid-cols-3 gap-2 bg-black/60 rounded-xl p-2.5 border border-purple-950/40 text-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                            <Heart className="w-2.5 h-2.5 text-red-400" /> Vida
                          </span>
                          <span className="text-xs font-mono font-bold text-red-300">
                            {char.vidaAtual ?? maxV} <span className="text-slate-500 text-[10px]">/ {maxV}</span>
                          </span>
                        </div>
                        <div className="space-y-0.5 border-x border-neutral-800">
                          <span className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                            <Brain className="w-2.5 h-2.5 text-indigo-400" /> Equilíbrio
                          </span>
                          <span className="text-xs font-mono font-bold text-indigo-300">
                            {char.equilibrioAtual ?? maxE} <span className="text-slate-500 text-[10px]">/ {maxE}</span>
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 uppercase font-mono flex items-center justify-center gap-1">
                            <Sparkles className="w-2.5 h-2.5 text-cyan-400" /> Akasha
                          </span>
                          <span className="text-xs font-mono font-bold text-cyan-300">
                            {char.akashaAtual ?? maxA} <span className="text-slate-500 text-[10px]">/ {maxA}</span>
                          </span>
                        </div>
                      </div>

                      {/* Ações do Card */}
                      <div className="flex items-center justify-between pt-2 border-t border-purple-900/30">
                        <span className="text-xs font-cinzel font-bold text-purple-300 group-hover:text-purple-200 flex items-center gap-1.5">
                          Abrir Ficha <ExternalLink className="w-3.5 h-3.5" />
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExportJSON(char);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-950/50 transition-colors"
                            title="Exportar JSON"
                          >
                            <FileDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCharacter(char.id, char.nome, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-950/50 transition-colors"
                            title="Excluir ficha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : activeView === 'ficha' && selectedCharacter ? (
          /* ABA: FICHA ESPECÍFICA ABERTA */
          <div className="space-y-3">
            {/* Barra superior de retorno para a lista de fichas */}
            <div className="flex items-center justify-between bg-[#12101b] border border-purple-900/50 rounded-2xl p-3 sm:p-4 shadow-xl">
              <button
                type="button"
                onClick={() => setActiveView('fichas')}
                className="flex items-center gap-2 text-xs font-cinzel font-bold text-purple-200 hover:text-white bg-purple-950/80 hover:bg-purple-900 border border-purple-500/40 px-3.5 py-2 rounded-xl transition-all shadow-md hover:scale-105 active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 text-purple-400" />
                <span>← Voltar para Fichas</span>
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 hidden sm:inline font-mono">Ficha aberta:</span>
                <span className="font-cinzel font-bold text-sm text-purple-200 truncate max-w-[180px] sm:max-w-none">
                  {selectedCharacter.nome || 'Personagem Sem Nome'}
                </span>
                <span className="text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 px-2 py-0.5 rounded-full font-mono font-bold">
                  Nv {selectedCharacter.nivelPessoal || 1}
                </span>
              </div>
            </div>

            <CharacterSheet
              character={selectedCharacter}
              onChange={handleUpdateSelectedCharacter}
              onQuickRoll={handleQuickRoll}
            />
          </div>
        ) : activeCampaign && user ? (
          /* ABA: SALA DA CAMPANHA */
          <CampaignRoom
            campaign={activeCampaign}
            user={user}
            character={selectedCharacter || INITIAL_CHARACTER}
            onOpenMySheet={() => {
              if (selectedCharacter) setActiveView('ficha');
              else setActiveView('fichas');
            }}
            onLeaveCampaign={() => setActiveCampaign(null)}
          />
        ) : (
          /* ABA: HUB DE CAMPANHAS */
          <CampaignHub
            user={user}
            character={selectedCharacter || INITIAL_CHARACTER}
            onSelectCampaign={(camp) => setActiveCampaign(camp)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      <DiceRollerDrawer
        isOpen={isDiceDrawerOpen}
        onClose={() => setIsDiceDrawerOpen(false)}
        character={selectedCharacter || INITIAL_CHARACTER}
        rollHistory={rollHistory}
        onAddRoll={handleAddRoll}
        onClearHistory={() => setRollHistory([])}
        activeCampaign={activeCampaign}
        user={user}
      />

      <ApostaCaosModal
        isOpen={isApostaModalOpen}
        onClose={() => setIsApostaModalOpen(false)}
        character={selectedCharacter || INITIAL_CHARACTER}
        onUpdateCharacter={handleUpdateSelectedCharacter}
        onAddLog={handleAddRoll}
        activeCampaign={activeCampaign}
        user={user}
      />

      <RulesQuickReferenceModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <footer className="no-print py-4 px-6 text-center text-xs text-neutral-600 border-t border-purple-950/20 bg-[#0d0c13]">
        <p>Mitos do Caos RPG — Sistema por Azzy & Kira • Ficha Interativa desenvolvida para web</p>
      </footer>
    </div>
  );
}
