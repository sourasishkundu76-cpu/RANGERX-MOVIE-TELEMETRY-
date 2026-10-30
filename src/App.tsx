import React, { useState, useEffect } from 'react';
import {
  INITIAL_SPECIMENS,
  INITIAL_DRONES,
  INITIAL_RANGERS,
  INITIAL_INCIDENTS,
  INITIAL_ACOUSTIC_NODES,
  INITIAL_CAMERA_TRAPS,
  INITIAL_ENVIRONMENTAL,
} from './data/mockTelemetryData';
import { Specimen, DroneUnit, RangerUnit, IncidentAlert } from './types/telemetry';
import { TacticalTopNav, ScreenId } from './components/TacticalTopNav';
import { BottomTelemetryTicker } from './components/BottomTelemetryTicker';
import { ReconMapScreen } from './components/screens/ReconMapScreen';
import { BioSignalsScreen } from './components/screens/BioSignalsScreen';
import { SectorDefenseScreen } from './components/screens/SectorDefenseScreen';
import { AcousticSpectrogramScreen } from './components/screens/AcousticSpectrogramScreen';
import { SatelliteCommsScreen } from './components/screens/SatelliteCommsScreen';
import { ShieldAlert, AlertTriangle, X, ArrowRight } from 'lucide-react';
import { playAlertWarble, playTacticalClick, playDispatchTone } from './utils/audioEffects';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('recon');
  const [selectedSpecimenId, setSelectedSpecimenId] = useState<string>('spec-01');

  // Telemetry Collections
  const [specimens, setSpecimens] = useState<Specimen[]>(INITIAL_SPECIMENS);
  const [drones, setDrones] = useState<DroneUnit[]>(INITIAL_DRONES);
  const [rangers, setRangers] = useState<RangerUnit[]>(INITIAL_RANGERS);
  const [incidents, setIncidents] = useState<IncidentAlert[]>(INITIAL_INCIDENTS);
  const [acousticNodes, setAcousticNodes] = useState(INITIAL_ACOUSTIC_NODES);
  const [cameraTraps] = useState(INITIAL_CAMERA_TRAPS);
  const [environmental] = useState(INITIAL_ENVIRONMENTAL);

  // Mission Elapsed Time (MET) clock
  const [secondsElapsed, setSecondsElapsed] = useState(30852); // ~08:34:12
  const [bannerDismissed, setBannerDismissed] = useState(false);

  // Active Critical Incidents count
  const criticalCount = incidents.filter((i) => i.severity === 'CRITICAL' && !i.resolved).length;
  const criticalIncident = incidents.find((i) => i.severity === 'CRITICAL' && !i.resolved);

  // Clock timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format Mission Elapsed Time string (HH:MM:SS)
  const formatMET = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Dispatch Ranger Action
  const handleDispatchRanger = (incidentId: string, rangerId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, assignedUnitId: rangerId } : inc))
    );
    setRangers((prev) =>
      prev.map((rng) =>
        rng.id === rangerId ? { ...rng, status: 'DISPATCHED', assignedIncidentId: incidentId, etaMinutes: 6 } : rng
      )
    );
  };

  // Resolve Incident Action
  const handleResolveIncident = (incidentId: string) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === incidentId ? { ...inc, resolved: !inc.resolved } : inc))
    );
  };

  // Simulate Random Threat Event
  const handleSimulateThreat = () => {
    playAlertWarble();
    setBannerDismissed(false);

    // Fluctuate animal heart rates and add a simulated emergency event
    const newInc: IncidentAlert = {
      id: `inc-${Date.now().toString().slice(-4)}`,
      title: 'Acoustic Gunfire Triangulation Vector Spike',
      sector: 'SEC-04 (Mara River Delta)',
      timestamp: `${formatMET(secondsElapsed)} UTC`,
      severity: 'CRITICAL',
      category: 'GUNSHOT',
      coordinates: { lat: -2.312, lng: 34.825 },
      confidencePercent: 97.8,
      description: 'Multiple high-caliber shockwaves detected within 400m of White Rhino Titan-1! QRF alert dispatched.',
      resolved: false,
      acousticDecibels: 144.2,
    };

    setIncidents((prev) => [newInc, ...prev]);

    // Spike heart rate of Titan-1
    setSpecimens((prev) =>
      prev.map((s) =>
        s.id === 'spec-01'
          ? {
              ...s,
              heartRateBpm: 76,
              speedKmh: 24.5,
              behavior: 'DISTRESSED',
              status: 'CRITICAL',
              notes: 'CRITICAL ALERT: Specimen alarmed by gunfire report! Evading south-east.',
            }
          : s
      )
    );
  };

  return (
    <div className="relative min-h-screen bg-[#06090e] text-[#e0e2ea] font-body flex flex-col overflow-x-hidden">
      {/* Top Tactical HUD Navigation Bar */}
      <TacticalTopNav
        activeScreen={activeScreen}
        onSelectScreen={(screen) => setActiveScreen(screen)}
        criticalAlertCount={criticalCount}
        missionTime={formatMET(secondsElapsed)}
        onEmergencyTrigger={() => {
          setActiveScreen('defense');
        }}
      />

      {/* Critical Emergency Banner (if active and not dismissed) */}
      {criticalIncident && !bannerDismissed && (
        <div className="relative z-20 px-4 py-2 bg-[#ff1e44]/15 border-b border-[#ff1e44] backdrop-blur-md flex items-center justify-between gap-4 text-xs font-mono shadow-[0_0_20px_rgba(255,30,68,0.3)]">
          <div className="flex items-center gap-3 overflow-hidden">
            <span className="w-2.5 h-2.5 bg-[#ff1e44] animate-ping shrink-0" />
            <div className="flex items-center gap-2 truncate">
              <span className="text-[#ff1e44] font-bold uppercase shrink-0">
                // CRITICAL INCIDENT:
              </span>
              <span className="text-white font-bold truncate">
                {criticalIncident.title} ({criticalIncident.sector})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => {
                playTacticalClick();
                setActiveScreen('defense');
              }}
              className="px-3 py-1 bg-[#ff1e44] hover:bg-[#ff3b5c] text-white font-bold text-xs uppercase chamfer-4 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>INTERCEPT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setBannerDismissed(true)}
              className="p-1 text-[#b9cacb] hover:text-white cursor-pointer"
              title="Dismiss Banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Viewport Workspace Screen Routing */}
      <main className="flex-1 w-full flex flex-col">
        {activeScreen === 'recon' && (
          <ReconMapScreen
            specimens={specimens}
            drones={drones}
            rangers={rangers}
            incidents={incidents}
            acousticNodes={acousticNodes}
            selectedSpecimenId={selectedSpecimenId}
            onSelectSpecimen={(id) => setSelectedSpecimenId(id)}
            onDispatchRanger={handleDispatchRanger}
          />
        )}

        {activeScreen === 'biosignals' && (
          <BioSignalsScreen
            specimens={specimens}
            selectedSpecimenId={selectedSpecimenId}
            onSelectSpecimen={(id) => setSelectedSpecimenId(id)}
          />
        )}

        {activeScreen === 'defense' && (
          <SectorDefenseScreen
            incidents={incidents}
            rangers={rangers}
            drones={drones}
            onDispatchRanger={handleDispatchRanger}
            onResolveIncident={handleResolveIncident}
          />
        )}

        {activeScreen === 'acoustics' && (
          <AcousticSpectrogramScreen
            cameraTraps={cameraTraps}
            environmental={environmental}
          />
        )}

        {activeScreen === 'comms' && <SatelliteCommsScreen />}
      </main>

      {/* Persistent Bottom Letterbox Telemetry Ticker */}
      <BottomTelemetryTicker
        onSimulateThreat={handleSimulateThreat}
        activeSpecimenCount={specimens.length}
      />
    </div>
  );
}
