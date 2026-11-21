import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  Flame, 
  Dices, 
  Trophy,
  Skull,
  CheckCircle2,
  XCircle,
  HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { rollDie, playDiceSound } from '../utils/diceRoller';

export default function ApostaCaosModal({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  onAddLog
}) {
  const [desejoText, setDesejoText] = useState('');
  const [isRolling, setIsRolling] = useState(false);
  
  // Mode: digital roll vs physical dice
  const [usePhysicalDice, setUsePhysicalDice] = useState(false);
  const [physicalPlayerScore, setPhysicalPlayerScore] = useState('');
  const [physicalOutcome, setPhysicalOutcome] = useState('vitoria'); // 'vitoria' | 'derrota'

  // Digital roll state
  const [digitalPlayerDice, setDigitalPlayerDice] = useState(null);
  const [digitalPlayerSum, setDigitalPlayerSum] = useState(null);
  const [apostaConcluded, setApostaConcluded] = useState(false);
  const [wonAposta, setWonAposta] = useState(null);

  if (!isOpen) return null;

  const currentPC = character.pontosCaos || 1;

  // Handle rolling ONLY the player's 8D8
  const handleRollPlayerDice = () => {
    if (currentPC < 1) {
      alert('Você não possui Pontos de Caos para apostar!');
      return;
    }

    setIsRolling(true);
    setApostaConcluded(false);
    playDiceSound('roll');

    setTimeout(() => {
      // ONLY roll the person's dice (8D8)
      const dice = Array.from({ length: 8 }, () => rollDie(8));
      const sum = dice.reduce((a, b) => a + b, 0);

      setDigitalPlayerDice(dice);
      setDigitalPlayerSum(sum);
      setIsRolling(false);
    }, 700);
  };

  // Conclude the aposta (Won or Lost)
  const handleConcludeAposta = (didWin, finalScore) => {
    if (currentPC < 1) {
      alert('Você não possui Pontos de Caos suficientes!');
      return;
    }

    const newPC = Math.max(0, currentPC - 1);
    const score = finalScore ?? (usePhysicalDice ? parseInt(physicalPlayerScore, 10) || 0 : digitalPlayerSum);

    // If lost: lose 8 Equilíbrio
    let newEquilibrio = character.equilibrioAtual ?? character.sanidadeAtual ?? 0;
    if (!didWin) {
      newEquilibrio = Math.max(0, newEquilibrio - 8);
      playDiceSound('karma');
    } else {
      playDiceSound('mantra');
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      } catch (e) {}
    }

    onUpdateCharacter({
      ...character,
      pontosCaos: newPC,
      equilibrioAtual: newEquilibrio,
      sanidadeAtual: newEquilibrio
    });

    setWonAposta(didWin);
    setApostaConcluded(true);

    if (onAddLog) {
      onAddLog({
        id: `aposta-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
        title: `Aposta com o Caos: "${desejoText || 'Desejo Primordial'}"`,
        diceRolled: digitalPlayerDice
          ? digitalPlayerDice.map((val, i) => ({ type: 'player', label: `D8 #${i+1}`, die: 'D8', value: val }))
          : [{ type: 'player', label: '8D8 Físicos', die: '8D8', value: score }],
        bonusModifier: 0,
        diceSum: score,
        total: score,
        dt: null,
        passedDT: didWin,
        hasSucessoCritico: didWin,
        hasFalhaCritica: !didWin,
        chaosRoll: !didWin ? {
          type: 'karma',
          title: 'KARMA ATIVADO NA APOSTA!',
          reason: 'Derrota na aposta contra O Apostador',
          message: 'Perdeu 8 pontos de Equilíbrio e um Karma deve ser despertado pelo Mestre.'
        } : {
          type: 'mantra',
          title: 'DESEJO REALIZADO!',
          reason: 'Vitória na aposta contra O Apostador',
          message: `Desejo alcançado: "${desejoText || 'Desejo Primordial'}"`
        }
      });
    }
  };

  return (
    <div className="no-print fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-5">
      <div className="bg-[#12101a] border border-red-500/40 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-purple-950/60 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-950 via-purple-950 to-black border border-red-500/50 flex items-center justify-center shadow-lg shadow-red-950/50">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
          <div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-red-100 tracking-wider">
              Apostar com o Caos
            </h3>
            <p className="text-xs text-red-300/70">
              Desafie <em>O Apostador / Entidade Primordial</em>
            </p>
          </div>
        </div>

        {/* Rules summary banner */}
        <div className="bg-red-950/30 border border-red-900/40 rounded-xl p-3 text-xs text-red-200/90 leading-relaxed mb-4">
          <p>
            Gaste <strong>1 Ponto de Caos</strong> para rolar <strong>8D8</strong> contra o Mestre.
          </p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-slate-300">
            <li><strong>Vitória:</strong> Seu desejo pretendido se realiza no universo.</li>
            <li><strong>Derrota:</strong> Perde <strong>8 pontos de Equilíbrio</strong> e o Mestre ativa um <strong>Karma</strong>.</li>
          </ul>
        </div>

        {/* Desejo Input */}
        <div className="mb-4">
          <label className="text-xs text-slate-400 block mb-1">Qual o seu Desejo nesta aposta?</label>
          <input
            type="text"
            value={desejoText}
            onChange={(e) => setDesejoText(e.target.value)}
            placeholder="Ex: Curar o ferimento fatal, abrir o portal..."
            className="w-full bg-[#0b0a11] border border-red-900/40 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
          />
        </div>

        {/* Mode Toggle: Dados Digitais vs Dados Físicos */}
        <div className="flex items-center justify-between text-xs bg-[#191522] px-3.5 py-2.5 rounded-xl border border-purple-900/30 mb-4">
          <span className="text-slate-300">Método de Rolagem:</span>
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-purple-200">
            <input
              type="checkbox"
              checked={usePhysicalDice}
              onChange={(e) => {
                setUsePhysicalDice(e.target.checked);
                setDigitalPlayerDice(null);
                setApostaConcluded(false);
              }}
              className="rounded accent-red-600 w-4 h-4 cursor-pointer"
            />
            <span>Rodei em dados físicos</span>
          </label>
        </div>

        {/* MODE A: Physical Dice */}
        {usePhysicalDice ? (
          <div className="bg-[#171424] border border-purple-900/40 rounded-xl p-4 mb-4 space-y-3">
            <label className="text-xs text-purple-200 font-bold block">
              Insira a soma que você tirou nos seus 8D8 físicos:
            </label>
            <input
              type="number"
              min="8"
              max="64"
              value={physicalPlayerScore}
              onChange={(e) => setPhysicalPlayerScore(e.target.value)}
              placeholder="Ex: 42"
              className="w-full bg-[#0b0a11] border border-purple-800/60 rounded-xl px-3 py-2 text-base font-mono font-bold text-yellow-300 focus:outline-none focus:border-purple-500"
            />

            <div className="pt-2">
              <label className="text-[11px] text-slate-400 block mb-1.5">Qual foi o resultado contra o Mestre na mesa?</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!physicalPlayerScore || apostaConcluded}
                  onClick={() => handleConcludeAposta(true)}
                  className="py-2.5 px-3 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Venci a Aposta</span>
                </button>
                <button
                  type="button"
                  disabled={!physicalPlayerScore || apostaConcluded}
                  onClick={() => handleConcludeAposta(false)}
                  className="py-2.5 px-3 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-40"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Perdi a Aposta</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MODE B: Digital Roll (Only Person's Dice) */
          <div className="space-y-4 mb-4">
            {!digitalPlayerDice ? (
              <button
                type="button"
                disabled={isRolling || currentPC < 1}
                onClick={handleRollPlayerDice}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-700 via-purple-700 to-red-800 hover:from-red-600 hover:to-purple-600 text-white font-cinzel font-bold text-sm shadow-xl shadow-red-950/60 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                <Dices className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
                <span>{isRolling ? 'Rolando seus 8D8...' : 'Rolar Meus 8D8'}</span>
              </button>
            ) : (
              <div className="bg-[#171424] border border-purple-900/40 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-purple-900/30 pb-2">
                  <span className="text-xs text-purple-200 font-bold font-cinzel">Seus 8D8 Digitais:</span>
                  <span className="text-xl font-bold font-mono text-yellow-300">{digitalPlayerSum}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 py-1">
                  {digitalPlayerDice.map((val, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-black/60 border border-purple-800/40 text-xs font-mono font-bold text-white">
                      {val}
                    </span>
                  ))}
                </div>

                {!apostaConcluded && (
                  <div className="pt-2 border-t border-purple-900/30">
                    <label className="text-[11px] text-slate-400 block mb-2">
                      Compare o seu total ({digitalPlayerSum}) com a rolagem do Mestre na mesa:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleConcludeAposta(true)}
                        className="py-2.5 px-3 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Venci o Mestre</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleConcludeAposta(false)}
                        className="py-2.5 px-3 rounded-lg bg-red-950/70 hover:bg-red-900 border border-red-500/50 text-red-200 text-xs font-bold flex items-center justify-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4 text-red-400" />
                        <span>Mestre Tirou Mais</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Conclusion Outcome Banner */}
        {apostaConcluded && (
          <div className={`p-4 rounded-xl border mb-4 animate-fade-in ${
            wonAposta
              ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200'
              : 'bg-red-950/50 border-red-500/60 text-red-200'
          }`}>
            <div className="flex items-center gap-2 font-cinzel font-bold text-sm mb-1">
              {wonAposta ? (
                <>
                  <Trophy className="w-5 h-5 text-emerald-400" />
                  <span>VITÓRIA! O DESEJO SE REALIZA!</span>
                </>
              ) : (
                <>
                  <Skull className="w-5 h-5 text-red-400" />
                  <span>DERROTA NA APOSTA!</span>
                </>
              )}
            </div>
            <p className="text-[11px] mt-1 leading-relaxed">
              {wonAposta
                ? `O Caos concedeu o seu desejo: "${desejoText || 'Desejo Primordial'}". O Ponto de Caos foi consumido.`
                : 'Você perdeu 8 pontos de Equilíbrio e um Karma foi despertado pelo Mestre! O Ponto de Caos foi consumido.'}
            </p>
          </div>
        )}

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-purple-900/30">
          <span>Pontos de Caos restantes: <strong className="text-red-400 font-mono">{character.pontosCaos} PC</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-slate-200 text-xs font-semibold"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
