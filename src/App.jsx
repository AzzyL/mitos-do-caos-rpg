import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav';
import CharacterSheet from './components/CharacterSheet';
import DiceRollerDrawer from './components/DiceRollerDrawer';
import ApostaCaosModal from './components/ApostaCaosModal';
import RulesQuickReferenceModal from './components/RulesQuickReferenceModal';
import { INITIAL_CHARACTER } from './utils/characterCalculations';
import { executeRoll } from './utils/diceRoller';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'mitos_do_caos_character_v2';
const ROLLS_STORAGE_KEY = 'mitos_do_caos_rolls_v2';

export default function App() {
  // Load Character from localStorage or fallback to default clean character
  const [character, setCharacter] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...INITIAL_CHARACTER,
          ...parsed,
          equilibrioAtual: parsed.equilibrioAtual ?? parsed.sanidadeAtual ?? 0
        };
      }
    } catch (e) {
      console.error("Failed to load character from storage", e);
    }
    return INITIAL_CHARACTER;
  });

  // Roll history state
  const [rollHistory, setRollHistory] = useState(() => {
    try {
      const saved = localStorage.getItem(ROLLS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error("Failed to load roll history", e);
    }
    return [];
  });

  // Modals / Drawers state
  const [isDiceDrawerOpen, setIsDiceDrawerOpen] = useState(false);
  const [isApostaModalOpen, setIsApostaModalOpen] = useState(false);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  // Auto-save Character to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(character));
    } catch (e) {
      console.error("Failed to save character to storage", e);
    }
  }, [character]);

  // Auto-save Roll History
  useEffect(() => {
    try {
      localStorage.setItem(ROLLS_STORAGE_KEY, JSON.stringify(rollHistory.slice(0, 50)));
    } catch (e) {
      console.error("Failed to save roll history", e);
    }
  }, [rollHistory]);

  // Reset Character
  const handleResetCharacter = () => {
    if (window.confirm("Deseja realmente criar uma nova ficha? Os dados serão redefinidos para uma ficha em branco.")) {
      setCharacter(INITIAL_CHARACTER);
    }
  };

  // Export to JSON
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

  // Import from JSON
  const handleImportJSON = (importedData) => {
    if (!importedData || typeof importedData !== 'object') {
      alert("Arquivo inválido!");
      return;
    }
    setCharacter({
      ...INITIAL_CHARACTER,
      ...importedData,
      equilibrioAtual: importedData.equilibrioAtual ?? importedData.sanidadeAtual ?? 0
    });
    alert("Ficha importada com sucesso!");
  };

  // Print
  const handlePrint = () => {
    window.print();
  };

  // Quick Roll from clicking any Skill / Attribute / Weapon on the sheet
  const handleQuickRoll = (rollParams) => {
    const result = executeRoll({
      ...rollParams,
      karmaAtual: character.karmaAtual || 'Neutro'
    });

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {}
    }

    setRollHistory(prev => [result, ...prev]);
    setIsDiceDrawerOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0b0a0f] text-slate-100 antialiased selection:bg-purple-600 selection:text-white">
      {/* Header Navigation Bar */}
      <HeaderNav
        character={character}
        onReset={handleResetCharacter}
        onImport={handleImportJSON}
        onExport={handleExportJSON}
        onPrint={handlePrint}
        onToggleDiceDrawer={() => setIsDiceDrawerOpen(!isDiceDrawerOpen)}
        onOpenApostaModal={() => setIsApostaModalOpen(true)}
        onOpenRulesModal={() => setIsRulesModalOpen(true)}
        diceHistoryCount={rollHistory.length}
      />

      {/* Main Sheet Container */}
      <main className="flex-1 p-2 sm:p-4 md:p-6 max-w-7xl mx-auto w-full">
        <CharacterSheet
          character={character}
          onChange={setCharacter}
          onQuickRoll={handleQuickRoll}
        />
      </main>

      {/* Dice Roller Slide-Over Drawer */}
      <DiceRollerDrawer
        isOpen={isDiceDrawerOpen}
        onClose={() => setIsDiceDrawerOpen(false)}
        character={character}
        rollHistory={rollHistory}
        onAddRoll={(newRoll) => setRollHistory(prev => [newRoll, ...prev])}
        onClearHistory={() => setRollHistory([])}
      />

      {/* Aposta com o Caos Modal */}
      <ApostaCaosModal
        isOpen={isApostaModalOpen}
        onClose={() => setIsApostaModalOpen(false)}
        character={character}
        onUpdateCharacter={setCharacter}
        onAddLog={(newRoll) => setRollHistory(prev => [newRoll, ...prev])}
      />

      {/* Rules Quick Reference Modal (Mitologias, Deuses, Poderes, Atuações, Runas) */}
      <RulesQuickReferenceModal
        isOpen={isRulesModalOpen}
        onClose={() => setIsRulesModalOpen(false)}
      />

      {/* Footer */}
      <footer className="no-print py-4 px-6 text-center text-xs text-neutral-600 border-t border-purple-950/20 bg-[#0d0c13]">
        <p>
          Mitos do Caos RPG — Sistema por Azzy & Kira • Ficha Interativa desenvolvida para web
        </p>
      </footer>
    </div>
  );
}
