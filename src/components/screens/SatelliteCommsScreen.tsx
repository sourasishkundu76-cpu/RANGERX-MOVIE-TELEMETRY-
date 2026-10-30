import React, { useState } from 'react';
import {
  Radio,
  Wifi,
  Satellite,
  BatteryCharging,
  Key,
  ShieldCheck,
  RefreshCw,
  Server,
  Zap,
  Activity,
  Lock,
} from 'lucide-react';
import { playTacticalClick, playDispatchTone } from '../../utils/audioEffects';

export const SatelliteCommsScreen: React.FC = () => {
  const [keyRotated, setKeyRotated] = useState(false);
  const [offlineMode, setOfflineMode] = useState(false);
  const [testingMesh, setTestingMesh] = useState(false);
  const [meshNodes, setMeshNodes] = useState([
    { id: 'node-hq', name: 'COMMAND HQ MAIN RELAY', status: 'ONLINE', pingMs: 4, battery: 100, snr: 34 },
    { id: 'node-01', name: 'SECTOR 02 ESCARPMENT MAST', status: 'ONLINE', pingMs: 12, battery: 94, snr: 28 },
    { id: 'node-02', name: 'MARA RIVER HYDRO-TOWER', status: 'ONLINE', pingMs: 16, battery: 88, snr: 26 },
    { id: 'node-03', name: 'SERONERA HIGH RIDGE REPEATER', status: 'ONLINE', pingMs: 9, battery: 91, snr: 31 },
    { id: 'node-04', name: 'GRUMETI BUFFER OUTPOST', status: 'ONLINE', pingMs: 22, battery: 79, snr: 24 },
    { id: 'node-05', name: 'KOGATENDE MOBILE GATEWAY', status: 'ONLINE', pingMs: 18, battery: 85, snr: 27 },
  ]);

  const handleTestMesh = () => {
    playTacticalClick();
    setTestingMesh(true);
    setTimeout(() => {
      setMeshNodes((prev) =>
        prev.map((n) => ({
          ...n,
          pingMs: Math.max(3, Math.floor(n.pingMs + (Math.random() * 6 - 3))),
          snr: Math.max(20, Math.floor(n.snr + (Math.random() * 4 - 2))),
        }))
      );
      setTestingMesh(false);
    }, 1200);
  };

  const handleRotateKeys = () => {
    playDispatchTone();
    setKeyRotated(true);
    setTimeout(() => setKeyRotated(false), 3000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-16">
      {/* Comms System Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00f3ff]/15 border border-[#00f3ff] text-[#00f3ff] chamfer-4">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">
              SATELLITE UPLINK & LORA FIELD MESH TELEMETRY
            </h2>
            <p className="font-mono text-xs text-[#849495]">
              LEO CONSTELLATION ORBITAL TRACKER · TACTICAL VHF RADIO MESH · LiFePO4 POWER GRID
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTacticalClick();
              setOfflineMode(!offlineMode);
            }}
            className={`px-3 py-1.5 font-mono text-xs font-bold tracking-wider uppercase border transition-colors cursor-pointer ${
              offlineMode
                ? 'border-[#ff1e44] bg-[#ff1e44]/20 text-[#ff1e44]'
                : 'border-[#00ff88]/40 bg-[#00ff88]/10 text-[#00ff88]'
            }`}
          >
            {offlineMode ? 'RADIO SILENCE (EMCON ACTIVE)' : 'TRANSMIT BROADCAST ACTIVE'}
          </button>
        </div>
      </div>

      {/* Satellite Constellation & Radio Frequency Matrix Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEO Satellite Uplink Station (6 cols) */}
        <div className="lg:col-span-6 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Satellite className="w-4 h-4 text-[#00f3ff]" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  // LEO SATELLITE CONSTELLATION UPLINK
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00ff88] px-1.5 py-0.5 border border-[#00ff88]/30">
                LOCKED (4 BIRDS)
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">PRIMARY ORBITAL TRANSPONDER</div>
                  <div className="text-white font-bold text-sm">IRIDIUM-NEXT #142 (POLAR ORBIT)</div>
                </div>
                <span className="text-[#00ff88] font-bold">AZ: 182° · EL: 64°</span>
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">SECONDARY BROADBAND TELEMETRY</div>
                  <div className="text-white font-bold text-sm">STARLINK CONSTELLATION BATCH 38</div>
                </div>
                <span className="text-[#00f3ff] font-bold">DOWN: 84 Mbps · UP: 22 Mbps</span>
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] grid grid-cols-3 gap-2">
                <div>
                  <div className="text-[10px] text-[#506882]">SIGNAL (SNR)</div>
                  <div className="text-white font-bold text-base">32.4 dB</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#506882]">PACKET LOSS</div>
                  <div className="text-[#00ff88] font-bold text-base">0.00%</div>
                </div>
                <div>
                  <div className="text-[10px] text-[#506882]">BURST LATENCY</div>
                  <div className="text-[#00f3ff] font-bold text-base">14 ms</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#213247] text-xs font-mono text-[#506882] flex justify-between">
            <span>NEXT ORBITAL HANDOVER: 18m 42s</span>
            <span className="text-[#00ff88]">CONTINUOUS UPTIME: 142d</span>
          </div>
        </div>

        {/* Tactical Radio Frequencies & AES Key Rotation (6 cols) */}
        <div className="lg:col-span-6 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#00f3ff]" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  // ENCRYPTED TACTICAL VHF/UHF CHANNELS
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00ff88] px-1.5 py-0.5 border border-[#00ff88]/30">
                AES-256-GCM
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-2.5 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">CH-01: RAPID REACTION COMMAND</div>
                  <div className="text-[10px] text-[#849495]">148.625 MHz (VHF FM / CTCSS 103.5 Hz)</div>
                </div>
                <span className="text-[#00ff88]">ALPHA-6 / VIPER</span>
              </div>

              <div className="p-2.5 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">CH-02: UAV TELEMETRY DATA LINK</div>
                  <div className="text-[10px] text-[#849495]">915 MHz ISM Frequency Hopping (FHSS)</div>
                </div>
                <span className="text-[#00f3ff]">DRONE AIR-TO-GROUND</span>
              </div>

              <div className="p-2.5 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">CH-03: SUBDERMAL BIO-TRANSPONDERS</div>
                  <div className="text-[10px] text-[#849495]">433.92 MHz Ultra-Low Power Pulse Beacon</div>
                </div>
                <span className="text-[#ffaa00]">RHINO & ELEPHANT TAGS</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#213247] flex items-center justify-between">
            <span className="font-mono text-xs text-[#849495]">
              {keyRotated ? 'NEW KEY DERIVED & SYNCHRONIZED' : 'CIPHER KEY: 0x9F4A...B82C (CYCLE 48)'}
            </span>
            <button
              onClick={handleRotateKeys}
              className="px-3 py-1.5 bg-[#181c21] hover:bg-[#213247] border border-[#00f3ff]/40 text-[#00f3ff] font-mono text-xs font-bold uppercase transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              ROTATE CIPHER KEYS
            </button>
          </div>
        </div>
      </div>

      {/* Field LoRa Mesh Network & Solar Power Stations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LoRa Mesh Topology Table (8 cols) */}
        <div className="lg:col-span-8 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-[#00f3ff]" />
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                // LORA FIELD MESH REPEATER HEALTH MATRIX
              </span>
            </div>
            <button
              onClick={handleTestMesh}
              disabled={testingMesh}
              className="px-2.5 py-1 bg-[#101419] border border-[#00f3ff]/40 text-[#00f3ff] text-xs font-mono flex items-center gap-1.5 hover:bg-[#181c21] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testingMesh ? 'animate-spin' : ''}`} />
              TEST ALL PINGS
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[#213247] text-[#506882] text-[10px]">
                  <th className="py-2 px-3">NODE DESIGNATION</th>
                  <th className="py-2 px-3">STATUS</th>
                  <th className="py-2 px-3">LATENCY</th>
                  <th className="py-2 px-3">SNR</th>
                  <th className="py-2 px-3">BATTERY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#213247]/60">
                {meshNodes.map((n) => (
                  <tr key={n.id} className="hover:bg-[#101419]/80 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{n.name}</td>
                    <td className="py-2.5 px-3 text-[#00ff88]">● {n.status}</td>
                    <td className="py-2.5 px-3 text-[#00f3ff] tabular-nums">{n.pingMs} ms</td>
                    <td className="py-2.5 px-3 text-white tabular-nums">{n.snr} dB</td>
                    <td className="py-2.5 px-3 text-white tabular-nums">{n.battery}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Solar Generation & LiFePO4 Battery Bank (4 cols) */}
        <div className="lg:col-span-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BatteryCharging className="w-4 h-4 text-[#00ff88]" />
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  // POWER & SOLAR HARVEST
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#00ff88]">NOMINAL</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] text-[#506882]">STATION BATTERY BANK (LiFePO4)</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-white">94.2%</span>
                  <span className="text-xs text-[#00ff88]">52.8 VDC (FLOAT CHARGE)</span>
                </div>
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] text-[#506882]">PHOTOVOLTAIC SOLAR ARRAY YIELD</div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold text-[#ffaa00]">4.82 kW</span>
                  <span className="text-xs text-[#849495]">PEAK SUNLIGHT FLUX</span>
                </div>
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] text-[#506882]">RESERVE AUTONOMY RUNTIME</div>
                <div className="text-lg font-bold text-white">96 HOURS (ZERO SUN)</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#213247] text-xs font-mono text-[#506882]">
            Thermal heat sink operating at 34.2°C nominal.
          </div>
        </div>
      </div>
    </div>
  );
};
