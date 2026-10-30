import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Radio, Wifi, Zap, RefreshCw } from 'lucide-react';
import { setAudioMuted, getAudioMuted, playTacticalClick } from '../utils/audioEffects';

interface Props {
  onSimulateThreat: () => void;
  activeSpecimenCount: number;
}

export const BottomTelemetryTicker: React.FC<Props> = ({ onSimulateThreat, activeSpecimenCount }) => {
  const [muted, setMutedState] = useState(false);
  const [vuLevels, setVuLevels] = useState([40, 65, 25, 80, 50, 70, 30, 90]);

  useEffect(() => {
    setMutedState(getAudioMuted());
    const interval = setInterval(() => {
      setVuLevels([
        Math.floor(20 + Math.random() * 60),
        Math.floor(30 + Math.random() * 65),
        Math.floor(15 + Math.random() * 70),
        Math.floor(40 + Math.random() * 55),
        Math.floor(25 + Math.random() * 60),
        Math.floor(35 + Math.random() * 60),
        Math.floor(10 + Math.random() * 85),
        Math.floor(45 + Math.random() * 50),
      ]);
    }, 450);
    return () => clearInterval(interval);
  }, []);

  const toggleMute = () => {
    const next = !muted;
    setMutedState(next);
    setAudioMuted(next);
    if (!next) playTacticalClick();
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 h-8 md:h-9 bg-[#0b0e14] border-t border-[#213247] px-3 md:px-6 flex items-center justify-between text-xs font-mono text-[#b9cacb] select-none">
      {/* Left side: System status & Comms metrics */}
      <div className="flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-1.5 text-[#00f3ff]">
          <Wifi className="w-3.5 h-3.5 animate-pulse" />
          <span className="text-[11px] tracking-wider font-bold">LEO UPLINK: 99.8%</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-[#506882]">
          <span className="text-[10px]">PING:</span>
          <span className="text-[#e0e2ea] text-[11px]">14ms</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-[#506882]">
          <Radio className="w-3.5 h-3.5 text-[#00ff88]" />
          <span className="text-[10px]">TRANSPONDERS:</span>
          <span className="text-[#00ff88] text-[11px] font-bold">{activeSpecimenCount} LOCKED</span>
        </div>
      </div>

      {/* Center: Live Scrolling Telemetry Ticker Wire */}
      <div className="hidden lg:flex items-center overflow-hidden mx-6 flex-1 max-w-2xl text-[11px] text-[#849495] tracking-wider whitespace-nowrap">
        <span className="text-[#00f3ff] mr-2 shrink-0">// TELEMETRY WIRE:</span>
        <div className="truncate animate-pulse">
          AC-01 NOMINAL · GEOFENCE SECTOR 07 VOLTAGE 9.8 kV · SKYGUARDIAN-01 ON AZIMUTH 210° · TITAN-1 HR 42 BPM · BAROMETRIC GRADIENT -0.2 hPa/hr
        </div>
      </div>

      {/* Right side: Audio VU Channel Meter + Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* VU Peak Meter */}
        <div className="hidden sm:flex items-center gap-0.5 px-2 py-1 bg-[#101419] border border-[#213247]">
          <span className="text-[9px] text-[#506882] mr-1">VU CH-1</span>
          {vuLevels.map((lvl, idx) => (
            <div
              key={idx}
              className="w-1 bg-[#1c2025] h-3.5 flex flex-col justify-end overflow-hidden"
            >
              <div
                className={`w-full transition-all duration-300 ${
                  lvl > 75 ? 'bg-[#ff1e44]' : lvl > 50 ? 'bg-[#ffaa00]' : 'bg-[#00f3ff]'
                }`}
                style={{ height: `${lvl}%` }}
              />
            </div>
          ))}
        </div>

        {/* Audio SFX Toggle */}
        <button
          onClick={toggleMute}
          className={`flex items-center gap-1 px-2 py-0.5 border text-[11px] transition-colors cursor-pointer ${
            muted
              ? 'border-[#ff1e44]/40 text-[#ff1e44] bg-[#ff1e44]/10'
              : 'border-[#00f3ff]/40 text-[#00f3ff] bg-[#00f3ff]/10 hover:bg-[#00f3ff]/20'
          }`}
          title={muted ? 'Unmute Tactical HUD Audio' : 'Mute Tactical HUD Audio'}
        >
          {muted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{muted ? 'MUTED' : 'AUDIO ON'}</span>
        </button>

        {/* Threat Test Simulation trigger */}
        <button
          onClick={() => {
            playTacticalClick();
            onSimulateThreat();
          }}
          className="flex items-center gap-1 px-2.5 py-0.5 bg-[#181c21] hover:bg-[#272a30] border border-[#ffaa00]/40 text-[#ffaa00] text-[11px] font-bold tracking-wider transition-colors cursor-pointer"
          title="Simulate Random Incursion / Distress Telemetry Event"
        >
          <Zap className="w-3 h-3 text-[#ffaa00]" />
          <span className="hidden md:inline">TEST TELEMETRY SIM</span>
        </button>
      </div>
    </footer>
  );
};
