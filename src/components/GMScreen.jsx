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
  AlertTriangle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { executeRoll, rollDie, DIE_STEPS } from '../utils/diceRoller';
import sistemaData from '../data/sistema.json';

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
  const [mNome, setMNome] = useState('');
  const [mND, setMND] = useState(10);
  const [mDefesa, setMDefesa] = useState(7);
  const [mVida, setMVida] = useState(25);
  const [mAtaque, setMAtaque] = useState('D6');
  const [mDano, setMDano] = useState('1D6');
  const [mLimiar, setMLimiar] = useState('');
  const [mNotas, setMNotas] = useState('');

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

  // Criar Monstro
  const handleCreateMonster = async (e) => {
    e.preventDefault();
    if (!mNome.trim()) return;
    await supabase.from('campaign_monsters').insert({
      campaign_id: campaign.id,
      nome: mNome.trim(),
      nd: Number(mND) || 10,
      defesa: Number(mDefesa) || 7,
      vida_atual: Number(mVida) || 20,
      vida_max: Number(mVida) || 20,
      dado_ataque: mAtaque,
      dano: mDano,
      limiar_efeito: mLimiar,
      notas: mNotas
    });
    setMNome('');
    setMLimiar('');
    setMNotas('');
  };

  const handleUpdateMonsterHp = async (monster, delta) => {
    const nextHp = Math.max(0, Math.min(monster.vida_max, monster.vida_atual + delta));
    await supabase
      .from('campaign_monsters')
      .update({ vida_atual: nextHp })
      .eq('id', monster.id);
  };

  const handleDeleteMonster = async (id) => {
    await supabase.from('campaign_monsters').delete().eq('id', id);
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
            <Skull className="w-3.5 h-3.5" /> Monstros ({monsters.length})
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

      {/* SUB-ABA 1: FICHAS DE MONSTROS */}
      {gmSubTab === 'monstros' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateMonster} className="bg-black/60 border border-neutral-800 rounded-xl p-3.5 grid grid-cols-2 sm:grid-cols-6 gap-2.5">
            <input
              type="text"
              required
              value={mNome}
              onChange={(e) => setMNome(e.target.value)}
              placeholder="Nome do Monstro..."
              className="col-span-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            />
            <div>
              <label className="text-[9px] text-slate-400 block">Vida Máx</label>
              <input type="number" value={mVida} onChange={(e) => setMVida(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-red-300 font-mono" />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block">Defesa (DT)</label>
              <input type="number" value={mDefesa} onChange={(e) => setMDefesa(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-cyan-300 font-mono" />
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block">Dado / Dano</label>
              <div className="flex gap-1">
                <select value={mAtaque} onChange={(e) => setMAtaque(e.target.value)} className="bg-neutral-900 border border-neutral-700 rounded-lg px-1.5 py-1 text-xs text-yellow-300">
                  {DIE_STEPS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <input type="text" value={mDano} onChange={(e) => setMDano(e.target.value)} placeholder="1D6" className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-1.5 py-1 text-xs text-white font-mono" />
              </div>
            </div>
            <div>
              <label className="text-[9px] text-slate-400 block">ND</label>
              <input type="number" value={mND} onChange={(e) => setMND(e.target.value)} className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-purple-300 font-mono" />
            </div>
            <input
              type="text"
              value={mLimiar}
              onChange={(e) => setMLimiar(e.target.value)}
              placeholder="Efeito de Limiar (ex: Medo, Melancolia)..."
              className="col-span-2 sm:col-span-3 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
            <input
              type="text"
              value={mNotas}
              onChange={(e) => setMNotas(e.target.value)}
              placeholder="Habilidades / Fraquezas..."
              className="col-span-2 bg-neutral-900 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200"
            />
            <button type="submit" className="col-span-2 sm:col-span-1 bg-yellow-700 hover:bg-yellow-600 text-white font-bold text-xs rounded-lg py-1.5 flex items-center justify-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Criar
            </button>
          </form>

          {/* Lista de Monstros Ativos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monsters.map(m => (
              <div key={m.id} className="bg-black/80 border border-neutral-800 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="font-cinzel text-sm text-red-300">{m.nome}</strong>
                    <span className="ml-2 text-[10px] font-mono bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded">ND {m.nd}</span>
                  </div>
                  <button onClick={() => handleDeleteMonster(m.id)} className="text-neutral-600 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs font-mono bg-neutral-900/80 p-2 rounded-lg">
                  <span className="flex items-center gap-1 text-red-400">
                    <Heart className="w-3.5 h-3.5" /> {m.vida_atual}/{m.vida_max}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleUpdateMonsterHp(m, -5)} className="px-1.5 py-0.5 bg-red-950 text-red-200 rounded text-[10px]">-5</button>
                    <button onClick={() => handleUpdateMonsterHp(m, -1)} className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-[10px]">-1</button>
                    <button onClick={() => handleUpdateMonsterHp(m, 1)} className="px-1.5 py-0.5 bg-neutral-800 text-white rounded text-[10px]">+1</button>
                  </div>
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Shield className="w-3.5 h-3.5" /> Def {m.defesa}
                  </span>
                  <span className="text-yellow-300">{m.dado_ataque} ({m.dano})</span>
                </div>

                {m.limiar_efeito && (
                  <p className="text-[11px] text-purple-300"><strong>Limiar:</strong> {m.limiar_efeito}</p>
                )}
                {m.notas && (
                  <p className="text-[11px] text-slate-400">{m.notas}</p>
                )}
              </div>
            ))}
          </div>
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