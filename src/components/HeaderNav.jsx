import React, { useRef } from 'react';
import { 
  FileDown, 
  FileUp, 
  Printer, 
  Dices, 
  RotateCcw, 
  BookOpen, 
  Flame, 
  Sparkles,
  ShieldAlert,
  Save
} from 'lucide-react';

export default function HeaderNav({
  character,
  user,
  activeView,
  onChangeView,
  onOpenAuth,
  onLogout,
  onReset,
  onImport,
  onExport,
  onPrint,
  onToggleDiceDrawer,
  onOpenApostaModal,
  onOpenRulesModal,
  diceHistoryCount = 0,
  isDirty = false
}) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          onImport(parsed);
        } catch (err) {
          alert('Erro ao importar JSON. Verifique se o arquivo é válido.');
        }
      };
      reader.readAsText(file);
    }
    // reset input value so re-importing works
    e.target.value = '';
  };

  return (
    <header className="no-print sticky top-0 z-40 bg-[#0f0e15]/90 backdrop-blur-md border-b border-purple-900/30 px-4 py-3 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-900 via-indigo-950 to-black border border-purple-500/40 flex items-center justify-center shadow-lg shadow-purple-950/50">
            <Flame className="w-5 h-5 text-purple-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-cinzel text-lg md:text-xl font-bold tracking-widest bg-gradient-to-r from-purple-200 via-purple-300 to-indigo-200 bg-clip-text text-transparent">
              MITOS DO CAOS
            </h1>
            <div className="flex items-center gap-2 text-xs text-purple-300/70 font-mono">
              <span>PLAYTEST FAST</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <Save className="w-3 h-3" /> Salvo no Navegador
              </span>
            </div>
          </div>
        </div>

        {/* Abas Fichas / Campanhas */}
        <div className="flex items-center bg-black/70 p-1 rounded-xl border border-purple-900/40">
          <button
            onClick={() => onChangeView('fichas')}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold transition-all ${
              activeView === 'fichas' || activeView === 'ficha'
                ? 'bg-purple-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Fichas
          </button>
          <button
            onClick={() => onChangeView('campanha')}
            className={`px-3 py-1 rounded-lg text-xs font-cinzel font-bold transition-all ${
              activeView === 'campanha'
                ? 'bg-purple-700 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Campanhas
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Aposta com o Caos */}
          <button
            onClick={onOpenApostaModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-950/80 to-purple-950/80 hover:from-red-900 hover:to-purple-900 border border-red-500/40 text-red-200 text-xs font-semibold shadow-md transition-all hover:scale-105 active:scale-95"
            title="Apostar 1 Ponto de Caos (8D8 contra 8D8 da Entidade)"
          >
            <ShieldAlert className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Apostar com o Caos</span>
            <span className="bg-red-500/20 text-red-300 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {character?.pontosCaos ?? 1} PC
            </span>
          </button>

          {/* Regras Rápidas */}
          <button
            onClick={onOpenRulesModal}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181622] hover:bg-purple-950/50 border border-purple-500/30 text-purple-200 text-xs font-medium transition-all"
            title="Tabelas de Mantra/Karma e Regras"
          >
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span className="hidden md:inline">Regras</span>
          </button>

          {/* Imprimir / Salvar PDF */}
          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181622] hover:bg-purple-950/50 border border-purple-500/30 text-slate-200 text-xs font-medium transition-all"
            title="Imprimir ou Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span className="hidden lg:inline">PDF / Imprimir</span>
          </button>

          {/* Exportar JSON */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181622] hover:bg-purple-950/50 border border-purple-500/30 text-slate-200 text-xs font-medium transition-all"
            title="Exportar dados da ficha em formato .json"
          >
            <FileDown className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Exportar</span>
          </button>

          {/* Importar JSON */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181622] hover:bg-purple-950/50 border border-purple-500/30 text-slate-200 text-xs font-medium transition-all"
            title="Importar ficha existente de um arquivo .json"
          >
            <FileUp className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Importar</span>
          </button>

          {/* Nova Ficha */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#181622] hover:bg-red-950/40 border border-red-500/20 text-red-300 text-xs font-medium transition-all"
            title="Limpar e criar nova ficha"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Nova</span>
          </button>

          {/* Toggle Dice Roller Sidebar */}
          <button
            onClick={onToggleDiceDrawer}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-purple-900/40 transition-all hover:scale-105 active:scale-95 ml-1"
          >
            <Dices className="w-4 h-4" />
            <span>Dados</span>
            {diceHistoryCount > 0 && (
              <span className="bg-purple-950 text-purple-200 text-[10px] font-mono px-1.5 py-0.2 rounded-full border border-purple-400/40">
                {diceHistoryCount}
              </span>
            )}
          </button>

          {user ? (
          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-red-950/50 border border-neutral-700 text-slate-300 text-xs"
            title={`Logado como ${user.email} (Clique para sair)`}
          >
            Sair
          </button>
        ) : (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 text-xs font-semibold"
          >
            Entrar
          </button>
        )}
        </div>
      </div>
    </header>
  );
}
