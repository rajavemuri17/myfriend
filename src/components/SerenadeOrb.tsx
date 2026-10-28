import { useEffect, useRef } from 'react';
import { CompanionState, ConnectionStatus } from '../types';

interface SerenadeOrbProps {
  companionState: CompanionState;
  connectionStatus: ConnectionStatus;
  userAudioLevel: number; // 0 to 1
  modelAudioLevel: number; // 0 to 1
  isMuted: boolean;
  onOrbClick: () => void;
}

export function SerenadeOrb({
  companionState,
  connectionStatus,
  userAudioLevel,
  modelAudioLevel,
  isMuted,
  onOrbClick,
}: SerenadeOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      phase += 0.035;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Determine active dynamic power
      let activeLevel = 0;
      if (companionState === 'speaking') {
        activeLevel = Math.max(0.15, modelAudioLevel);
      } else if (companionState === 'listening' && !isMuted) {
        activeLevel = Math.max(0.08, userAudioLevel);
      } else {
        // Idle gentle breathing
        activeLevel = 0.05 + Math.sin(phase * 0.7) * 0.03;
      }

      const baseRadius = 88;
      const dynamicRadius = baseRadius + activeLevel * 48;

      // Outer gentle atmospheric glow
      const outerGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        baseRadius * 0.4,
        centerX,
        centerY,
        dynamicRadius * 1.8
      );

      if (connectionStatus === 'connected') {
        if (companionState === 'speaking') {
          // Warm rose, amethyst, and peach
          outerGrad.addColorStop(0, 'rgba(244, 114, 182, 0.55)');
          outerGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.3)');
          outerGrad.addColorStop(1, 'rgba(236, 72, 153, 0)');
        } else if (companionState === 'listening') {
          // Warm amber, honey, and soft teal
          outerGrad.addColorStop(0, 'rgba(251, 191, 36, 0.55)');
          outerGrad.addColorStop(0.5, 'rgba(45, 212, 191, 0.28)');
          outerGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        } else {
          // Resting soft warm twilight
          outerGrad.addColorStop(0, 'rgba(251, 146, 60, 0.4)');
          outerGrad.addColorStop(0.6, 'rgba(129, 140, 248, 0.2)');
          outerGrad.addColorStop(1, 'rgba(147, 51, 234, 0)');
        }
      } else if (connectionStatus === 'connecting') {
        // Shimmering cyan-lavender
        outerGrad.addColorStop(0, 'rgba(96, 165, 250, 0.5)');
        outerGrad.addColorStop(0.6, 'rgba(192, 132, 252, 0.3)');
        outerGrad.addColorStop(1, 'rgba(99, 102, 241, 0)');
      } else {
        // Soft sleep state
        outerGrad.addColorStop(0, 'rgba(148, 163, 184, 0.25)');
        outerGrad.addColorStop(0.7, 'rgba(71, 85, 105, 0.1)');
        outerGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      }

      ctx.fillStyle = outerGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Multi-layer resonant ripple rings
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        const ringPhase = phase + (r * Math.PI) / 1.5;
        const ringSpread = (Math.sin(ringPhase) * 0.5 + 0.5) * (20 + activeLevel * 35);
        const radius = dynamicRadius + ringSpread + r * 10;

        ctx.strokeStyle =
          companionState === 'speaking'
            ? `rgba(244, 114, 182, ${0.35 - r * 0.1})`
            : companionState === 'listening'
            ? `rgba(251, 191, 36, ${0.35 - r * 0.1})`
            : `rgba(167, 139, 250, ${0.2 - r * 0.05})`;

        ctx.lineWidth = 1.8;
        ctx.beginPath();
        // Wobbly organic circumference
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          const wobble = Math.sin(a * 4 + phase * 2 + r) * (activeLevel * 9);
          const x = centerX + Math.cos(a) * (radius + wobble);
          const y = centerY + Math.sin(a) * (radius + wobble);
          if (a === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();
        ctx.stroke();
      }

      // Inner Luminous Core
      const coreGrad = ctx.createRadialGradient(
        centerX - 15,
        centerY - 20,
        5,
        centerX,
        centerY,
        dynamicRadius * 0.95
      );

      if (connectionStatus === 'connected') {
        if (companionState === 'speaking') {
          coreGrad.addColorStop(0, '#FFF1F2'); // bright warm rose highlight
          coreGrad.addColorStop(0.3, '#F472B6');
          coreGrad.addColorStop(0.7, '#C084FC');
          coreGrad.addColorStop(1, '#7C3AED');
        } else if (companionState === 'listening') {
          coreGrad.addColorStop(0, '#FFFBEB'); // bright warm amber highlight
          coreGrad.addColorStop(0.3, '#FBBF24');
          coreGrad.addColorStop(0.7, '#F97316');
          coreGrad.addColorStop(1, '#0D9488');
        } else {
          coreGrad.addColorStop(0, '#FAF5FF');
          coreGrad.addColorStop(0.4, '#C084FC');
          coreGrad.addColorStop(0.8, '#818CF8');
          coreGrad.addColorStop(1, '#3B82F6');
        }
      } else if (connectionStatus === 'connecting') {
        coreGrad.addColorStop(0, '#F0FDF4');
        coreGrad.addColorStop(0.4, '#38BDF8');
        coreGrad.addColorStop(1, '#6366F1');
      } else {
        coreGrad.addColorStop(0, '#F8FAFC');
        coreGrad.addColorStop(0.4, '#94A3B8');
        coreGrad.addColorStop(1, '#475569');
      }

      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, dynamicRadius * 0.92, 0, Math.PI * 2);
      ctx.fill();

      // Soft Specular Gleam
      const gleamGrad = ctx.createRadialGradient(
        centerX - 24,
        centerY - 32,
        2,
        centerX - 24,
        centerY - 32,
        36
      );
      gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      gleamGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gleamGrad;
      ctx.beginPath();
      ctx.arc(centerX - 24, centerY - 32, 36, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [companionState, connectionStatus, userAudioLevel, modelAudioLevel, isMuted]);

  return (
    <div className="relative flex flex-col items-center justify-center select-none py-4">
      {/* Interactive Orb Container */}
      <button
        onClick={onOrbClick}
        aria-label="Tap to toggle gentle voice conversation"
        className="group relative cursor-pointer outline-none focus-visible:ring-4 focus-visible:ring-amber-400/40 rounded-full transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
      >
        <canvas
          ref={canvasRef}
          width={360}
          height={360}
          className="w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] drop-shadow-[0_0_35px_rgba(244,114,182,0.25)] transition-all duration-300"
        />

        {/* Center overlay badge with state text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="px-3.5 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-md border border-white/15 text-xs font-medium text-white/90 shadow-lg flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected'
                  ? companionState === 'speaking'
                    ? 'bg-rose-400 animate-pulse'
                    : companionState === 'listening'
                    ? 'bg-amber-400 animate-ping'
                    : 'bg-emerald-400'
                  : connectionStatus === 'connecting'
                  ? 'bg-sky-400 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
            {connectionStatus === 'disconnected' && 'Tap to connect'}
            {connectionStatus === 'connecting' && 'Connecting gently...'}
            {connectionStatus === 'connected' && companionState === 'speaking' && 'Serenade is speaking'}
            {connectionStatus === 'connected' && companionState === 'listening' && (isMuted ? 'Mic is paused' : 'Listening with care')}
            {connectionStatus === 'connected' && companionState === 'thinking' && 'Reflecting gently...'}
            {connectionStatus === 'connected' && companionState === 'idle' && 'Here with you'}
          </div>
        </div>
      </button>
    </div>
  );
}
