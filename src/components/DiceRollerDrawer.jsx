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
  Target,
  Heart,
  Skull
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { executeRoll, rollDie, parseDieFaces } from '../utils/diceRoller';
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

  // Roll Builder State (Action Mode)
  const [testTitle, setTestTitle] = useState('Teste de Ação');
  const [selectedPericia, setSelectedPericia] = useState('destreza');
  const [selectedAtributo, setSelectedAtributo] = useState('agilidade');
  const [bonusDice, setBonusDice] = useState([]);
  const [bonusMod, setBonusMod] = useState(0);
  const [dtValue, setDtValue] = useState(8);
  const [useDT, setUseDT] = useState(true);
  const [isRolling, setIsRolling] = useState(false);

  // Attack Mode State
  const [attackTitle, setAttackTitle] = useState('Ataque com Arma');
  const [dadoAlto, setDadoAlto] = useState('D8');
  const [dadoBaixo, setDadoBaixo] = useState('D6');
  const [dadoDano, setDadoDano] = useState('1D6');
  const [selectedTargetId, setSelectedTargetId] = useState('none');
  const [attackMod, setAttackMod] = useState(0);

  // Monstros na Cena
  const [sceneMonsters, setSceneMonsters] = useState([]);

  useEffect(() => {
    if (!supabase || !activeCampaign) {
      setSceneMonsters([]);
      return;
    }

    const fetchMonsters = async () => {
      const { data } = await supabase
        .from('campaign_monsters')
        .select('*')
        .eq('campaign_id', activeCampaign.id);
      if (data) {
        const isGM = activeCampaign.mestre_id === user?.id;
        const visible = isGM ? data : data.filter(m => m.visivel_jogadores === true || m.ficha_data?.visivel_jogadores === true);
        setSceneMonsters(visible);
      }
    };

    fetchMonsters();

    const channel = supabase
      .channel(`drawer-monsters-${activeCampaign.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'campaign_monsters',
        filter: `campaign_id=eq.${activeCampaign.id}`
      }, fetchMonsters)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeCampaign?.id, user?.id]);

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleRollCustom = () => {
    setIsRolling(true);

    const periciaDie = character.pericias?.[selectedPericia] || 'D6';
    const atributoDie = character.atributos?.[selectedAtributo] || 'D6';

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
      karmaAtual: character.karmaAtual || 'Neutro'
    });

    if (result.hasSucessoCritico || result.chaosRoll?.type === 'mantra') {
      triggerConfetti();
    }

    setTimeout(() => {
      onAddRoll(result);
      setIsRolling(false);
    }, 200);
  };

  // Rolar Ataque no Modo Ataque
  const handleRollAttack = async () => {
    setIsRolling(true);

    // 1. Rolar Dado Alto e Dado Baixo
    const facesAlto = parseDieFaces(dadoAlto);
    const facesBaixo = parseDieFaces(dadoBaixo);
    const valAlto = rollDie(facesAlto);
    const valBaixo = rollDie(facesBaixo);

    const bonus = parseInt(attackMod, 10) || 0;
    const attackTotal = valAlto + valBaixo + bonus;

    // 2. Rolar Dado de Dano
    let damageTotal = 0;
    const damageRolls = [];
    const dmgClean = (dadoDano || '1D6').toUpperCase().replace(/\s+/g, '');
    const dmgMatch = dmgClean.match(/^(\d*)D(\d+)([+-]\d+)?$/);

    if (dmgMatch) {
      const count = parseInt(dmgMatch[1], 10) || 1;
      const dFaces = parseInt(dmgMatch[2], 10) || 6;
      const mod = parseInt(dmgMatch[3], 10) || 0;

      for (let i = 0; i < count; i++) {
        const dVal = rollDie(dFaces);
        damageRolls.push(dVal);
        damageTotal += dVal;
      }
      damageTotal += mod;
    } else {
      damageTotal = rollDie(6);
      damageRolls.push(damageTotal);
    }

    damageTotal = Math.max(0, damageTotal);

    // 3. Verificar Alvo e Defesa
    const targetMonster = sceneMonsters.find(m => m.id === selectedTargetId);
    let targetHit = null;
    let newMonsterHp = null;

    if (targetMonster) {
      const monsterDefesa = Number(targetMonster.defesa) || 7;
      targetHit = attackTotal >= monsterDefesa;

      if (targetHit) {
        newMonsterHp = Math.max(0, targetMonster.vida_atual - damageTotal);
        // Subtrai automaticamente o dano de vida_atual na tabela campaign_monsters do Supabase
        await supabase
          .from('campaign_monsters')
          .update({ vida_atual: newMonsterHp })
          .eq('id', targetMonster.id);
      }
    }

    const isCrit = (valAlto === facesAlto && valBaixo === facesBaixo) || (valAlto === 8 && valBaixo === 8);
    if (isCrit || targetHit) {
      triggerConfetti();
    }

    const attackRollResult = {
      id: `roll-${Date.now()}`,
      title: targetMonster
        ? `${attackTitle || 'Ataque'} contra ${targetMonster.nome}`
        : (attackTitle || 'Ataque com Arma'),
      isAttackMode: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      total: attackTotal,
      dt: targetMonster ? targetMonster.defesa : null,
      passedDT: targetHit,
      targetMonsterName: targetMonster?.nome || null,
      targetMonsterId: targetMonster?.id || null,
      targetHit,
      newMonsterHp,
      dadoAlto: { die: dadoAlto, value: valAlto, label: 'Dado Alto' },
      dadoBaixo: { die: dadoBaixo, value: valBaixo, label: 'Dado Baixo' },
      dadoDanoNome: dadoDano || '1D6',
      danoTotal: damageTotal,
      damageRolls,
      diceRolled: [
        { die: `${dadoAlto} (Alto)`, value: valAlto, label: 'Dado Alto' },
        { die: `${dadoBaixo} (Baixo)`, value: valBaixo, label: 'Dado Baixo' }
      ],
      bonusModifier: bonus,
      hasSucessoCritico: isCrit
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
          {/* Seletor de Modo: Ação vs Ataque */}
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
              <Sliders className="w-3.5 h-3.5" /> Teste de Ação
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
              <Swords className="w-3.5 h-3.5" /> Modo Ataque
            </button>
          </div>

          {/* MODO 1: CONSTRUTOR DE ROLAGEM DE AÇÃO */}
          {rollMode === 'action' && (
            <div className="bg-[#171523] border border-purple-900/30 rounded-xl p-4 shadow-lg space-y-4">
              <div className="flex items-center justify-between text-xs text-purple-300 font-semibold tracking-wider uppercase border-b border-purple-900/30 pb-2">
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-purple-400" /> Montar Rolagem
                </span>
                <span className="text-[11px] text-purple-400/80 font-mono">
                  {2 + bonusDice.length}/5 Dados
                </span>
              </div>

              {/* Test Title Input */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Motivo / Descrição</label>
                <input
                  type="text"
                  value={testTitle}
                  onChange={(e) => setTestTitle(e.target.value)}
                  placeholder="Ex: Esquivar de golpe, Investigar cômodo..."
                  className="w-full bg-[#0d0c13] border border-purple-900/40 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Perícia & Atributo Selectors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Perícia</label>
                  <select
                    value={selectedPericia}
                    onChange={(e) => setSelectedPericia(e.target.value)}
                    className="w-full bg-[#0d0c13] border border-purple-900/40 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {sistemaData.pericias.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.nome} ({character.pericias?.[p.id] || 'D4'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Atributo</label>
                  <select
                    value={selectedAtributo}
                    onChange={(e) => setSelectedAtributo(e.target.value)}
                    className="w-full bg-[#0d0c13] border border-purple-900/40 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-purple-500 cursor-pointer"
                  >
                    {sistemaData.atributos.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.nome} ({character.atributos?.[a.id] || 'D4'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bonus Dice */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-slate-400">Dados de Bônus (Habilidade/Item)</span>
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
                        className="px-2 py-1 bg-purple-950 border border-purple-800 text-slate-300 text-xs rounded-l"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={bonusMod}
                        onChange={(e) => setBonusMod(parseInt(e.target.value, 10) || 0)}
                        className="w-14 text-center bg-[#0d0c13] border-y border-purple-900 text-xs text-white py-1 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setBonusMod(bonusMod + 1)}
                        className="px-2 py-1 bg-purple-950 border border-purple-800 text-slate-300 text-xs rounded-r"
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
                      className="w-full bg-[#0d0c13] border border-purple-900/40 rounded-lg px-2.5 py-1 text-xs text-white disabled:opacity-40 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Roll Button */}
              <button
                type="button"
                onClick={handleRollCustom}
                disabled={isRolling}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-800 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-bold text-sm shadow-lg shadow-purple-950/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Rolando os Dados...' : 'Rolar Dados do Caos'}</span>
              </button>
            </div>
          )}

          {/* MODO 2: CONSTRUTOR DE ATAQUE COM DADO ALTO/BAIXO, DANO E ALVO */}
          {rollMode === 'attack' && (
            <div className="bg-[#19111b] border-2 border-red-900/50 rounded-xl p-4 shadow-lg space-y-4">
              <div className="flex items-center justify-between text-xs text-red-300 font-semibold tracking-wider uppercase border-b border-red-900/40 pb-2">
                <span className="flex items-center gap-1.5">
                  <Swords className="w-3.5 h-3.5 text-red-400" /> Montar Ataque
                </span>
                <span className="text-[11px] text-red-400/80 font-mono">
                  Dado Alto + Dado Baixo
                </span>
              </div>

              {/* Descrição do Ataque */}
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Arma / Golpe / Habilidade</label>
                <input
                  type="text"
                  value={attackTitle}
                  onChange={(e) => setAttackTitle(e.target.value)}
                  placeholder="Ex: Espada Longa, Rajada de Fogo..."
                  className="w-full bg-[#0d0c13] border border-red-900/50 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Seletores: Dado Alto e Dado Baixo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                  <label className="text-[10px] font-cinzel text-red-300 block mb-1">
                    DADO ALTO
                  </label>
                  <select
                    value={dadoAlto}
                    onChange={(e) => setDadoAlto(e.target.value)}
                    className="w-full bg-neutral-900 text-yellow-400 font-cinzel font-bold text-xs py-1.5 px-2 rounded border border-neutral-700 cursor-pointer"
                  >
                    {['D4', 'D6', 'D8', 'D10', 'D12'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                  <label className="text-[10px] font-cinzel text-cyan-300 block mb-1">
                    DADO BAIXO
                  </label>
                  <select
                    value={dadoBaixo}
                    onChange={(e) => setDadoBaixo(e.target.value)}
                    className="w-full bg-neutral-900 text-cyan-400 font-cinzel font-bold text-xs py-1.5 px-2 rounded border border-neutral-700 cursor-pointer"
                  >
                    {['D4', 'D6', 'D8', 'D10', 'D12'].map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dado de Dano & Modificador Fixo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                  <label className="text-[10px] font-cinzel text-yellow-300 block mb-1">
                    DADO DE DANO
                  </label>
                  <input
                    type="text"
                    value={dadoDano}
                    onChange={(e) => setDadoDano(e.target.value)}
                    placeholder="Ex: 1D6, 1D8, 2D6..."
                    className="w-full bg-neutral-900 text-yellow-300 font-mono font-bold text-xs py-1.5 px-2 rounded border border-neutral-700 focus:outline-none"
                  />
                </div>

                <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800">
                  <label className="text-[10px] font-cinzel text-slate-400 block mb-1">
                    BÔNUS DE ACERTO (+/-)
                  </label>
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={() => setAttackMod(attackMod - 1)}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-slate-300 text-xs rounded-l"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={attackMod}
                      onChange={(e) => setAttackMod(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-center bg-[#0d0c13] border-y border-neutral-700 text-xs text-white py-1 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setAttackMod(attackMod + 1)}
                      className="px-2 py-1 bg-neutral-900 border border-neutral-700 text-slate-300 text-xs rounded-r"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Seletor de Alvo (Inimigo na Cena) */}
              <div className="bg-black/60 p-2.5 rounded-xl border border-neutral-800 space-y-1">
                <label className="text-[10px] font-cinzel text-red-300 uppercase flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-red-400" /> ALVO (CRIATURA NA CENA)
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 text-xs font-semibold text-slate-200 py-1.5 px-2 rounded focus:outline-none cursor-pointer"
                >
                  <option value="none">Sem alvo específico</option>
                  {sceneMonsters.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.nome} (ND {m.nd} • Defesa {m.defesa})
                    </option>
                  ))}
                </select>
                {selectedTargetId !== 'none' && (
                  <p className="text-[10px] text-emerald-400 font-mono mt-1">
                    ✓ Se o acerto atingir a Defesa, o dano será subtraído automaticamente da vida da criatura.
                  </p>
                )}
              </div>

              {/* Botão de Ataque */}
              <button
                type="button"
                onClick={handleRollAttack}
                disabled={isRolling}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-700 via-rose-600 to-red-800 hover:from-red-600 hover:to-rose-500 text-white font-cinzel font-bold text-sm shadow-lg shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <Swords className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Executando Ataque...' : 'Rolar Ataque e Dano'}</span>
              </button>
            </div>
          )}

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
                  Clique em qualquer Atributo, Perícia ou use o Modo Ataque para rolar!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {rollHistory.map((roll) => (
                  <div
                    key={roll.id}
                    className={`bg-[#171524] rounded-xl border p-3.5 shadow-md transition-all ${
                      roll.isAttackMode
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
                          {roll.isAttackMode && <Swords className="w-3.5 h-3.5 text-red-400" />}
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
                              / {roll.isAttackMode ? 'Def' : 'DT'} {roll.dt}
                            </span>
                          )}
                        </div>
                        {roll.passedDT !== null && (
                          <div className={`text-[10px] font-bold flex items-center gap-1 justify-end ${
                            roll.passedDT ? 'text-emerald-400' : 'text-red-400'
                          }`}>
                            {roll.passedDT ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" /> {roll.isAttackMode ? 'Acertou o Alvo!' : 'Sucesso'}
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" /> {roll.isAttackMode ? 'Errou o Alvo' : 'Falha'}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dice Breakdown (Attack or Action) */}
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

                    {/* DESTAQUE CLARO DO DADO DE DANO (QUANDO MODO ATAQUE) */}
                    {roll.isAttackMode && (
                      <div className="bg-neutral-950/90 border border-red-900/60 rounded-xl p-2.5 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-yellow-300 font-cinzel font-bold flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> DADO DE DANO: {roll.dadoDanoNome}
                          </span>
                          <span className="font-mono font-bold text-sm text-yellow-400 bg-yellow-950/70 border border-yellow-700/50 px-2 py-0.5 rounded">
                            {roll.danoTotal} Dano
                          </span>
                        </div>

                        {roll.targetMonsterName && (
                          <div className="text-[11px] font-mono pt-1 border-t border-neutral-900 flex items-center justify-between">
                            <span className="text-slate-400">
                              Alvo: <strong className="text-red-300">{roll.targetMonsterName}</strong>
                            </span>
                            {roll.targetHit ? (
                              <span className="text-emerald-400 font-bold">
                                -{roll.danoTotal} HP aplicado automaticamente!
                              </span>
                            ) : (
                              <span className="text-red-400">
                                Dano não aplicado (Defesa não superada)
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
