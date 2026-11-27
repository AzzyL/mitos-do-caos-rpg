import React, { useState, useEffect } from 'react';
import { 
  X, 
  Dices, 
  Sparkles, 
  AlertTriangle, 
  Trash2, 
  Sliders, 
  CheckCircle2, 
  XCircle,
  Swords,
  Target
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeRoll } from '../utils/diceRoller';
import sistemaData from '../data/sistema.json';
import { supabase } from '../lib/supabase';

export default function DiceRollerDrawer({
  isOpen,
  onClose,
  character,
  rollHistory,
  onAddRoll,
  onClearHistory,
  activeCampaign = null,
  user = null
}) {
  // Mode State: 'action' | 'attack'
  const [rollMode, setRollMode] = useState('action');

  // Shared Roll Builder State
  const [testTitle, setTestTitle] = useState('Teste de Ação');
  const [selectedPericia, setSelectedPericia] = useState('destreza');
  const [selectedAtributo, setSelectedAtributo] = useState('agilidade');
  const [bonusDice, setBonusDice] = useState([]);
  const [bonusMod, setBonusMod] = useState(0);
  const [dtValue, setDtValue] = useState(8);
  const [useDT, setUseDT] = useState(false);
  const [isRolling, setIsRolling] = useState(false);

  // Exclusive Attack Mode State
  const [selectedTargetId, setSelectedTargetId] = useState('none');
  const [damageType, setDamageType] = useState('alto'); // 'alto' | 'baixo'

  // Monstros na Cena (visivel_jogadores === true)
  const [sceneMonsters, setSceneMonsters] = useState([]);

  // Carrega a lista do Supabase ao abrir o drawer ou quando activeCampaign mudar
  useEffect(() => {
    if (!isOpen || !supabase || !activeCampaign) {
      if (!activeCampaign) setSceneMonsters([]);
      return;
    }

    const fetchMonsters = async () => {
      try {
        const { data, error } = await supabase
          .from('campaign_monsters')
          .select('*')
          .eq('campaign_id', activeCampaign.id);

        if (error) {
          console.error("Erro ao carregar monstros da cena:", error);
          return;
        }

        if (data) {
          // Filtra monstros que estão na cena (visivel_jogadores === true)
          const visible = data.filter(m => m.visivel_jogadores === true || m.ficha_data?.visivel_jogadores === true);
          setSceneMonsters(visible);
        }
      } catch (err) {
        console.error("Erro inesperado ao buscar monstros:", err);
      }
    };

    fetchMonsters();

    const channel = supabase
      .channel(`drawer-scene-monsters-${activeCampaign.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaign_monsters',
        filter: `campaign_id=eq.${activeCampaign.id}`
      }, fetchMonsters)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, activeCampaign?.id]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleRollAction = () => {
    setIsRolling(true);

    const periciaDie = character?.pericias?.[selectedPericia] || 'D6';
    const atributoDie = character?.atributos?.[selectedAtributo] || 'D6';

    const pName = sistemaData.pericias.find(p => p.id === selectedPericia)?.nome || selectedPericia;
    const aName = sistemaData.atributos.find(a => a.id === selectedAtributo)?.nome || selectedAtributo;

    const result = executeRoll({
      title: testTitle || `${pName} + ${aName}`,
      periciaName: pName,
      atributoName: aName,
      periciaDie,
      atributoDie,
      bonusDice,
      bonusModifier: bonusMod,
      dt: useDT ? dtValue : null,
      karmaAtual: character?.karmaAtual || 'Neutro'
    });

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      triggerConfetti();
    }

    setTimeout(() => {
      onAddRoll(result);
      setIsRolling(false);
    }, 200);
  };

  const handleRollAttack = async () => {
    setIsRolling(true);

    const periciaDie = character?.pericias?.[selectedPericia] || 'D6';
    const atributoDie = character?.atributos?.[selectedAtributo] || 'D6';

    const pName = sistemaData.pericias.find(p => p.id === selectedPericia)?.nome || selectedPericia;
    const aName = sistemaData.atributos.find(a => a.id === selectedAtributo)?.nome || selectedAtributo;

    const targetMonster = sceneMonsters.find(m => m.id === selectedTargetId);

    const result = executeRoll({
      title: testTitle || (targetMonster ? `Ataque contra ${targetMonster.nome}` : `Ataque: ${pName} + ${aName}`),
      periciaName: pName,
      atributoName: aName,
      periciaDie,
      atributoDie,
      bonusDice,
      bonusModifier: bonusMod,
      dt: useDT ? dtValue : null,
      karmaAtual: character?.karmaAtual || 'Neutro'
    });

    // 2. Extrair todos os valores numéricos individuais dos dados rolados
    const rolledValues = (result.diceRolled || []).map(d => Number(d.value) || 0);
    const danoCausado = rolledValues.length > 0
      ? (damageType === 'alto' ? Math.max(...rolledValues) : Math.min(...rolledValues))
      : 0;

    // 3. Redução automática da vida da criatura (para Jogador e Mestre, sem bloquear por Defesa)
    let novaVidaCriatura = null;
    let monsterAlvoNome = null;

    if (selectedTargetId && selectedTargetId !== 'none' && danoCausado > 0) {
      try {
        const { data: currentMonster, error: fetchErr } = await supabase
          .from('campaign_monsters')
          .select('id, nome, vida_atual, vida_max')
          .eq('id', selectedTargetId)
          .single();

        if (fetchErr) {
          console.error("Erro ao buscar vida do monstro alvo:", fetchErr);
        } else if (currentMonster) {
          monsterAlvoNome = currentMonster.nome;
          const vidaAtual = Number(currentMonster.vida_atual) ?? Number(currentMonster.vida_max) ?? 0;
          novaVidaCriatura = Math.max(0, vidaAtual - danoCausado);

          const { error: updateErr } = await supabase
            .from('campaign_monsters')
            .update({ vida_atual: novaVidaCriatura })
            .eq('id', selectedTargetId);

          if (updateErr) {
            console.error("Erro ao atualizar vida da criatura no Supabase:", updateErr);
            alert(`Erro ao descontar vida da criatura: ${updateErr.message}`);
          }
        }
      } catch (err) {
        console.error("Erro inesperado ao aplicar dano ao monstro:", err);
      }
    }

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      triggerConfetti();
    }

    const attackRollResult = {
      ...result,
      isAttack: true,
      damageType, // 'alto' | 'baixo'
      danoCausado,
      targetMonsterId: selectedTargetId !== 'none' ? selectedTargetId : null,
      targetMonsterName: monsterAlvoNome || targetMonster?.nome || null,
      novaVidaCriatura
    };

    setTimeout(() => {
      onAddRoll(attackRollResult);
      setIsRolling(false);
    }, 200);
  };

  const addBonusDie = (die) => {
    if (2 + bonusDice.length < 5) {
      setBonusDice([...bonusDice, die]);
    }
  };

  const removeBonusDie = (index) => {
    setBonusDice(bonusDice.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          onClick={onClose} 
          className="no-print fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        />
      )}

      {/* Slide-over Drawer */}
      <aside 
        className={`no-print fixed top-0 right-0 h-full w-full sm:w-[460px] bg-[#110f18] border-l border-purple-900/40 z-50 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-900/30 bg-[#161421]">
          <div className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-purple-400" />
            <h2 className="font-cinzel text-lg font-bold text-purple-100">
              Rolador de Dados do Caos
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-purple-950/60 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Seletor de Modo: Normal vs Ataque */}
          <div className="flex items-center bg-black/60 p-1 rounded-xl border border-purple-900/40">
            <button
              type="button"
              onClick={() => setRollMode('action')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 ${
                rollMode === 'action'
                  ? 'bg-purple-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" /> Normal
            </button>
            <button
              type="button"
              onClick={() => setRollMode('attack')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-cinzel font-bold transition-all flex items-center justify-center gap-1.5 ${
                rollMode === 'attack'
                  ? 'bg-red-700 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Swords className="w-3.5 h-3.5" /> Ataque
            </button>
          </div>

          {/* PAINEL DE MONTAGEM DA ROLAGEM (ESTRUTURA IDÊNTICA) */}
          <div className={`border rounded-xl p-4 shadow-lg space-y-4 ${
            rollMode === 'attack'
              ? 'bg-[#19111b] border-red-900/50'
              : 'bg-[#171523] border-purple-900/30'
          }`}>
            <div className="flex items-center justify-between text-xs font-semibold tracking-wider uppercase border-b pb-2 border-neutral-800">
              <span className={`flex items-center gap-1.5 ${rollMode === 'attack' ? 'text-red-300' : 'text-purple-300'}`}>
                {rollMode === 'attack' ? <Swords className="w-3.5 h-3.5 text-red-400" /> : <Sliders className="w-3.5 h-3.5 text-purple-400" />}
                {rollMode === 'attack' ? 'Montar Ataque' : 'Montar Rolagem'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {2 + bonusDice.length}/5 Dados
              </span>
            </div>

            {/* Motivo / Descrição */}
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Motivo / Descrição</label>
              <input
                type="text"
                value={testTitle}
                onChange={(e) => setTestTitle(e.target.value)}
                placeholder={rollMode === 'attack' ? "Ex: Golpe de Espada, Tiro de Arco..." : "Ex: Esquivar de golpe, Investigar cômodo..."}
                className="w-full bg-[#0d0c13] border border-neutral-700/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Perícia & Atributo Selectors (IGUAL À ABA NORMAL) */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Perícia</label>
                <select
                  value={selectedPericia}
                  onChange={(e) => setSelectedPericia(e.target.value)}
                  className="w-full bg-[#0d0c13] border border-neutral-700/60 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {sistemaData.pericias.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.nome} ({character?.pericias?.[p.id] || 'D4'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Atributo</label>
                <select
                  value={selectedAtributo}
                  onChange={(e) => setSelectedAtributo(e.target.value)}
                  className="w-full bg-[#0d0c13] border border-neutral-700/60 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {sistemaData.atributos.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.nome} ({character?.atributos?.[a.id] || 'D4'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bonus Dice (IGUAL À ABA NORMAL) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] text-slate-400">Dados Extras / Bônus (Habilidade/Item)</span>
                <div className="flex gap-1">
                  {['D4', 'D6', 'D8', 'D10', 'D12'].map(die => (
                    <button
                      key={die}
                      type="button"
                      onClick={() => addBonusDie(die)}
                      disabled={2 + bonusDice.length >= 5}
                      className="text-[10px] bg-purple-950/60 hover:bg-purple-900 border border-purple-600/30 text-purple-200 px-1.5 py-0.5 rounded font-mono disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +{die}
                    </button>
                  ))}
                </div>
              </div>

              {bonusDice.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {bonusDice.map((b, idx) => (
                    <span 
                      key={idx} 
                      className="inline-flex items-center gap-1 bg-purple-900/50 border border-purple-500/40 text-purple-200 text-xs px-2 py-0.5 rounded-full"
                    >
                      +{b}
                      <button 
                        type="button"
                        onClick={() => removeBonusDie(idx)} 
                        className="hover:text-red-400 text-purple-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3 pt-1">
                {/* Modificador numérico */}
                <div className="flex-1">
                  <label className="text-[11px] text-slate-400 block mb-1">Bônus Fixo (+/-)</label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setBonusMod(Math.max(-10, bonusMod - 1))}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-slate-300 text-xs rounded-l"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={bonusMod}
                      onChange={(e) => setBonusMod(parseInt(e.target.value, 10) || 0)}
                      className="w-14 text-center bg-[#0d0c13] border-y border-neutral-700 text-xs text-white py-1 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setBonusMod(bonusMod + 1)}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-slate-300 text-xs rounded-r"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Dificuldade (DT) */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] text-slate-400">Dificuldade (DT)</label>
                    <input
                      type="checkbox"
                      checked={useDT}
                      onChange={(e) => setUseDT(e.target.checked)}
                      className="rounded accent-purple-600 w-3 h-3 cursor-pointer"
                    />
                  </div>
                  <input
                    type="number"
                    disabled={!useDT}
                    value={dtValue}
                    onChange={(e) => setDtValue(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-[#0d0c13] border border-neutral-700 rounded-lg px-2.5 py-1 text-xs text-white disabled:opacity-40 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

            {/* APENAS OS 2 CAMPOS EXCLUSIVOS DA ABA ATAQUE */}
            {rollMode === 'attack' && (
              <div className="pt-2 border-t border-neutral-800 space-y-3">
                {/* 1. Criatura Alvo */}
                <div className="bg-black/60 p-2.5 rounded-xl border border-red-900/40 space-y-1">
                  <label className="text-[10px] font-cinzel text-red-300 uppercase flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-red-400" /> CRIATURA ALVO (CENA)
                  </label>
                  <select
                    value={selectedTargetId}
                    onChange={(e) => setSelectedTargetId(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-700 text-xs font-semibold text-slate-200 py-1.5 px-2 rounded focus:outline-none cursor-pointer"
                  >
                    <option value="none">Nenhum alvo / Geral</option>
                    {sceneMonsters.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.nome} (ND {m.nd})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Tipo de Dano: Dado Alto vs Dado Baixo */}
                <div className="bg-black/60 p-2.5 rounded-xl border border-amber-900/40 space-y-1.5">
                  <label className="text-[10px] font-cinzel text-amber-300 uppercase block">
                    TIPO DE DANO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDamageType('alto')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-cinzel font-bold border transition-all ${
                        damageType === 'alto'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-950/40'
                          : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Dado Alto (Maior)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDamageType('baixo')}
                      className={`py-1.5 px-2 rounded-lg text-xs font-cinzel font-bold border transition-all ${
                        damageType === 'baixo'
                          ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-950/40'
                          : 'bg-neutral-900 border-neutral-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      Dado Baixo (Menor)
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono pt-0.5">
                    O dano será o {damageType === 'alto' ? 'MAIOR' : 'MENOR'} número rolado nos dados.
                  </p>
                </div>
              </div>
            )}

            {/* Botão de Rolagem */}
            {rollMode === 'action' ? (
              <button
                type="button"
                onClick={handleRollAction}
                disabled={isRolling}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-bold text-sm shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Rolando os Dados...' : 'Rolar Dados do Caos'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRollAttack}
                disabled={isRolling}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 via-rose-600 to-red-800 hover:from-red-600 hover:to-rose-500 text-white font-cinzel font-bold text-sm shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Swords className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Executando Ataque...' : 'Rolar Ataque'}</span>
              </button>
            )}
          </div>

          {/* Roll History Section */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between text-xs text-purple-300 font-semibold tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <Dices className="w-3.5 h-3.5 text-purple-400" /> Histórico de Rolagens ({rollHistory.length})
              </span>
              {rollHistory.length > 0 && (
                <button
                  type="button"
                  onClick={onClearHistory}
                  className="text-red-400/80 hover:text-red-300 text-[11px] flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Limpar
                </button>
              )}
            </div>

            {rollHistory.length === 0 ? (
              <div className="text-center py-10 px-4 bg-[#14121d] rounded-xl border border-purple-900/20 text-slate-500 text-xs">
                <p>Nenhuma rolagem realizada ainda.</p>
                <p className="mt-1 text-[11px] text-purple-400/60">
                  Clique em qualquer Atributo, Perícia ou use a aba Ataque para rolar!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className={`bg-[#171524] rounded-xl border p-3.5 shadow-md transition-all ${
                      roll.isAttack
                        ? 'border-red-600/60 shadow-red-950/30 bg-gradient-to-br from-[#1b1016] to-[#120f18]'
                        : roll.chaosRoll?.type === 'mantra'
                        ? 'border-emerald-500/50 shadow-emerald-950/20 bg-gradient-to-br from-[#171524] to-[#12221b]'
                        : roll.chaosRoll?.type === 'karma'
                        ? 'border-red-500/50 shadow-red-950/20 bg-gradient-to-br from-[#171524] to-[#251318]'
                        : 'border-purple-900/30'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h4 className="font-semibold text-xs text-purple-100 flex items-center gap-1.5">
                          {roll.isAttack && <Swords className="w-3.5 h-3.5 text-red-400" />}
                          {roll.title}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {roll.timestamp}
                        </span>
                      </div>

                      {/* Result Badge */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <span className="text-lg font-cinzel font-bold text-white">
                            {roll.total}
                          </span>
                          {roll.dt !== null && (
                            <span className="text-xs text-slate-400 font-mono">
                              / DT {roll.dt}
                            </span>
                          )}
                        </div>
                        {roll.passedDT !== null && (
                          <div className={`text-[10px] font-bold flex items-center gap-1 justify-end ${
                            roll.passedDT ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {roll.passedDT ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> Sucesso
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> Falha
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dice Breakdown */}
                    <div className="flex flex-wrap items-center gap-1.5 py-1.5 border-y border-purple-900/20 my-2">
                      {roll.diceRolled?.map((d, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/40 border border-purple-800/40 text-[11px]"
                          title={d.label}
                        >
                          <span className="text-[9px] text-purple-300 font-mono">{d.die}:</span>
                          <strong className="text-white font-bold">{d.value}</strong>
                        </div>
                      ))}
                      {roll.bonusModifier !== 0 && (
                        <div className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[11px] text-slate-300 font-mono">
                          {roll.bonusModifier > 0 ? `+${roll.bonusModifier}` : roll.bonusModifier}
                        </div>
                      )}
                    </div>

                    {/* DESTAQUE DO DANO CAUSADO (QUANDO FOR ATAQUE) */}
                    {roll.isAttack && (
                      <div className="mt-2 bg-gradient-to-r from-amber-950/60 to-red-950/60 border border-amber-500/50 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-amber-300 font-cinzel font-bold flex items-center gap-1.5">
                            <Swords className="w-3.5 h-3.5 text-amber-400" />
                            DANO CAUSADO ({roll.damageType === 'alto' ? 'Dado Alto / Maior' : 'Dado Baixo / Menor'}):
                          </span>
                          <span className="font-mono font-bold text-base text-yellow-300 bg-amber-950 px-2.5 py-0.5 rounded border border-amber-500/50 shadow">
                            {roll.danoCausado} Dano
                          </span>
                        </div>

                        {roll.targetMonsterName && (
                          <div className="text-[11px] font-mono text-slate-300 flex items-center justify-between pt-1 border-t border-amber-900/40">
                            <span>
                              Alvo: <strong className="text-red-300">{roll.targetMonsterName}</strong>
                            </span>
                            {roll.novaVidaCriatura !== null ? (
                              <span className="text-emerald-400 font-bold">
                                Vida atualizada: {roll.novaVidaCriatura} HP (-{roll.danoCausado})
                              </span>
                            ) : (
                              <span className="text-amber-400">
                                -{roll.danoCausado} HP
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chaos Announcement Banner */}
                    {roll.chaosRoll && (
                      <div className={`mt-2 rounded-xl p-3 text-xs border ${
                        roll.chaosRoll.type === 'mantra'
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                          : 'bg-red-950/50 border-red-500/50 text-red-200'
                      }`}>
                        <div className="flex items-center gap-1.5 font-cinzel font-bold text-xs uppercase mb-1">
                          {roll.chaosRoll.type === 'mantra' ? (
                            <>
                              <Sparkles className="w-4 h-4 text-emerald-400" />
                              <span className="tracking-wider">MANTRA ATIVADO!</span>
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-4 h-4 text-red-400" />
                              <span className="tracking-wider">KARMA ATIVADO!</span>
                            </>
                          )}
                        </div>
                        <p className="text-[11px] leading-relaxed text-slate-200">
                          {roll.chaosRoll.message}
                        </p>
                        <div className="text-[10px] mt-1 text-slate-400 italic">
                          Gatilho: {roll.chaosRoll.reason}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
