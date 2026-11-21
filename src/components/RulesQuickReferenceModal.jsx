import React, { useState } from 'react';
import { 
  X, 
  BookOpen, 
  Sparkles, 
  Shield, 
  Swords, 
  Compass,
  Flame,
  Zap,
  Users
} from 'lucide-react';
import sistemaData from '../data/sistema.json';

export default function RulesQuickReferenceModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('mitologias'); // mitologias, atuacoes, runas, combate
  const [selectedMitologia, setSelectedMitologia] = useState('nordica');

  if (!isOpen) return null;

  const currentMitologia = sistemaData.mitologias.find(m => m.id === selectedMitologia) || sistemaData.mitologias[0];

  return (
    <div className="no-print fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#12101b] border border-purple-900/50 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-purple-900/40 bg-[#161423]">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-purple-400" />
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-purple-100">
              Compêndio de Regras, Mitologias e Poderes
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 py-3 bg-[#141220] border-b border-purple-900/30 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mitologias')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'mitologias'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Mitologias, Deuses e Poderes</span>
          </button>

          <button
            onClick={() => setActiveTab('atuacoes')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'atuacoes'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Atuações (Classes)</span>
          </button>

          <button
            onClick={() => setActiveTab('runas')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'runas'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fragmentos de Runa (15)</span>
          </button>

          <button
            onClick={() => setActiveTab('combate')}
            className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'combate'
                ? 'bg-purple-950/80 text-purple-200 border border-purple-500/50 shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-purple-950/30'
            }`}
          >
            <Swords className="w-3.5 h-3.5 text-red-400" />
            <span>Ações de Combate</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 text-xs text-slate-300 space-y-4">
          
          {/* TAB: MITOLOGIAS, DEUSES E PODERES */}
          {activeTab === 'mitologias' && (
            <div className="space-y-5">
              {/* Mythologies Pill Selector */}
              <div className="flex flex-wrap gap-2 pb-3 border-b border-purple-900/30">
                {sistemaData.mitologias.map(mit => (
                  <button
                    key={mit.id}
                    onClick={() => setSelectedMitologia(mit.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all ${
                      selectedMitologia === mit.id
                        ? 'bg-gradient-to-r from-purple-800 to-indigo-700 text-white shadow-lg border border-purple-400/50'
                        : 'bg-[#181525] text-slate-400 hover:text-white border border-neutral-800'
                    }`}
                  >
                    {mit.nome}
                  </button>
                ))}
              </div>

              {/* Gods and Abilities under selected Mythology */}
              <div className="space-y-6">
                {currentMitologia.caminhos.map(cam => (
                  <div key={cam.id} className="bg-[#171424] border border-purple-900/40 rounded-2xl p-4 sm:p-5 shadow-xl">
                    {/* Deity Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-purple-900/30">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-cinzel text-base sm:text-lg font-bold text-white">
                            {cam.deus}
                          </h4>
                          <span className="text-xs text-purple-300/80 italic font-serif">
                            — {cam.titulo}
                          </span>
                        </div>
                      </div>

                      {/* Elements Tag */}
                      <div className="flex items-center gap-1.5 text-[11px] font-mono bg-black/50 px-3 py-1 rounded-xl border border-purple-800/40">
                        <span className="text-slate-300">{cam.elementos.elemento_1}</span>
                        <span className="text-purple-400">+</span>
                        <span className="text-slate-300">{cam.elementos.elemento_2}</span>
                        <span className="text-purple-400">=</span>
                        <span className="font-bold text-cyan-300">{cam.elementos.elemento_3}</span>
                      </div>
                    </div>

                    {/* Powers list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {cam.habilidades.map((hab, idx) => (
                        <div key={idx} className="bg-[#120f1d] border border-purple-900/30 rounded-xl p-3 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <strong className="font-cinzel text-xs font-bold text-yellow-300">
                                {hab.nome}
                              </strong>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                                Nível {hab.nivel}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-300 leading-relaxed mb-2">
                              {hab.descricao}
                            </p>
                          </div>
                          <div className="text-[10px] text-purple-400 font-mono pt-1 border-t border-purple-900/20">
                            Custo / Ação: <span className="text-slate-300">{hab.custo}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ATUAÇÕES (CLASSES) */}
          {activeTab === 'atuacoes' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                Em <em>Mitos do Caos</em>, as Atuações representam as áreas de especialização do personagem, fornecendo habilidades inatas e determinando as taxas de crescimento de Vida e Equilíbrio.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sistemaData.atuacoes.map(at => (
                  <div key={at.id} className="bg-[#171424] border border-purple-900/40 rounded-2xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-cinzel text-base font-bold text-purple-200">
                          {at.nome}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-300 mb-3 leading-relaxed">
                        {at.perfil}
                      </p>

                      {/* Habilidade Inata */}
                      <div className="bg-[#120f1d] border border-purple-900/30 rounded-xl p-3 mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <strong className="font-cinzel text-xs text-yellow-300">
                            {at.habilidade_inata.nome}
                          </strong>
                          <span className="text-[10px] font-mono text-purple-400">
                            {at.habilidade_inata.custo}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {at.habilidade_inata.descricao}
                        </p>
                      </div>
                    </div>

                    {/* Fórmulas */}
                    <div className="text-[10px] font-mono text-slate-400 bg-black/40 p-2 rounded-lg border border-purple-900/20 space-y-0.5">
                      <div>Vida: {at.formulas.vida.inicial} (Nv 1) | +{at.formulas.vida.por_nivel} / Nv</div>
                      <div>Equilíbrio: {at.formulas.sanidade.inicial} (Nv 1) | +{at.formulas.sanidade.por_nivel} / Nv</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: RUNAS */}
          {activeTab === 'runas' && (
            <div className="space-y-4">
              <p className="text-slate-400 text-xs">
                O personagem pode equipar no máximo <strong>1 Runa de cada Categoria</strong> (1 de Corpo, 1 de Mente e 1 de Alma), somando até 3 runas ativas simultaneamente.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {sistemaData.fragmentos_de_runa.runas.map(runa => (
                  <div key={runa.id} className="bg-[#171424] border border-purple-900/40 rounded-xl p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <strong className="font-cinzel text-sm text-purple-200">{runa.nome}</strong>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-700/30">
                          {runa.categoria}
                        </span>
                      </div>
                      <div className="text-[10px] text-cyan-400 mb-2">
                        Elemento: {runa.elemento}
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed">
                        {runa.efeito}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: AÇÕES DE COMBATE */}
          {activeTab === 'combate' && (
            <div className="space-y-4">
              <h4 className="font-cinzel text-sm font-bold text-purple-300">
                Ações em Combate e Cenas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-[#171424] border border-purple-900/30 rounded-xl p-3.5">
                  <strong className="text-white text-xs block mb-1">Ataque</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Testado via <strong>Esforço</strong> (corpo a corpo) ou <strong>Destreza</strong> (ágil / distância) somado ao atributo correspondente (Força ou Agilidade). Armas equipadas adicionam +1 passo na perícia e +1 de dano.
                  </p>
                </div>
                <div className="bg-[#171424] border border-purple-900/30 rounded-xl p-3.5">
                  <strong className="text-white text-xs block mb-1">Esquiva e Bloqueio</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Testado via <strong>Destreza</strong> + Agilidade (desvio veloz) ou <strong>Resistência</strong> + Vitalidade (tolerância física). Runa Isa adiciona +1D4 na Esquiva.
                  </p>
                </div>
                <div className="bg-[#171424] border border-purple-900/30 rounded-xl p-3.5">
                  <strong className="text-white text-xs block mb-1">Limite de Dados</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    No máximo <strong>5 dados</strong> podem ser somados em qualquer rolagem simultânea (Perícia + Atributo + até 3 dados de bônus).
                  </p>
                </div>
                <div className="bg-[#171424] border border-purple-900/30 rounded-xl p-3.5">
                  <strong className="text-white text-xs block mb-1">Gasto de Akasha</strong>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Gasta 1 ponto de Akasha para utilizar o Grau de Desenvolvimento (atributo) ou Conhecimento (perícia) de um aliado presente durante a cena.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
