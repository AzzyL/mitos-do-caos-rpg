import React, { useState, useEffect } from 'react';
import { Crown, Users, Plus, KeyRound, ArrowRight, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function CampaignHub({ user, character, onSelectCampaign, onOpenAuth }) {
  const [myCampaigns, setMyCampaigns] = useState([]);
  const [newCampaignName, setNewCampaignName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);

  const loadCampaigns = async () => {
    if (!supabase || !user) return;
    const { data: memberRows } = await supabase
      .from('campaign_members')
      .select('role, campaigns(*)')
      .eq('user_id', user.id);

    if (memberRows) {
      const list = memberRows
        .filter(r => r.campaigns)
        .map(r => ({ ...r.campaigns, myRole: r.role }));
      setMyCampaigns(list);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-xl mx-auto my-10 bg-[#12101b] border border-purple-800/40 rounded-2xl p-8 text-center space-y-4 shadow-2xl">
        <Users className="w-12 h-12 text-purple-400 mx-auto" />
        <h2 className="font-cinzel text-xl font-bold text-white">Área de Campanha ao Vivo</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Entre na sua conta para criar uma mesa como Mestre ou entrar na campanha do seu grupo usando um código de convite.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-700 to-indigo-600 hover:from-purple-600 hover:to-indigo-500 text-white font-cinzel font-bold text-xs shadow-lg"
        >
          Entrar ou Criar Conta
        </button>
      </div>
    );
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!newCampaignName.trim() || !supabase) return;
    setLoading(true);

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: camp, error } = await supabase
      .from('campaigns')
      .insert({ mestre_id: user.id, nome: newCampaignName.trim(), codigo_convite: code })
      .select()
      .single();

    if (!error && camp) {
      await supabase.from('campaign_members').insert({
        campaign_id: camp.id,
        user_id: user.id,
        role: 'mestre',
        character_data: { nome: 'Mestre' }
      });
      setNewCampaignName('');
      await loadCampaigns();
      onSelectCampaign(camp);
    } else {
      alert('Erro ao criar campanha: ' + (error?.message || ''));
    }
    setLoading(false);
  };

  const handleJoinCampaign = async (e) => {
    e.preventDefault();
    if (!inviteCode.trim() || !supabase) return;
    setLoading(true);

    const { data: camp, error } = await supabase
      .from('campaigns')
      .select('*')
      .eq('codigo_convite', inviteCode.trim().toUpperCase())
      .single();

    if (error || !camp) {
      alert('Código de convite inválido ou campanha não encontrada.');
      setLoading(false);
      return;
    }

    const role = camp.mestre_id === user.id ? 'mestre' : 'jogador';
    await supabase.from('campaign_members').upsert({
      campaign_id: camp.id,
      user_id: user.id,
      role,
      character_data: character
    }, { onConflict: 'campaign_id,user_id' });

    setInviteCode('');
    await loadCampaigns();
    onSelectCampaign(camp);
    setLoading(false);
  };

  const handleDeleteCampaign = async (campId) => {
    if (!window.confirm('Excluir esta campanha permanentemente?')) return;
    await supabase.from('campaigns').delete().eq('id', campId);
    loadCampaigns();
  };

  return (
    <div className="max-w-4xl mx-auto my-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Criar Campanha (Mestre) */}
        <form onSubmit={handleCreateCampaign} className="bg-[#12101b] border border-purple-800/40 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-yellow-400 font-cinzel font-bold text-sm">
            <Crown className="w-4 h-4" /> Criar Nova Campanha (Mestre)
          </div>
          <p className="text-[11px] text-slate-400">
            Você será o Mestre desta mesa e terá acesso exclusivo ao Escudo do Mestre, monstros e rolagens ocultas.
          </p>
          <input
            type="text"
            required
            value={newCampaignName}
            onChange={(e) => setNewCampaignName(e.target.value)}
            placeholder="Nome da Campanha (ex: Ecos do Abismo)"
            className="w-full bg-[#0b0a11] border border-neutral-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-purple-800 hover:bg-purple-700 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Criar Mesa e Gerar Código
          </button>
        </form>

        {/* Entrar com Código (Jogador) */}
        <form onSubmit={handleJoinCampaign} className="bg-[#12101b] border border-cyan-800/40 rounded-2xl p-5 space-y-3 shadow-xl">
          <div className="flex items-center gap-2 text-cyan-400 font-cinzel font-bold text-sm">
            <KeyRound className="w-4 h-4" /> Entrar em uma Campanha
          </div>
          <p className="text-[11px] text-slate-400">
            Digite o código de 6 letras fornecido pelo Mestre. Sua ficha atual será vinculada automaticamente à mesa.
          </p>
          <input
            type="text"
            required
            maxLength={8}
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
            placeholder="CÓDIGO (EX: A7K9P2)"
            className="w-full bg-[#0b0a11] border border-neutral-700 rounded-xl px-3 py-2 text-xs font-mono uppercase text-cyan-300 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-cyan-800 hover:bg-cyan-700 text-white font-cinzel font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <ArrowRight className="w-4 h-4" /> Entrar na Mesa
          </button>
        </form>
      </div>

      {/* Lista de Campanhas do Usuário */}
      <div className="bg-[#12101b] border border-neutral-800 rounded-2xl p-5 shadow-xl space-y-3">
        <h3 className="font-cinzel text-sm font-bold text-slate-200 uppercase">Minhas Campanhas</h3>
        {myCampaigns.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">Você ainda não participa de nenhuma campanha.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {myCampaigns.map(c => (
              <div key={c.id} className="bg-black/70 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-cinzel text-sm text-white">{c.nome}</strong>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                      c.mestre_id === user.id ? 'bg-yellow-950 text-yellow-300 border border-yellow-700/40' : 'bg-cyan-950 text-cyan-300'
                    }`}>
                      {c.mestre_id === user.id ? 'Mestre' : 'Jogador'}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Código: <strong className="text-purple-300">{c.codigo_convite}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  {c.mestre_id === user.id && (
                    <button
                      onClick={() => handleDeleteCampaign(c.id)}
                      className="p-2 text-neutral-500 hover:text-red-400"
                      title="Excluir campanha"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onSelectCampaign(c)}
                    className="px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold"
                  >
                    Abrir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}