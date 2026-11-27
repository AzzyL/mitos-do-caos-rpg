import React, { useState, useEffect } from 'react';
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
  calculateMaxAkasha
} from './utils/characterCalculations';
import { executeRoll } from './utils/diceRoller';
import { supabase } from './lib/supabase';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mitos_do_caos_character_v2';
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

export default function App() {
  const [character, setCharacter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return normalizeCharacterVitals(parsed);
      }
    } catch (e) {}
    return normalizeCharacterVitals(INITIAL_CHARACTER);
  });

  const [rollHistory, setRollHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(ROLLS_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Auth & Campanha
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('ficha'); // 'ficha' | 'campanha'
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals / Drawers
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState(false);
  const [isApostaModalOpen, setIsApostaModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (!session?.user) {
        setActiveCampaign(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    } catch (e) {}
  }, [character]);

  // Sincroniza a ficha do jogador com a campanha ativa sempre que houver qualquer alteração (mesmo na aba Minha Ficha)
  useEffect(() => {
    if (!supabase || !activeCampaign || !user) return;
    if (activeCampaign.mestre_id === user.id) return;

    const timer = setTimeout(async () => {
      await supabase.from('campaign_members').upsert({
        campaign_id: activeCampaign.id,
        user_id: user.id,
        role: 'jogador',
        character_data: character,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id,user_id' });
    }, 400);

    return () => clearTimeout(timer);
  }, [character, activeCampaign, user]);

  useEffect(() => {
    try {
      localStorage.setItem(ROLLS_STORAGE_KEY, JSON.stringify(rollHistory.slice(0, 50)));
    } catch (e) {}
  }, [rollHistory]);

  // Publica a rolagem na campanha ativa (se houver)
  const broadcastRollToCampaign = async (rollResult) => {
    if (!supabase || !activeCampaign || !user) return;
    const isGM = activeCampaign.mestre_id === user.id;
    await supabase.from('campaign_rolls').insert({
      campaign_id: activeCampaign.id,
      user_id: user.id,
      sender_name: isGM ? 'Mestre' : (character.nome || user.email?.split('@')[0] || 'Jogador'),
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
      karmaAtual: character.karmaAtual || 'Neutro'
    });

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      try { confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } }); } catch (e) {}
    }

    handleAddRoll(result);
    setIsDiceDrawerOpen(true);
  };

  const handleResetCharacter = () => {
    if (window.confirm("Deseja realmente criar uma nova ficha? Os dados serão redefinidos para uma ficha em branco.")) {
      setCharacter(normalizeCharacterVitals(INITIAL_CHARACTER));
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(character, null, 2));
    const downloadAnchor = document.createElement('a');
    const safeName = (character.nome || 'personagem').toLowerCase().replace(/[^a-z0-9]/g, '_');
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

    const normalizedCharacter = normalizeCharacterVitals(importedData);
    setCharacter(normalizedCharacter);

    if (supabase && activeCampaign && user && activeCampaign.mestre_id !== user.id) {
      await supabase.from('campaign_members').upsert({
        campaign_id: activeCampaign.id,
        user_id: user.id,
        role: 'jogador',
        character_data: normalizedCharacter,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id,user_id' });
    }

    alert("Ficha importada com sucesso!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0a0f] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
      <HeaderNav
        character={character}
        user={user}
        activeView={activeView}
        onChangeView={setActiveView}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={() => supabase?.auth.signOut()}
        onReset={handleResetCharacter}
        onImport={handleImportJSON}
        onExport={handleExportJSON}
        onPrint={() => window.print()}
        onToggleDiceDrawer={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
        onOpenApostaModal={() => setIsApostaModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        diceHistoryCount={rollHistory.length}
      />

      <main className="flex-1 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
        {activeView === 'ficha' ? (
          <CharacterSheet
            character={character}
            onChange={setCharacter}
            onQuickRoll={handleQuickRoll}
          />
        ) : activeCampaign && user ? (
          <CampaignRoom
            campaign={activeCampaign}
            user={user}
            character={character}
            onOpenMySheet={() => setActiveView('ficha')}
            onLeaveCampaign={() => setActiveCampaign(null)}
          />
        ) : (
          <CampaignHub
            user={user}
            character={character}
            onSelectCampaign={(camp) => setActiveCampaign(camp)}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      <DiceRollerDrawer
        isOpen={isDiceDrawerOpen}
        onClose={() => setIsDiceDrawerOpen(false)}
        character={character}
        rollHistory={rollHistory}
        onAddRoll={handleAddRoll}
        onClearHistory={() => setRollHistory([])}
      />

      <ApostaCaosModal
        isOpen={isApostaModalOpen}
        onClose={() => setIsApostaModalOpen(false)}
        character={character}
        onUpdateCharacter={setCharacter}
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