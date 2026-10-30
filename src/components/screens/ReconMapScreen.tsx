import React, { useState, useEffect, useRef } from 'react';
import {
  Specimen,
  DroneUnit,
  RangerUnit,
  IncidentAlert,
  AcousticNode,
  OpticalMode,
} from '../../types/telemetry';
import {
  Layers,
  ZoomIn,
  ZoomOut,
  Crosshair,
  Compass,
  Radio,
  Eye,
  Shield,
  AlertTriangle,
  Send,
  Zap,
  Activity,
  Maximize2,
} from 'lucide-react';
import { playTargetLock, playTacticalClick, playDispatchTone } from '../../utils/audioEffects';

interface Props {
  specimens: Specimen[];
  drones: DroneUnit[];
  rangers: RangerUnit[];
  incidents: IncidentAlert[];
  acousticNodes: AcousticNode[];
  selectedSpecimenId: string;
  onSelectSpecimen: (id: string) => void;
  onDispatchRanger: (incidentId: string, rangerId: string) => void;
}

export const ReconMapScreen: React.FC<Props> = ({
  specimens,
  drones,
  rangers,
  incidents,
  acousticNodes,
  selectedSpecimenId,
  onSelectSpecimen,
  onDispatchRanger,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Map state
  const [opticalMode, setOpticalMode] = useState<OpticalMode>('SYNTHETIC_SAR');
  const [zoom, setZoom] = useState<number>(1.1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Layers
  const [showFauna, setShowFauna] = useState(true);
  const [showDrones, setShowDrones] = useState(true);
  const [showRangers, setShowRangers] = useState(true);
  const [showAcoustics, setShowAcoustics] = useState(true);
  const [showGeofence, setShowGeofence] = useState(true);
  const [showTopo, setShowTopo] = useState(true);

  // Selected Entity (specimen, drone, or incident)
  const [selectedEntity, setSelectedEntity] = useState<{
    type: 'specimen' | 'drone' | 'ranger' | 'incident';
    id: string;
  }>({ type: 'specimen', id: selectedSpecimenId });

  // Drone Pip Feed settings
  const [pipZoom, setPipZoom] = useState(8);
  const [pipThermal, setPipThermal] = useState(true);
  const [activeDroneId, setActiveDroneId] = useState<string>('uav-01');

  const activeDrone = drones.find((d) => d.id === activeDroneId) || drones[0];
  const currentSpecimen = specimens.find((s) => s.id === (selectedEntity.type === 'specimen' ? selectedEntity.id : selectedSpecimenId)) || specimens[0];

  // Sync selected specimen prop
  useEffect(() => {
    if (selectedSpecimenId && selectedEntity.id !== selectedSpecimenId) {
      setSelectedEntity({ type: 'specimen', id: selectedSpecimenId });
    }
  }, [selectedSpecimenId]);

  // Center on coordinate
  const mapCenter = { lat: -2.31, lng: 34.83 };

  // Convert lat/lng to canvas local coordinates
  const projectCoords = (
    lat: number,
    lng: number,
    width: number,
    height: number
  ): { x: number; y: number } => {
    const scale = 2400 * zoom;
    const x = width / 2 + (lng - mapCenter.lng) * scale + panOffset.x;
    const y = height / 2 - (lat - mapCenter.lat) * scale + panOffset.y;
    return { x, y };
  };

  // Convert screen click to nearest entity
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Check specimens
    for (const spec of specimens) {
      const pos = projectCoords(spec.coordinates.lat, spec.coordinates.lng, canvas.width, canvas.height);
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < 22) {
        playTargetLock();
        setSelectedEntity({ type: 'specimen', id: spec.id });
        onSelectSpecimen(spec.id);
        return;
      }
    }

    // Check drones
    for (const drone of drones) {
      const pos = projectCoords(drone.coordinates.lat, drone.coordinates.lng, canvas.width, canvas.height);
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < 22) {
        playTargetLock();
        setSelectedEntity({ type: 'drone', id: drone.id });
        setActiveDroneId(drone.id);
        return;
      }
    }

    // Check incidents
    for (const inc of incidents) {
      const pos = projectCoords(inc.coordinates.lat, inc.coordinates.lng, canvas.width, canvas.height);
      const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
      if (dist < 22) {
        playTargetLock();
        setSelectedEntity({ type: 'incident', id: inc.id });
        return;
      }
    }
  };

  // Mouse pan drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas render loop
  useEffect(() => {
    let animId: number;
    let radarAngle = 0;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // 1. Background Fill according to Optical Mode
      if (opticalMode === 'SYNTHETIC_SAR') {
        ctx.fillStyle = '#06090e';
      } else if (opticalMode === 'THERMAL_FLIR') {
        ctx.fillStyle = '#0a0514';
      } else if (opticalMode === 'NIGHT_VISION') {
        ctx.fillStyle = '#041008';
      } else {
        ctx.fillStyle = '#0b0f14';
      }
      ctx.fillRect(0, 0, w, h);

      // 2. Coordinate Grid Lines
      const gridSize = 60 * zoom;
      const offsetX = (panOffset.x % gridSize);
      const offsetY = (panOffset.y % gridSize);

      ctx.strokeStyle = opticalMode === 'NIGHT_VISION' ? 'rgba(0, 255, 136, 0.08)' : 'rgba(0, 243, 255, 0.06)';
      ctx.lineWidth = 1;

      for (let x = offsetX; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = offsetY; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 3. Topographic Elevation Isolines (Simulated Savanna Ridges & Mara River)
      if (showTopo) {
        ctx.save();
        ctx.strokeStyle = opticalMode === 'NIGHT_VISION' ? 'rgba(0, 255, 136, 0.16)' : 'rgba(33, 50, 71, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.setLineDash([4, 4]);

        const riverCoords = [
          { lat: -2.25, lng: 34.80 },
          { lat: -2.27, lng: 34.815 },
          { lat: -2.29, lng: 34.825 },
          { lat: -2.312, lng: 34.823 },
          { lat: -2.34, lng: 34.828 },
          { lat: -2.37, lng: 34.84 },
        ];

        // Draw Mara River line
        ctx.beginPath();
        riverCoords.forEach((pt, idx) => {
          const p = projectCoords(pt.lat, pt.lng, w, h);
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.strokeStyle = opticalMode === 'THERMAL_FLIR' ? 'rgba(120, 40, 200, 0.5)' : 'rgba(0, 243, 255, 0.35)';
        ctx.setLineDash([]);
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Topo contours
        for (let r = 1; r <= 4; r++) {
          ctx.beginPath();
          const center = projectCoords(-2.28, 34.84, w, h);
          ctx.ellipse(center.x, center.y, r * 90 * zoom, r * 55 * zoom, Math.PI / 6, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(80, 104, 130, 0.2)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 5]);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Sector Zones & Boundaries
      const sectors = [
        { code: 'SEC-02', name: 'NORTH ESCARPMENT', lat: -2.255, lng: 34.83 },
        { code: 'SEC-04', name: 'MARA RIVER BASIN', lat: -2.308, lng: 34.815 },
        { code: 'SEC-07', name: 'SERONERA RIDGE', lat: -2.285, lng: 34.86 },
        { code: 'SEC-09', name: 'KOGATENDE PLAIN', lat: -2.36, lng: 34.84 },
        { code: 'SEC-12', name: 'GRUMETI BUFFER', lat: -2.34, lng: 34.79 },
      ];

      sectors.forEach((sec) => {
        const p = projectCoords(sec.lat, sec.lng, w, h);
        ctx.fillStyle = opticalMode === 'NIGHT_VISION' ? 'rgba(0, 255, 136, 0.35)' : 'rgba(80, 104, 130, 0.4)';
        ctx.font = '10px "Space Mono", monospace';
        ctx.fillText(`[ ${sec.code} // ${sec.name} ]`, p.x - 60, p.y - 40);
      });

      // 5. Geofence Boundary Line
      if (showGeofence) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 170, 0, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 4]);

        const fencePts = [
          { lat: -2.24, lng: 34.81 },
          { lat: -2.25, lng: 34.88 },
          { lat: -2.38, lng: 34.88 },
          { lat: -2.38, lng: 34.78 },
          { lat: -2.24, lng: 34.81 },
        ];

        ctx.beginPath();
        fencePts.forEach((pt, i) => {
          const p = projectCoords(pt.lat, pt.lng, w, h);
          if (i === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Label on fence
        const fenceLabelPos = projectCoords(-2.25, 34.87, w, h);
        ctx.fillStyle = '#ffaa00';
        ctx.font = '9px "Space Mono", monospace';
        ctx.fillText('⚡ ELEC GEOFENCE BOUNDARY (10 kV)', fenceLabelPos.x - 70, fenceLabelPos.y - 10);
        ctx.restore();
      }

      // 6. Acoustic Sensor Nodes
      if (showAcoustics) {
        acousticNodes.forEach((node) => {
          const p = projectCoords(node.coordinates.lat, node.coordinates.lng, w, h);
          const isAlert = node.status === 'ALERT';

          ctx.save();
          // Radiating detection ring
          ctx.beginPath();
          ctx.arc(p.x, p.y, isAlert ? 32 * zoom : 18 * zoom, 0, Math.PI * 2);
          ctx.strokeStyle = isAlert ? 'rgba(255, 30, 68, 0.5)' : 'rgba(0, 243, 255, 0.25)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Sensor dot
          ctx.fillStyle = isAlert ? '#ff1e44' : '#00f3ff';
          ctx.fillRect(p.x - 3, p.y - 3, 6, 6);

          ctx.fillStyle = '#b9cacb';
          ctx.font = '9px "Space Mono", monospace';
          ctx.fillText(node.code, p.x + 8, p.y + 3);
          ctx.restore();
        });
      }

      // 7. Ranger Units
      if (showRangers) {
        rangers.forEach((rng) => {
          const p = projectCoords(rng.coordinates.lat, rng.coordinates.lng, w, h);

          ctx.save();
          ctx.fillStyle = '#00ff88';
          // Diamond shape
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - 7);
          ctx.lineTo(p.x + 7, p.y);
          ctx.lineTo(p.x, p.y + 7);
          ctx.lineTo(p.x - 7, p.y);
          ctx.closePath();
          ctx.fill();

          ctx.fillStyle = '#06090e';
          ctx.fillRect(p.x - 2, p.y - 2, 4, 4);

          ctx.fillStyle = '#00ff88';
          ctx.font = '9px "Space Mono", monospace';
          ctx.fillText(`▲ ${rng.callsign}`, p.x + 10, p.y + 4);
          ctx.restore();
        });
      }

      // 8. Tracked Specimens (Fauna)
      if (showFauna) {
        specimens.forEach((spec) => {
          const p = projectCoords(spec.coordinates.lat, spec.coordinates.lng, w, h);
          const isSelected = selectedEntity.type === 'specimen' && selectedEntity.id === spec.id;

          // History trail
          if (spec.historyCoords && spec.historyCoords.length > 1) {
            ctx.save();
            ctx.strokeStyle = spec.status === 'CRITICAL' ? 'rgba(255, 30, 68, 0.35)' : 'rgba(0, 243, 255, 0.3)';
            ctx.lineWidth = 1.2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            spec.historyCoords.forEach((hc, i) => {
              const hp = projectCoords(hc.lat, hc.lng, w, h);
              if (i === 0) ctx.moveTo(hp.x, hp.y);
              else ctx.lineTo(hp.x, hp.y);
            });
            ctx.stroke();
            ctx.restore();
          }

          // Blip circle
          ctx.save();
          const color = spec.status === 'CRITICAL' ? '#ff1e44' : spec.status === 'WARNING' ? '#ffaa00' : '#00ff88';
          ctx.fillStyle = color;

          ctx.beginPath();
          ctx.arc(p.x, p.y, isSelected ? 6 : 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Outer pulsing ring for critical/warning or selected
          if (spec.status === 'CRITICAL' || isSelected) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, (12 + Math.sin(Date.now() / 200) * 4) * zoom, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 1.2;
            ctx.stroke();
          }

          // Reticle square if selected
          if (isSelected) {
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 1.5;
            const size = 16;
            // Reticle brackets
            ctx.strokeRect(p.x - size, p.y - size, size * 2, size * 2);
          }

          // Monospace Tag label
          ctx.fillStyle = '#ffffff';
          ctx.font = '10px "Space Mono", monospace';
          ctx.fillText(`${spec.code} [${spec.name}]`, p.x + 12, p.y - 2);

          ctx.fillStyle = color;
          ctx.font = '8px "Space Mono", monospace';
          ctx.fillText(`${spec.heartRateBpm} BPM · ${spec.speedKmh} KM/H`, p.x + 12, p.y + 9);
          ctx.restore();
        });
      }

      // 9. Drones (UAVs) with Vision Cones
      if (showDrones) {
        drones.forEach((drone) => {
          const p = projectCoords(drone.coordinates.lat, drone.coordinates.lng, w, h);
          const isSelected = selectedEntity.type === 'drone' && selectedEntity.id === drone.id;
          const headingRad = (drone.headingDeg * Math.PI) / 180;

          ctx.save();
          // FOV Vision Cone
          const coneLength = 70 * zoom;
          const coneAngle = Math.PI / 4;

          const grad = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, coneLength);
          grad.addColorStop(0, 'rgba(0, 243, 255, 0.22)');
          grad.addColorStop(1, 'rgba(0, 243, 255, 0)');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.arc(p.x, p.y, coneLength, headingRad - coneAngle / 2, headingRad + coneAngle / 2);
          ctx.closePath();
          ctx.fill();

          // Drone icon (triangle heading)
          ctx.translate(p.x, p.y);
          ctx.rotate(headingRad);

          ctx.fillStyle = '#00f3ff';
          ctx.beginPath();
          ctx.moveTo(0, -9);
          ctx.lineTo(6, 6);
          ctx.lineTo(0, 3);
          ctx.lineTo(-6, 6);
          ctx.closePath();
          ctx.fill();

          ctx.rotate(-headingRad);
          ctx.translate(-p.x, -p.y);

          // Drone label
          ctx.fillStyle = '#00f3ff';
          ctx.font = '9px "Space Mono", monospace';
          ctx.fillText(`⌖ ${drone.callsign} [${drone.altitudeM}m]`, p.x + 12, p.y + 12);

          if (isSelected) {
            ctx.strokeStyle = '#00f3ff';
            ctx.lineWidth = 1;
            ctx.strokeRect(p.x - 14, p.y - 14, 28, 28);
          }
          ctx.restore();
        });
      }

      // 10. Incidents (Alert beacons)
      incidents.filter((i) => !i.resolved).forEach((inc) => {
        const p = projectCoords(inc.coordinates.lat, inc.coordinates.lng, w, h);
        const isCritical = inc.severity === 'CRITICAL';

        ctx.save();
        ctx.fillStyle = isCritical ? '#ff1e44' : '#ffaa00';
        ctx.strokeStyle = isCritical ? '#ff1e44' : '#ffaa00';

        // Outer pulsing hazard ring
        ctx.beginPath();
        ctx.arc(p.x, p.y, (18 + Math.sin(Date.now() / 150) * 8) * zoom, 0, Math.PI * 2);
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Cross inside
        ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y - 6);
        ctx.lineTo(p.x + 6, p.y + 6);
        ctx.moveTo(p.x + 6, p.y - 6);
        ctx.lineTo(p.x - 6, p.y + 6);
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = isCritical ? '#ff1e44' : '#ffaa00';
        ctx.font = '10px "Space Mono", monospace';
        ctx.fillText(`⚠️ ${inc.category} // ${inc.id.toUpperCase()}`, p.x + 16, p.y);
        ctx.restore();
      });

      // 11. Rotating Radar Sweep Beam (overlay)
      radarAngle += 0.015;
      ctx.save();
      const radarCenter = { x: w / 2, y: h / 2 };
      const radarRadius = Math.max(w, h) * 0.7;

      const radarGrad = ctx.createConicGradient(radarAngle, radarCenter.x, radarCenter.y);
      radarGrad.addColorStop(0, 'rgba(0, 243, 255, 0.08)');
      radarGrad.addColorStop(0.12, 'rgba(0, 243, 255, 0.0)');
      radarGrad.addColorStop(1, 'rgba(0, 243, 255, 0.0)');

      ctx.fillStyle = radarGrad;
      ctx.beginPath();
      ctx.arc(radarCenter.x, radarCenter.y, radarRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Loop animation
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [
    opticalMode,
    zoom,
    panOffset,
    showFauna,
    showDrones,
    showRangers,
    showAcoustics,
    showGeofence,
    showTopo,
    specimens,
    drones,
    rangers,
    incidents,
    acousticNodes,
    selectedEntity,
  ]);

  return (
    <div className="relative w-full h-[calc(100vh-6.5rem)] flex flex-col lg:flex-row overflow-hidden bg-[#06090e]">
      {/* Center Tactical Canvas Stage */}
      <div className="relative flex-1 h-full min-h-[420px] bg-[#06090e] overflow-hidden select-none">
        <canvas
          ref={canvasRef}
          width={1600}
          height={1000}
          onClick={handleCanvasClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full h-full cursor-crosshair block"
        />

        {/* Scanlines Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-40" />

        {/* Tactical Crosshair Watermark & Map HUD Overlays */}
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {/* Optical Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-[#0a0f18]/90 border border-[#213247] backdrop-blur-md chamfer-4">
            {(
              [
                { id: 'SYNTHETIC_SAR', label: 'SYNTH SAR' },
                { id: 'THERMAL_FLIR', label: 'FLIR THERMAL' },
                { id: 'NIGHT_VISION', label: 'NVG PHOSPHOR' },
                { id: 'OPTICAL', label: 'OPTICAL HD' },
              ] as { id: OpticalMode; label: string }[]
            ).map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  playTacticalClick();
                  setOpticalMode(mode.id);
                }}
                className={`px-2.5 py-1 font-mono text-[10px] tracking-wider transition-colors cursor-pointer ${
                  opticalMode === mode.id
                    ? 'bg-[#00f3ff] text-[#06090e] font-bold shadow-[0_0_8px_rgba(0,243,255,0.4)]'
                    : 'text-[#b9cacb] hover:text-white hover:bg-[#181c21]'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Layer Visibility Toggles */}
          <div className="hidden sm:flex items-center gap-1.5 p-1.5 bg-[#0a0f18]/80 border border-[#213247] backdrop-blur-md text-[10px] font-mono text-[#b9cacb]">
            <span className="text-[#00f3ff] px-1 font-bold">LAYERS:</span>
            <button
              onClick={() => setShowFauna(!showFauna)}
              className={`px-2 py-0.5 border ${
                showFauna ? 'border-[#00ff88]/60 text-[#00ff88] bg-[#00ff88]/10' : 'border-[#213247] text-[#506882]'
              }`}
            >
              FAUNA
            </button>
            <button
              onClick={() => setShowDrones(!showDrones)}
              className={`px-2 py-0.5 border ${
                showDrones ? 'border-[#00f3ff]/60 text-[#00f3ff] bg-[#00f3ff]/10' : 'border-[#213247] text-[#506882]'
              }`}
            >
              DRONES
            </button>
            <button
              onClick={() => setShowRangers(!showRangers)}
              className={`px-2 py-0.5 border ${
                showRangers ? 'border-[#00ff88]/60 text-[#00ff88] bg-[#00ff88]/10' : 'border-[#213247] text-[#506882]'
              }`}
            >
              RANGERS
            </button>
            <button
              onClick={() => setShowAcoustics(!showAcoustics)}
              className={`px-2 py-0.5 border ${
                showAcoustics ? 'border-[#ffaa00]/60 text-[#ffaa00] bg-[#ffaa00]/10' : 'border-[#213247] text-[#506882]'
              }`}
            >
              ACOUSTIC
            </button>
            <button
              onClick={() => setShowGeofence(!showGeofence)}
              className={`px-2 py-0.5 border ${
                showGeofence ? 'border-[#ffaa00]/60 text-[#ffaa00] bg-[#ffaa00]/10' : 'border-[#213247] text-[#506882]'
              }`}
            >
              GEOFENCE
            </button>
          </div>
        </div>

        {/* Map Zoom & Pan Navigation Controls (bottom left) */}
        <div className="absolute bottom-4 left-4 z-10 flex items-center gap-1.5 p-1 bg-[#0a0f18]/90 border border-[#213247] backdrop-blur-md">
          <button
            onClick={() => {
              playTacticalClick();
              setZoom((z) => Math.min(2.5, z + 0.2));
            }}
            className="p-1.5 text-[#00f3ff] hover:bg-[#181c21] transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <span className="font-mono text-[11px] px-1 text-[#e0e2ea] tabular-nums">
            {(zoom * 100).toFixed(0)}%
          </span>
          <button
            onClick={() => {
              playTacticalClick();
              setZoom((z) => Math.max(0.6, z - 0.2));
            }}
            className="p-1.5 text-[#00f3ff] hover:bg-[#181c21] transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-[1px] h-4 bg-[#213247] mx-1" />
          <button
            onClick={() => {
              playTacticalClick();
              setPanOffset({ x: 0, y: 0 });
              setZoom(1.1);
            }}
            className="px-2 py-1 font-mono text-[10px] text-[#849495] hover:text-white hover:bg-[#181c21]"
          >
            RESET RECON
          </button>
        </div>

        {/* Live Coordinate Crosshairs HUD Box (bottom center) */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 hidden md:flex items-center gap-4 px-3 py-1 bg-[#0a0f18]/90 border border-[#213247] font-mono text-[10px] text-[#849495]">
          <div>
            <span className="text-[#00f3ff]">GRID: </span>
            <span className="text-[#e0e2ea]">LAT -02°18&apos;44&quot;S</span>
          </div>
          <div>
            <span className="text-[#00f3ff]">LON: </span>
            <span className="text-[#e0e2ea]">034°49&apos;52&quot;E</span>
          </div>
          <div>
            <span className="text-[#00f3ff]">ELEV: </span>
            <span className="text-[#e0e2ea]">1,460m AGL</span>
          </div>
        </div>
      </div>

      {/* Right Lateral Overwatch HUD Panel (380px fixed width on desktop) */}
      <aside className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#213247] bg-[#0a0f18]/95 backdrop-blur-md flex flex-col overflow-y-auto no-scrollbar">
        {/* Section 1: Live Drone PIP Optical Feed */}
        <div className="p-4 border-b border-[#213247]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-[#00f3ff] shadow-[0_0_6px_#00f3ff]" />
              <span className="font-mono text-xs font-bold tracking-wider text-white">
                // UAV OPTICAL OVERWATCH
              </span>
            </div>
            <select
              value={activeDroneId}
              onChange={(e) => setActiveDroneId(e.target.value)}
              className="bg-[#101419] border border-[#213247] text-[11px] font-mono text-[#00f3ff] px-2 py-0.5 outline-none cursor-pointer"
            >
              {drones.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.callsign}
                </option>
              ))}
            </select>
          </div>

          {/* Simulated Tactical Drone Viewfinder Screen */}
          <div className="relative aspect-video w-full bg-[#06090e] border border-[#213247] overflow-hidden chamfer-4">
            {/* Viewfinder background simulation */}
            <div
              className={`absolute inset-0 transition-colors duration-300 ${
                pipThermal
                  ? 'bg-gradient-to-br from-[#120024] via-[#2a0845] to-[#4b1248]'
                  : 'bg-gradient-to-b from-[#041408] via-[#02200a] to-[#041408]'
              }`}
            >
              {/* Synthetic FLIR Thermal heat signatures of savanna animals */}
              <div className="absolute inset-0 flex items-center justify-center">
                {pipThermal ? (
                  <div className="relative w-36 h-24 flex items-center justify-center">
                    {/* Simulated FLIR specimen heat blob */}
                    <div className="w-20 h-14 bg-gradient-to-r from-[#ffff00] via-[#ff525e] to-[#ff0055] rounded-full blur-md opacity-80 animate-pulse" />
                    <div className="absolute top-2 left-6 w-8 h-8 bg-white rounded-full blur-xs opacity-90" />
                    <div className="absolute -top-3 text-[9px] font-mono text-[#00f3ff] bg-black/60 px-1 border border-[#00f3ff]/40">
                      TARGET HEAT: 37.4°C
                    </div>
                  </div>
                ) : (
                  <div className="text-center font-mono text-[#00ff88] text-[11px] opacity-75">
                    [ PHOSPHOR NIGHT OPTIC SENSOR ACTIVE ]
                  </div>
                )}
              </div>
            </div>

            {/* Viewfinder Reticle Overlay & Artificial Horizon */}
            <div className="absolute inset-0 pointer-events-none p-3 flex flex-col justify-between text-[10px] font-mono text-[#00f3ff]">
              {/* Top row metrics */}
              <div className="flex items-center justify-between">
                <span>HDG: {activeDrone.headingDeg}° NNE</span>
                <span className="text-[#00ff88]">ALT: {activeDrone.altitudeM}m AGL</span>
                <span>BAT: {activeDrone.batteryPercent}%</span>
              </div>

              {/* Central Target Acquisition Crosshair */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 pointer-events-none">
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#00f3ff]" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#00f3ff]" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#00f3ff]" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#00f3ff]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-[#00f3ff] rounded-full" />
              </div>

              {/* Bottom row metrics */}
              <div className="flex items-center justify-between">
                <span>SPEED: {activeDrone.speedKmh} KM/H</span>
                <span className="text-[#ffaa00]">LATENCY: {activeDrone.signalLatencyMs}ms</span>
                <span>ZOOM: {pipZoom}X</span>
              </div>
            </div>

            {/* Scanlines overlay on pip */}
            <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-50" />
          </div>

          {/* Drone View Controls */}
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#213247]/60 text-[11px] font-mono">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPipThermal(!pipThermal)}
                className={`px-2 py-0.5 border cursor-pointer ${
                  pipThermal
                    ? 'border-[#ff525e] text-[#ff525e] bg-[#ff525e]/10'
                    : 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10'
                }`}
              >
                {pipThermal ? 'MODE: FLIR' : 'MODE: NVG'}
              </button>
            </div>
            <div className="flex items-center gap-1.5 text-[#506882]">
              <span>ZOOM:</span>
              {[2, 8, 16, 30].map((z) => (
                <button
                  key={z}
                  onClick={() => setPipZoom(z)}
                  className={`px-1.5 py-0.5 cursor-pointer ${
                    pipZoom === z ? 'bg-[#00f3ff] text-[#06090e] font-bold' : 'hover:text-white'
                  }`}
                >
                  {z}x
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 2: Selected Entity Telemetry Details */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs text-[#506882] tracking-wider uppercase">
                // TARGET TELEMETRY LOCK
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 border ${
                  currentSpecimen.status === 'CRITICAL'
                    ? 'border-[#ff1e44] text-[#ff1e44] bg-[#ff1e44]/15 shadow-[0_0_8px_rgba(255,30,68,0.3)] animate-pulse'
                    : currentSpecimen.status === 'WARNING'
                    ? 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/15'
                    : 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/15'
                }`}
              >
                {currentSpecimen.status}
              </span>
            </div>

            {/* Specimen Header */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2">
                <h3 className="font-display font-bold text-xl text-white">
                  {currentSpecimen.name}
                </h3>
                <span className="font-mono text-xs text-[#00f3ff]">
                  [{currentSpecimen.code}]
                </span>
              </div>
              <p className="font-body italic text-xs text-[#b9cacb]">
                {currentSpecimen.scientificName} · {currentSpecimen.species}
              </p>
              <div className="mt-1 text-[11px] font-mono text-[#506882]">
                TRANSPONDER ID: <span className="text-[#e0e2ea]">{currentSpecimen.collarTagId}</span>
              </div>
            </div>

            {/* Quick Metrics Quad Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="p-2.5 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] font-mono text-[#849495] uppercase">HEART RATE</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-xl font-bold text-[#00f3ff]">
                    {currentSpecimen.heartRateBpm}
                  </span>
                  <span className="text-[10px] font-mono text-[#506882]">BPM</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] font-mono text-[#849495] uppercase">CORE BODY TEMP</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-xl font-bold text-white">
                    {currentSpecimen.bodyTempC.toFixed(1)}
                  </span>
                  <span className="text-[10px] font-mono text-[#506882]">°C</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] font-mono text-[#849495] uppercase">VELOCITY / BEHAVIOR</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-lg font-bold text-[#00ff88]">
                    {currentSpecimen.speedKmh}
                  </span>
                  <span className="text-[10px] font-mono text-[#506882]">KM/H · {currentSpecimen.behavior}</span>
                </div>
              </div>

              <div className="p-2.5 bg-[#101419] border border-[#213247]">
                <div className="text-[10px] font-mono text-[#849495] uppercase">TRANSMITTER CELL</div>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="font-mono text-lg font-bold text-white">
                    {currentSpecimen.transponderBattery}%
                  </span>
                  <span className="text-[10px] font-mono text-[#506882]">{currentSpecimen.signalDbm} dBm</span>
                </div>
              </div>
            </div>

            {/* Field Notes Callout */}
            <div className="p-2.5 bg-[#181c21]/80 border border-[#213247] text-xs font-body text-[#b9cacb] mb-4">
              <span className="font-mono text-[10px] text-[#00f3ff] block mb-1">
                // INTEL LOG:
              </span>
              {currentSpecimen.notes}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex flex-col gap-2 pt-3 border-t border-[#213247]">
            <button
              onClick={() => {
                playDispatchTone();
                const matchedIncident = incidents.find((i) => !i.resolved);
                if (matchedIncident) {
                  onDispatchRanger(matchedIncident.id, 'rng-01');
                }
              }}
              className="w-full py-2 bg-[#00f3ff] hover:bg-[#33f5ff] text-[#06090e] font-mono font-bold text-xs tracking-wider uppercase chamfer-tr-bl transition-all duration-150 shadow-[0_0_12px_rgba(0,243,255,0.4)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              DISPATCH OVERWATCH DRONE
            </button>

            <button
              onClick={() => {
                playTargetLock();
              }}
              className="w-full py-2 bg-[#181c21] hover:bg-[#213247] text-[#00f3ff] hover:text-white border border-[#00f3ff]/30 font-mono text-xs tracking-wider uppercase chamfer-4 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 text-[#00f3ff]" />
              PING SUBDERMAL TRANSPONDER (UWB)
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};
