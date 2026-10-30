import React, { useState } from 'react';
import { IncidentAlert, RangerUnit, DroneUnit } from '../../types/telemetry';
import {
  ShieldAlert,
  AlertTriangle,
  Send,
  Zap,
  Volume2,
  Eye,
  CheckCircle2,
  Radio,
  Clock,
  Compass,
  FileText,
  Flame,
} from 'lucide-react';
import {
  playTacticalClick,
  playAlertWarble,
  playDispatchTone,
  playTargetLock,
} from '../../utils/audioEffects';

interface Props {
  incidents: IncidentAlert[];
  rangers: RangerUnit[];
  drones: DroneUnit[];
  onDispatchRanger: (incidentId: string, rangerId: string) => void;
  onResolveIncident: (incidentId: string) => void;
}

export const SectorDefenseScreen: React.FC<Props> = ({
  incidents,
  rangers,
  drones,
  onDispatchRanger,
  onResolveIncident,
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>(incidents[0]?.id || 'inc-01');
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');
  const [selectedRangerId, setSelectedRangerId] = useState<string>('rng-01');

  // Deterrent state
  const [lradActive, setLradActive] = useState(false);
  const [strobeActive, setStrobeActive] = useState(false);
  const [fenceSurgeActive, setFenceSurgeActive] = useState(false);
  const [logNote, setLogNote] = useState('');
  const [customLogs, setCustomLogs] = useState<{ id: string; time: string; text: string }[]>([
    {
      id: 'l-1',
      time: '08:31:40 UTC',
      text: 'Acoustic array tripped across nodes AC-01 and AC-03. Centerfire caliber confirmed.',
    },
    {
      id: 'l-2',
      time: '08:32:15 UTC',
      text: 'Ranger Alpha-6 dispatched from Outpost Zulu. ETA 6 minutes.',
    },
  ]);

  const filteredIncidents = incidents.filter((inc) => {
    if (filterSeverity === 'ALL') return true;
    return inc.severity === filterSeverity;
  });

  const activeIncident = incidents.find((i) => i.id === selectedIncidentId) || incidents[0];
  const assignedRanger = rangers.find((r) => r.id === activeIncident?.assignedUnitId);

  // Trigger LRAD siren
  const handleTriggerLRAD = () => {
    playAlertWarble();
    setLradActive(true);
    setTimeout(() => setLradActive(false), 3000);
    setCustomLogs((prev) => [
      {
        id: `l-${Date.now()}`,
        time: 'JUST NOW',
        text: 'COMMAND: 135 dB LRAD Acoustic Directional Siren triggered in sector.',
      },
      ...prev,
    ]);
  };

  // Trigger Strobe Dazzler
  const handleTriggerStrobe = () => {
    playTacticalClick();
    setStrobeActive(true);
    setTimeout(() => setStrobeActive(false), 3000);
    setCustomLogs((prev) => [
      {
        id: `l-${Date.now()}`,
        time: 'JUST NOW',
        text: 'COMMAND: High-Intensity Xenon Strobe Dazzler array pulsed on Perimeter Tower 3.',
      },
      ...prev,
    ]);
  };

  // Trigger Fence Voltage Surge
  const handleTriggerFenceSurge = () => {
    playTacticalClick();
    setFenceSurgeActive(true);
    setTimeout(() => setFenceSurgeActive(false), 4000);
    setCustomLogs((prev) => [
      {
        id: `l-${Date.now()}`,
        time: 'JUST NOW',
        text: 'COMMAND: Smart Fence Grid pulsed to maximum deterrent voltage (12.4 kV).',
      },
      ...prev,
    ]);
  };

  // Append user field note
  const handleAddLogNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!logNote.trim()) return;
    playTacticalClick();
    setCustomLogs((prev) => [
      {
        id: `l-${Date.now()}`,
        time: 'JUST NOW',
        text: `OPERATOR: ${logNote.trim()}`,
      },
      ...prev,
    ]);
    setLogNote('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-16">
      {/* Top Threat Triage Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#ff1e44]/15 border border-[#ff1e44] text-[#ff1e44] chamfer-4">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">
              SECTOR DEFENSE & RAPID INTERCEPTION
            </h2>
            <p className="font-mono text-xs text-[#849495]">
              GUNSHOT TRIANGULATION · PERIMETER BREACH ENFORCEMENT · QRF DISPATCH
            </p>
          </div>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#101419] border border-[#213247] self-start sm:self-auto">
          {(['ALL', 'CRITICAL', 'WARNING'] as ('ALL' | 'CRITICAL' | 'WARNING')[]).map((sev) => (
            <button
              key={sev}
              onClick={() => {
                playTacticalClick();
                setFilterSeverity(sev);
              }}
              className={`px-3 py-1 font-mono text-xs tracking-wider transition-colors cursor-pointer ${
                filterSeverity === sev
                  ? 'bg-[#00f3ff] text-[#06090e] font-bold shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                  : 'text-[#849495] hover:text-white'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Incident Queue (Left) vs Action Console (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Incidents List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              // ACTIVE CRISIS QUEUE ({filteredIncidents.length})
            </span>
            <span className="font-mono text-[10px] text-[#506882]">REAL-TIME RECON</span>
          </div>

          <div className="space-y-2.5">
            {filteredIncidents.map((inc) => {
              const isSelected = inc.id === activeIncident?.id;
              const isCritical = inc.severity === 'CRITICAL';

              return (
                <div
                  key={inc.id}
                  onClick={() => {
                    playTargetLock();
                    setSelectedIncidentId(inc.id);
                  }}
                  className={`p-3.5 border transition-all duration-150 cursor-pointer chamfer-4 ${
                    isSelected
                      ? isCritical
                        ? 'bg-[#ff1e44]/15 border-[#ff1e44] shadow-[0_0_14px_rgba(255,30,68,0.3)]'
                        : 'bg-[#00f3ff]/15 border-[#00f3ff] shadow-[0_0_14px_rgba(0,243,255,0.3)]'
                      : 'bg-[#0a0f18] border-[#213247] hover:border-[#506882] hover:bg-[#181c21]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 ${
                          isCritical ? 'bg-[#ff1e44] animate-ping' : 'bg-[#ffaa00]'
                        }`}
                      />
                      <span className="font-mono text-xs font-bold text-white uppercase">
                        {inc.category}
                      </span>
                    </div>
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.5 border ${
                        isCritical
                          ? 'border-[#ff1e44] text-[#ff1e44] bg-[#ff1e44]/10'
                          : 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/10'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </div>

                  <h4 className="font-display font-semibold text-sm text-[#e0e2ea] leading-snug">
                    {inc.title}
                  </h4>
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#506882] mt-2">
                    <span>SECTOR: <strong className="text-[#b9cacb]">{inc.sector}</strong></span>
                    <span>{inc.timestamp}</span>
                  </div>

                  {inc.assignedUnitId && (
                    <div className="mt-2 text-[10px] font-mono text-[#00ff88] flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      QRF DISPATCHED · ETA ACTIVE
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tactical Command & Action Details (7 cols) */}
        {activeIncident && (
          <div className="lg:col-span-7 space-y-5">
            {/* Incident Intel Detail Box */}
            <div className="p-5 bg-[#0a0f18] border border-[#213247] chamfer-6">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs text-[#00f3ff] tracking-wider uppercase">
                  // CRISIS DOSSIER: {activeIncident.id.toUpperCase()}
                </span>
                <span className="font-mono text-xs text-[#849495]">
                  AI CONFIDENCE: <strong className="text-white">{activeIncident.confidencePercent}%</strong>
                </span>
              </div>

              <h3 className="font-display font-bold text-xl text-white mb-2">
                {activeIncident.title}
              </h3>
              <p className="font-body text-sm text-[#b9cacb] mb-4">
                {activeIncident.description}
              </p>

              {/* Sensor Triangulation Grid */}
              <div className="p-3 bg-[#101419] border border-[#213247] grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs mb-4">
                <div>
                  <div className="text-[10px] text-[#506882]">SECTOR LOCATION</div>
                  <div className="text-white font-bold">{activeIncident.sector}</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#506882]">PEAK ACOUSTICS</div>
                  <div className="text-[#ff1e44] font-bold">
                    {activeIncident.acousticDecibels ? `${activeIncident.acousticDecibels} dB` : 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-[#506882]">GEO-COORDINATES</div>
                  <div className="text-[#00f3ff]">
                    {activeIncident.coordinates.lat.toFixed(4)}, {activeIncident.coordinates.lng.toFixed(4)}
                  </div>
                </div>
              </div>

              {/* Ranger Intercept Dispatch Section */}
              <div className="p-3.5 bg-[#181c21] border border-[#213247] mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-white">
                    // QUICK REACTION FORCE (QRF) DEPLOYMENT
                  </span>
                  <span className="text-[10px] font-mono text-[#00ff88]">
                    {assignedRanger ? `DEPLOYED: ${assignedRanger.callsign}` : 'STANDBY READY'}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedRangerId}
                    onChange={(e) => setSelectedRangerId(e.target.value)}
                    className="flex-1 bg-[#101419] border border-[#213247] text-xs font-mono text-white p-2 outline-none cursor-pointer"
                  >
                    {rangers.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.callsign} ({r.name}) - {r.teamSize} Ops [{r.status}]
                      </option>
                    ))}
                  </select>

                  <button
                    onClick={() => {
                      playDispatchTone();
                      onDispatchRanger(activeIncident.id, selectedRangerId);
                      setCustomLogs((prev) => [
                        {
                          id: `l-${Date.now()}`,
                          time: 'JUST NOW',
                          text: `DISPATCH: Unit ${selectedRangerId} vectoring to Sector ${activeIncident.sector} immediately!`,
                        },
                        ...prev,
                      ]);
                    }}
                    className="px-4 py-2 bg-[#00f3ff] hover:bg-[#33f5ff] text-[#06090e] font-mono font-bold text-xs tracking-wider uppercase chamfer-4 transition-all shadow-[0_0_12px_rgba(0,243,255,0.4)] flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5" />
                    DISPATCH INTERCEPT (ETA 6m)
                  </button>
                </div>
              </div>

              {/* Mark Incident Resolved */}
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    playTacticalClick();
                    onResolveIncident(activeIncident.id);
                  }}
                  className="px-3 py-1.5 border border-[#00ff88]/40 hover:bg-[#00ff88]/20 text-[#00ff88] font-mono text-xs tracking-wider uppercase transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {activeIncident.resolved ? 'INCIDENT SECURED / CLOSED' : 'AUTHORIZE ALL-CLEAR SECURE'}
                </button>
              </div>
            </div>

            {/* Non-Lethal Defense Countermeasures Array */}
            <div className="p-5 bg-[#0a0f18] border border-[#213247] chamfer-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  // NON-LETHAL DEFENSE & DETERRENT COUNTERMEASURES
                </span>
                <span className="text-[10px] font-mono text-[#ffaa00]">FAIL-SAFE ARMED</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Deterrent 1: LRAD Siren */}
                <button
                  onClick={handleTriggerLRAD}
                  className={`p-3 border text-left font-mono transition-all duration-150 chamfer-4 cursor-pointer ${
                    lradActive
                      ? 'bg-[#ff1e44] text-white border-[#ff1e44] shadow-[0_0_16px_rgba(255,30,68,0.7)] animate-pulse'
                      : 'bg-[#101419] border-[#213247] text-[#b9cacb] hover:border-[#00f3ff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Volume2 className="w-4 h-4 text-[#ff1e44]" />
                    <span className="text-[9px] text-[#506882]">135 dB</span>
                  </div>
                  <div className="font-bold text-xs text-white">LRAD SONIC BURST</div>
                  <div className="text-[10px] text-[#849495] mt-1">
                    Directional acoustic deterrent against poachers & elephants
                  </div>
                </button>

                {/* Deterrent 2: Xenon Strobe */}
                <button
                  onClick={handleTriggerStrobe}
                  className={`p-3 border text-left font-mono transition-all duration-150 chamfer-4 cursor-pointer ${
                    strobeActive
                      ? 'bg-[#00f3ff] text-[#06090e] border-[#00f3ff] shadow-[0_0_16px_rgba(0,243,255,0.7)]'
                      : 'bg-[#101419] border-[#213247] text-[#b9cacb] hover:border-[#00f3ff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Zap className="w-4 h-4 text-[#00f3ff]" />
                    <span className="text-[9px] text-[#506882]">500,000 CD</span>
                  </div>
                  <div className="font-bold text-xs text-white">XENON STROBE DAZZLE</div>
                  <div className="text-[10px] text-[#849495] mt-1">
                    High-frequency optical disorientation burst on Tower 3
                  </div>
                </button>

                {/* Deterrent 3: Geofence Voltage Boost */}
                <button
                  onClick={handleTriggerFenceSurge}
                  className={`p-3 border text-left font-mono transition-all duration-150 chamfer-4 cursor-pointer ${
                    fenceSurgeActive
                      ? 'bg-[#ffaa00] text-[#06090e] border-[#ffaa00] shadow-[0_0_16px_rgba(255,170,0,0.7)]'
                      : 'bg-[#101419] border-[#213247] text-[#b9cacb] hover:border-[#00f3ff]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <Flame className="w-4 h-4 text-[#ffaa00]" />
                    <span className="text-[9px] text-[#506882]">12.4 kV</span>
                  </div>
                  <div className="font-bold text-xs text-white">GEOFENCE PULSE SURGE</div>
                  <div className="text-[10px] text-[#849495] mt-1">
                    Transient boundary voltage escalation to prevent intrusion
                  </div>
                </button>
              </div>
            </div>

            {/* Tactical Incident Incident Action Log & Field Note Form */}
            <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-white">
                  // SECTOR TACTICAL COMMS & LOG STREAM
                </span>
                <span className="text-[10px] font-mono text-[#506882]">ENCRYPTED AES-256</span>
              </div>

              <div className="h-32 overflow-y-auto bg-[#06090e] border border-[#213247] p-2.5 font-mono text-xs space-y-1.5 mb-3">
                {customLogs.map((log) => (
                  <div key={log.id} className="text-[#b9cacb]">
                    <span className="text-[#00f3ff]">[{log.time}]</span> {log.text}
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddLogNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="TRANSMIT FIELD LOG DIRECTIVE..."
                  value={logNote}
                  onChange={(e) => setLogNote(e.target.value)}
                  className="flex-1 bg-[#101419] border-b-2 border-[#213247] focus:border-[#00f3ff] px-3 py-1.5 text-xs font-mono text-white uppercase outline-none placeholder:text-[#506882]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#181c21] hover:bg-[#213247] border border-[#00f3ff]/40 text-[#00f3ff] font-mono text-xs font-bold uppercase transition-colors cursor-pointer"
                >
                  LOG
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
