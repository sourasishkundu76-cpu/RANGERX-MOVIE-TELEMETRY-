import React from 'react';
import { ShieldAlert, Radio, Activity, Eye, Compass, BellRing } from 'lucide-react';
import { playTacticalClick, playAlertWarble } from '../utils/audioEffects';

export type ScreenId = 'recon' | 'biosignals' | 'defense' | 'acoustics' | 'comms';

interface Props {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  criticalAlertCount: number;
  missionTime: string;
  onEmergencyTrigger: () => void;
}

export const TacticalTopNav: React.FC<Props> = ({
  activeScreen,
  onSelectScreen,
  criticalAlertCount,
  missionTime,
  onEmergencyTrigger,
}) => {
  const navItems: { id: ScreenId; label: string; icon: React.ReactNode; indexStr: string }[] = [
    { id: 'recon', label: 'RECON & DRONES', icon: <Compass className="w-4 h-4" />, indexStr: '01' },
    { id: 'biosignals', label: 'BIO-SIGNALS', icon: <Activity className="w-4 h-4" />, indexStr: '02' },
    { id: 'defense', label: 'SECTOR DEFENSE', icon: <ShieldAlert className="w-4 h-4" />, indexStr: '03' },
    { id: 'acoustics', label: 'ACOUSTICS & FLIR', icon: <Eye className="w-4 h-4" />, indexStr: '04' },
    { id: 'comms', label: 'COMMS MESH', icon: <Radio className="w-4 h-4" />, indexStr: '05' },
  ];

  return (
    <header className="relative z-30 flex items-center justify-between gap-6 px-4 md:px-6 py-3 bg-[#0a0f18]/90 backdrop-blur-md border-b border-[#213247]">
      {/* Top micro tick lines */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00f3ff]/40 to-transparent pointer-events-none" />

      {/* Zone 1: Single text element wordmark with fixed layout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-2.5 h-6 bg-[#00f3ff] chamfer-4 shadow-[0_0_8px_#00f3ff]" />
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-base md:text-lg tracking-wider text-white whitespace-nowrap">
              TACTICAL FIELD TELEMETRY
            </span>
            <span className="hidden lg:inline-block font-mono text-[10px] tracking-widest text-[#00f3ff] px-1.5 py-0.5 bg-[#00f3ff]/10 border border-[#00f3ff]/30">
              SYS//ONLINE
            </span>
          </div>
          <span className="font-mono text-[10px] tracking-wider text-[#506882] whitespace-nowrap">
            TRANS-FRONTIER RECON // MET {missionTime}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Tabs */}
      <nav className="flex items-center gap-1.5 md:gap-2 overflow-x-auto no-scrollbar py-0.5">
        {navItems.map((item) => {
          const isActive = activeScreen === item.id;
          const isDefenseWithAlert = item.id === 'defense' && criticalAlertCount > 0;

          return (
            <button
              key={item.id}
              onClick={() => {
                playTacticalClick();
                onSelectScreen(item.id);
              }}
              className={`group relative flex items-center gap-2 px-3 md:px-3.5 py-1.5 font-mono text-xs tracking-wider uppercase transition-all duration-150 whitespace-nowrap shrink-0 chamfer-4 cursor-pointer ${
                isActive
                  ? 'bg-[#00f3ff] text-[#06090e] font-bold shadow-[0_0_14px_rgba(0,243,255,0.45)]'
                  : 'bg-[#181c21]/90 text-[#b9cacb] hover:text-white hover:bg-[#213247]/80 border border-[#213247]'
              }`}
            >
              <span className={`transition-colors ${isActive ? 'text-[#06090e]' : 'text-[#00f3ff]'}`}>
                {item.icon}
              </span>
              <span className="hidden sm:inline font-mono text-[10px] opacity-75">
                {item.indexStr}
              </span>
              <span className="font-display text-xs font-semibold">
                {item.label}
              </span>
              {isDefenseWithAlert && (
                <span className="w-2 h-2 bg-[#ff1e44] animate-ping ml-1" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Zone 3: Primary Action (Tactical Alert Override / Emergency Dispatch) */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => {
            playAlertWarble();
            onEmergencyTrigger();
          }}
          className={`flex items-center gap-2 px-3.5 py-1.5 font-mono text-xs font-bold tracking-wider uppercase transition-all duration-200 chamfer-tr-bl cursor-pointer ${
            criticalAlertCount > 0
              ? 'bg-[#ff1e44] text-white hover:bg-[#ff3b5c] shadow-[0_0_18px_rgba(255,30,68,0.6)] animate-pulse'
              : 'bg-[#181c21] text-[#00f3ff] hover:bg-[#00f3ff]/20 border border-[#00f3ff]/40 shadow-[0_0_10px_rgba(0,243,255,0.15)]'
          }`}
          title="Emergency Tactical Action / Threat Broadcast"
        >
          <BellRing className={`w-3.5 h-3.5 ${criticalAlertCount > 0 ? 'animate-bounce' : ''}`} />
          <span className="hidden sm:inline">
            {criticalAlertCount > 0 ? `CRISIS (${criticalAlertCount})` : 'ALERT DRILL'}
          </span>
        </button>
      </div>
    </header>
  );
};
