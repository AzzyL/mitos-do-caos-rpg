import React, { useState, useEffect } from 'react';
import {
  Heart,
  Brain,
  Sparkles,
  Dices,
  Flame,
  X,
  ArrowLeft,
  ShieldAlert,
  Trophy,
  Skull,
  UserCheck
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import sistemaData from '../data/sistema.json';
import {
  calculateMaxVida,
  calculateMaxEquilibrio,
  calculateMaxAkasha
} from '../utils/characterCalculations';
import GMScreen from './GMScreen';

export default function CampaignRoom({
  campaign,
  user,
  character,
  onOpenMySheet,
  onLeaveCampaign
}) {
  const [members, setMembers] = useState([]);
  const [rolls, setRolls] = useState([]);
  const [chaosBets, setChaosBets] = useState([]);
  const [inspectedMember, setInspectedMember] = useState(null);

  const isGM = campaign.mestre_id === user?.id;

  // 1. Sincroniza automaticamente a ficha do jogador atual para a mesa
  useEffect(() => {
    if (!supabase || !campaign || !user || isGM) return;

    const timer = setTimeout(() => {
      supabase.from('campaign_members').upsert({
        campaign_id: campaign.id,
        user_id: user.id,
        role: 'jogador',
        character_data: character,
        updated_at: new Date().toISOString()
      }, { onConflict: 'campaign_id,user_id' });
    }, 600);

    return () => clearTimeout(timer);
  }, [character, campaign.id, user?.id, isGM]);

  // 2. Carrega e escuta em Tempo Real: Membros, Rolagens e Apostas com o Caos
  useEffect(() => {
    if (!supabase || !campaign) return;

    const loadAll = async () => {
      const [{ data: mData }, { data: rData }, { data: bData }] = await Promise.all([
        supabase.from('campaign_members').select('*').eq('campaign_id', campaign.id),
        supabase.from('campaign_rolls').select('*').eq('campaign_id', campaign.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('chaos_bets').select('*').eq('campaign_id', campaign.id).order('created_at', { ascending: false }).limit(5)
      ]);
      if (mData) setMembers(mData);
      if (rData) setRolls(rData);
      if (bData) setChaosBets(bData);
    };

    loadAll();

    const channel = supabase
      .channel(`room-${campaign.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_members', filter: `campaign_id=eq.${campaign.id}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campaign_rolls', filter: `campaign_id=eq.${campaign.id}` }, loadAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chaos_bets', filter: `campaign_id=eq.${campaign.id}` }, loadAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [campaign.id]);

  // Filtra apenas os jogadores (exclui o Mestre dos cards de personagem)
  const playerMembers = members.filter(m => m.role !== 'mestre');

  // Requisito 3: Jogadores veem todas as rolagens EXCETO as rolagens ocultas do Mestre
  const visibleRollsForPlayers = rolls.filter(r => !r.is_gm_roll || r.is_public);

  // Apostas pendentes e última aposta concluída
  const pendingBets = chaosBets.filter(b => b.status === 'pending');
  const latestBet = chaosBets[0] || null;

  // Requisito 2: Clicar em si mesmo abre a própria ficha completa; clicar em outro abre o modal de Perícias
  const handleCardClick = (member) => {
    if (member.user_id === user?.id) {
      onOpenMySheet();
    } else {
      setInspectedMember(member);
    }
  };

  return (
    <div className="max-w-6xl mx-auto my-4 space-y-6">
      {/* Cabeçalho da Campanha */}
      <div className="bg-[#12101b] border border-purple-800/40 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onLeaveCampaign}
            className="p-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-slate-300"
            title="Voltar para lista de campanhas"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="font-cinzel text-lg font-bold text-white">{campaign.nome}</h2>
            <p className="text-xs text-slate-400 font-mono">
              Código de Convite: <strong className="text-purple-300 select-all">{campaign.codigo_convite}</strong>
            </p>
          </div>
        </div>

        {!isGM && (
          <button
            onClick={onOpenMySheet}
            className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-cinzel font-bold flex items-center gap-1.5 shadow-lg"
          >
            <UserCheck className="w-4 h-4" /> Abrir Minha Ficha Completa
          </button>
        )}
      </div>

      {/* =====================================================================
          REQUISITO 4 (PARTE A): BANNER AO VIVO DE APOSTA COM O CAOS PARA TODOS
          ===================================================================== */}
      {latestBet && (latestBet.status === 'pending' || (Date.now() - new Date(latestBet.created_at).getTime() < 120000)) && (
        <div className={`rounded-2xl p-4 border-2 shadow-2xl ${
          latestBet.status === 'pending'
            ? 'bg-red-950/50 border-red-500'
            : latestBet.status === 'player_won'
            ? 'bg-emerald-950/50 border-emerald-500'
            : 'bg-red-950/70 border-red-600'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-cinzel font-bold text-sm text-white">
                <ShieldAlert className="w-5 h-5 text-red-400" />
                <span>APOSTA COM O CAOS AO VIVO — {latestBet.player_name}</span>
              </div>
              {latestBet.desejo && (
                <p className="text-xs text-slate-200">Desejo: <em>"{latestBet.desejo}"</em></p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono pt-1">
                <span>
                  Jogador ({latestBet.player_name}): <strong className="text-yellow-300 text-base">{latestBet.player_total}</strong>
                  <span className="text-[10px] text-slate-400 ml-1">[{Array.isArray(latestBet.player_dice) ? latestBet.player_dice.join(', ') : ''}]</span>
                </span>
                {latestBet.status !== 'pending' ? (
                  <span>
                    Mestre: <strong className="text-red-300 text-base">{latestBet.gm_total}</strong>
                    <span className="text-[10px] text-slate-400 ml-1">[{Array.isArray(latestBet.gm_dice) ? latestBet.gm_dice.join(', ') : ''}]</span>
                  </span>
                ) : (
                  <span className="text-amber-300 animate-pulse">Aguardando o Mestre rolar seus 8D8...</span>
                )}
              </div>
            </div>

            {latestBet.status !== 'pending' && (
              <div className="flex items-center gap-2 font-cinzel font-bold text-sm px-4 py-2 rounded-xl bg-black/60">
                {latestBet.status === 'player_won' ? (
                  <><Trophy className="w-5 h-5 text-emerald-400" /><span className="text-emerald-300">DESEJO REALIZADO!</span></>
                ) : (
                  <><Skull className="w-5 h-5 text-red-400" /><span className="text-red-300">MESTRE VENCEU (-8 EQUILÍBRIO)</span></>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          REQUISITO 4 (PARTE B): ESCUDO DO MESTRE (APENAS PARA O MESTRE)
          ===================================================================== */}
      {isGM && (
        <GMScreen
          campaign={campaign}
          user={user}
          allRolls={rolls}
          pendingBets={pendingBets}
        />
      )}

      {/* =====================================================================
          REQUISITO 1 & 2: JOGADORES DA MESA (NOME, FOTO, VIDA, EQUILÍBRIO, AKASHA)
          ===================================================================== */}
      <div className="bg-[#12101b] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h3 className="font-cinzel text-sm font-bold text-purple-200 uppercase">
            PERSONAGENS NA CAMPANHA ({playerMembers.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Clique em outro jogador para ver perícias • Clique em si mesmo para abrir sua ficha
          </span>
        </div>

        {playerMembers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">
            Nenhum jogador entrou com ficha nesta campanha ainda. Compartilhe o código <strong>{campaign.codigo_convite}</strong>!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerMembers.map((member) => {
              const char = member.character_data || {};
              const isMe = member.user_id === user?.id;
              const maxVida = calculateMaxVida(char);
              const maxEq = calculateMaxEquilibrio(char);
              const maxAk = calculateMaxAkasha(char);
              const vidaAtual = char.vidaAtual ?? maxVida;
              const eqAtual = char.equilibrioAtual ?? char.sanidadeAtual ?? maxEq;
              const akAtual = char.akashaAtual ?? maxAk;

              return (
                <div
                  key={member.id}
                  onClick={() => handleCardClick(member)}
                  className={`bg-black/80 rounded-2xl p-4 border transition-all cursor-pointer hover:scale-[1.01] ${
                    isMe
                      ? 'border-purple-500/70 shadow-lg shadow-purple-950/30'
                      : 'border-neutral-800 hover:border-cyan-500/50'
                  }`}
                >
                  {/* Topo do Card: Foto + Nome */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-neutral-900 border border-purple-500/50 overflow-hidden flex items-center justify-center flex-shrink-0">
                      {char.foto ? (
                        <img src={char.foto} alt={char.nome} className="w-full h-full object-cover" />
                      ) : (
                        <Flame className="w-5 h-5 text-purple-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-cinzel font-bold text-sm text-white truncate">
                          {char.nome || 'Sem Nome'}
                        </h4>
                        {isMe && (
                          <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-600/40 px-1.5 py-0.2 rounded font-mono">
                            Você
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Nível {char.nivelPessoal || 1} • {isMe ? 'Abrir ficha completa' : 'Ver perícias'}
                      </p>
                    </div>
                  </div>

                  {/* Status Vitais: Vida, Equilíbrio e Akasha */}
                  <div className="space-y-2 text-xs font-mono">
                    {/* Vida */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-red-400 flex items-center gap-1"><Heart className="w-3 h-3" /> Vida</span>
                        <span className="text-white">{vidaAtual} / {maxVida}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-red-600" style={{ width: `${maxVida > 0 ? Math.min(100, (vidaAtual / maxVida) * 100) : 0}%` }} />
                      </div>
                    </div>

                    {/* Equilíbrio */}
                    <div>
                      <div className="flex justify-between text-[11px] mb-0.5">
                        <span className="text-indigo-400 flex items-center gap-1"><Brain className="w-3 h-3" /> Equilíbrio</span>
                        <span className="text-white">{eqAtual} / {maxEq}</span>
                      </div>
                      <div className="w-full h-1.5 bg-neutral-900 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500" style={{ width: `${maxEq > 0 ? Math.min(100, (eqAtual / maxEq) * 100) : 0}%` }} />
                      </div>
                    </div>

                    {/* Akasha */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-900 text-[11px]">
                      <span className="text-cyan-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Akasha</span>
                      <span className="text-cyan-300 font-bold">{akAtual} / {maxAk}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =====================================================================
          REQUISITO 3: ABA DE ROLAGENS DOS JOGADORES (OCULTA AS PRIVADAS DO MESTRE)
          ===================================================================== */}
      <div className="bg-[#12101b] border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
          <h3 className="font-cinzel text-sm font-bold text-cyan-200 uppercase flex items-center gap-2">
            <Dices className="w-4 h-4 text-cyan-400" /> ROLAGENS DA CAMPANHA (AO VIVO)
          </h3>
          <span className="text-[10px] text-slate-500 font-mono">
            Rolagens secretas do Mestre ficam ocultas aqui
          </span>
        </div>

        {visibleRollsForPlayers.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-6">Nenhuma rolagem pública registrada nesta campanha ainda.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {visibleRollsForPlayers.map((r) => (
              <div key={r.id} className="bg-black/70 border border-neutral-800 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${r.is_gm_roll ? 'text-yellow-400' : 'text-cyan-300'}`}>
                      {r.sender_name}:
                    </span>
                    <span className="text-white">{r.roll_data?.title}</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    {r.roll_data?.diceRolled?.map(d => `${d.die} (${d.value})`).join(' + ')}
                    {r.roll_data?.chaosRoll && (
                      <span className={`ml-2 font-bold ${r.roll_data.chaosRoll.type === 'mantra' ? 'text-emerald-400' : 'text-red-400'}`}>
                        [{r.roll_data.chaosRoll.type.toUpperCase()}!]
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-cinzel font-bold text-lg text-white">{r.roll_data?.total}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* =====================================================================
          MODAL DE INSPEÇÃO DE PERÍCIAS (AO CLICAR EM OUTRO JOGADOR)
          ===================================================================== */}
      {inspectedMember && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14121f] border border-cyan-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-neutral-900 border border-cyan-500/50 overflow-hidden flex items-center justify-center">
                  {inspectedMember.character_data?.foto ? (
                    <img src={inspectedMember.character_data.foto} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Flame className="w-5 h-5 text-cyan-400" />
                  )}
                </div>
                <div>
                  <h4 className="font-cinzel font-bold text-base text-white">
                    {inspectedMember.character_data?.nome || 'Personagem'}
                  </h4>
                  <p className="text-[11px] text-cyan-300">Perícias Gerais</p>
                </div>
              </div>
              <button onClick={() => setInspectedMember(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {sistemaData.pericias.map((per) => {
                const die = inspectedMember.character_data?.pericias?.[per.id] || '—';
                const grau = sistemaData.dados_escala[die]?.grau || 'Não definido';
                return (
                  <div key={per.id} className="bg-black/80 border border-neutral-800 rounded-xl p-3 flex items-center justify-between">
                    <div>
                      <span className="font-cinzel font-bold text-xs text-slate-200 block">{per.nome}</span>
                      <span className="text-[10px] text-slate-500">{grau}</span>
                    </div>
                    <span className="font-cinzel font-bold text-sm text-cyan-400 font-mono">{die}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}