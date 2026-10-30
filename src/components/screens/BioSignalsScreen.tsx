import React, { useState, useEffect, useRef } from 'react';
import { Specimen } from '../../types/telemetry';
import {
  Activity,
  Heart,
  Thermometer,
  Zap,
  Battery,
  Radio,
  AlertTriangle,
  Syringe,
  Timer,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { playTacticalClick, playTargetLock, playDispatchTone } from '../../utils/audioEffects';

interface Props {
  specimens: Specimen[];
  selectedSpecimenId: string;
  onSelectSpecimen: (id: string) => void;
}

export const BioSignalsScreen: React.FC<Props> = ({
  specimens,
  selectedSpecimenId,
  onSelectSpecimen,
}) => {
  const ecgCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const accelCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const specimen = specimens.find((s) => s.id === selectedSpecimenId) || specimens[0];

  // Dart Calculator State
  const [calcWeightKg, setCalcWeightKg] = useState<number>(specimen.weightKg);
  const [selectedDrug, setSelectedDrug] = useState<'etorphine' | 'azaperone' | 'medetomidine'>('etorphine');
  const [antidoteReady, setAntidoteReady] = useState(true);
  const [dartArmed, setDartArmed] = useState(false);

  // Sync weight when specimen changes
  useEffect(() => {
    setCalcWeightKg(specimen.weightKg);
    setDartArmed(false);
  }, [specimen.id, specimen.weightKg]);

  // Drug calculations
  const drugSpecs = {
    etorphine: {
      name: 'Etorphine HCl (M99)',
      doseMgPerKg: 0.0035,
      concentrationMgPerMl: 9.8,
      antidote: 'Naltrexone (10x ratio)',
    },
    azaperone: {
      name: 'Azaperone Neuroleptic',
      doseMgPerKg: 0.04,
      concentrationMgPerMl: 40.0,
      antidote: 'Flumazenil standby',
    },
    medetomidine: {
      name: 'Medetomidine HCl',
      doseMgPerKg: 0.015,
      concentrationMgPerMl: 20.0,
      antidote: 'Atipamezole',
    },
  };

  const currentDrug = drugSpecs[selectedDrug];
  const totalDoseMg = calcWeightKg * currentDrug.doseMgPerKg;
  const dartVolumeMl = Math.max(0.5, totalDoseMg / currentDrug.concentrationMgPerMl);

  // Live ECG Waveform Canvas Rendering Loop
  useEffect(() => {
    let animId: number;
    let xOffset = 0;
    const history: number[] = new Array(300).fill(0);

    const renderECG = () => {
      const canvas = ecgCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;
      const midY = h / 2;

      // Clear dark grid
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, w, h);

      // Draw faint medical telemetry grid
      ctx.strokeStyle = 'rgba(0, 243, 255, 0.08)';
      ctx.lineWidth = 1;
      const step = 20;
      for (let x = 0; x < w; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Generate ECG P-Q-R-S-T wave point based on BPM
      // Higher BPM = shorter period
      const bpm = specimen.heartRateBpm;
      const period = Math.max(25, Math.floor(1800 / bpm));
      const posInCycle = xOffset % period;

      let waveVal = 0;
      if (posInCycle > 4 && posInCycle < 8) {
        // P-wave
        waveVal = 8;
      } else if (posInCycle === 11) {
        // Q-drop
        waveVal = -12;
      } else if (posInCycle === 13) {
        // R-peak
        waveVal = 62;
      } else if (posInCycle === 15) {
        // S-drop
        waveVal = -24;
      } else if (posInCycle > 19 && posInCycle < 27) {
        // T-wave
        waveVal = 14;
      } else {
        // Baseline noise
        waveVal = (Math.random() - 0.5) * 2;
      }

      history.push(waveVal);
      if (history.length > w) {
        history.shift();
      }

      // Draw the ECG Trace Line
      ctx.beginPath();
      const isCritical = specimen.status === 'CRITICAL';
      ctx.strokeStyle = isCritical ? '#ff1e44' : '#00f3ff';
      ctx.lineWidth = 2;
      ctx.shadowColor = isCritical ? 'rgba(255, 30, 68, 0.8)' : 'rgba(0, 243, 255, 0.8)';
      ctx.shadowBlur = 8;

      for (let i = 0; i < history.length; i++) {
        const x = i;
        const y = midY - history[i];
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Sweeping lead dot
      const leadX = history.length - 1;
      const leadY = midY - history[leadX];
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(leadX, leadY, 3, 0, Math.PI * 2);
      ctx.fill();

      xOffset++;
      animId = requestAnimationFrame(renderECG);
    };

    renderECG();
    return () => cancelAnimationFrame(animId);
  }, [specimen.heartRateBpm, specimen.status]);

  // Accelerometer Gait Curve Canvas
  useEffect(() => {
    let animId: number;
    let t = 0;

    const renderAccel = () => {
      const canvas = accelCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.fillStyle = '#0a0f18';
      ctx.fillRect(0, 0, w, h);

      // Grid line
      ctx.strokeStyle = 'rgba(80, 104, 130, 0.2)';
      ctx.beginPath();
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      const speedFactor = specimen.speedKmh > 30 ? 3.5 : specimen.speedKmh > 5 ? 1.5 : 0.4;
      const amp = Math.min(30, 4 + specimen.speedKmh * 0.6);

      // Channel X (Cyan)
      ctx.strokeStyle = '#00f3ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin((x + t * 4) * 0.05 * speedFactor) * amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel Y (Emerald)
      ctx.strokeStyle = '#00ff88';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.cos((x + t * 3) * 0.07 * speedFactor) * (amp * 0.7);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel Z (Amber)
      ctx.strokeStyle = '#ffaa00';
      ctx.beginPath();
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin((x + t * 2) * 0.03 * speedFactor) * (amp * 0.4);
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      t++;
      animId = requestAnimationFrame(renderAccel);
    };

    renderAccel();
    return () => cancelAnimationFrame(animId);
  }, [specimen.speedKmh]);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-16">
      {/* Specimen Horizontal Selector Strip */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {specimens.map((s) => {
          const isSelected = s.id === specimen.id;
          return (
            <button
              key={s.id}
              onClick={() => {
                playTargetLock();
                onSelectSpecimen(s.id);
              }}
              className={`flex items-center gap-2.5 px-3 py-2 border transition-all duration-150 whitespace-nowrap shrink-0 chamfer-4 cursor-pointer ${
                isSelected
                  ? 'bg-[#00f3ff]/15 border-[#00f3ff] text-white shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                  : 'bg-[#0a0f18] border-[#213247] text-[#849495] hover:text-[#e0e2ea] hover:bg-[#181c21]'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-none ${
                  s.status === 'CRITICAL'
                    ? 'bg-[#ff1e44] animate-pulse'
                    : s.status === 'WARNING'
                    ? 'bg-[#ffaa00]'
                    : 'bg-[#00ff88]'
                }`}
              />
              <div className="text-left font-mono">
                <div className="text-xs font-bold text-white leading-tight">
                  {s.name} <span className="text-[#00f3ff]">[{s.code}]</span>
                </div>
                <div className="text-[10px] text-[#506882]">
                  {s.heartRateBpm} BPM · {s.speedKmh} km/h
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Primary Specimen Bio-Header Banner */}
      <div className="relative p-5 bg-[#0a0f18]/90 border border-[#213247] backdrop-blur-md chamfer-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#00f3ff] tracking-widest uppercase">
                // SPECIMEN BIOMETRIC ENCLAVE
              </span>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 border ${
                  specimen.status === 'CRITICAL'
                    ? 'border-[#ff1e44] text-[#ff1e44] bg-[#ff1e44]/15 shadow-[0_0_8px_rgba(255,30,68,0.4)] animate-pulse'
                    : specimen.status === 'WARNING'
                    ? 'border-[#ffaa00] text-[#ffaa00] bg-[#ffaa00]/15'
                    : 'border-[#00ff88] text-[#00ff88] bg-[#00ff88]/15'
                }`}
              >
                STATUS: {specimen.status}
              </span>
            </div>

            <h2 className="font-display font-bold text-2xl md:text-3xl text-white mt-1">
              {specimen.name}{' '}
              <span className="text-[#849495] text-lg font-normal">
                ({specimen.scientificName})
              </span>
            </h2>
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-[#506882] mt-1.5">
              <span>COLLAR TAG: <strong className="text-white">{specimen.collarTagId}</strong></span>
              <span>SECTOR: <strong className="text-white">{specimen.sector}</strong></span>
              <span>MASS: <strong className="text-white">{specimen.weightKg} kg</strong></span>
              <span>BEHAVIOR: <strong className="text-[#00ff88]">{specimen.behavior}</strong></span>
            </div>
          </div>

          {/* Rapid Health Overview Micro-Bar */}
          <div className="flex items-center gap-3 self-start md:self-auto p-2 bg-[#101419] border border-[#213247]">
            <div className="text-right font-mono">
              <div className="text-[10px] text-[#506882]">TRANSPONDER BATTERY</div>
              <div className="text-sm font-bold text-white flex items-center justify-end gap-1">
                <Battery className="w-3.5 h-3.5 text-[#00ff88]" />
                {specimen.transponderBattery}%
              </div>
            </div>
            <div className="w-[1px] h-8 bg-[#213247]" />
            <div className="text-right font-mono">
              <div className="text-[10px] text-[#506882]">RF SIGNAL (UWB)</div>
              <div className="text-sm font-bold text-[#00f3ff] flex items-center justify-end gap-1">
                <Radio className="w-3.5 h-3.5" />
                {specimen.signalDbm} dBm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Real-time ECG Oscilloscope Screen */}
      <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#00f3ff] animate-pulse" />
            <span className="font-mono text-xs font-bold tracking-wider text-white">
              // REAL-TIME SUBDERMAL ECG CARDIAC TRACE (LEAD II)
            </span>
          </div>
          <div className="font-mono text-xs text-[#00f3ff]">
            RATE: <span className="text-xl font-bold text-white">{specimen.heartRateBpm}</span> BPM
          </div>
        </div>

        {/* Oscilloscope Canvas */}
        <div className="relative w-full h-44 bg-[#06090e] border border-[#213247] overflow-hidden">
          <canvas
            ref={ecgCanvasRef}
            width={1200}
            height={200}
            className="w-full h-full block"
          />
          <div className="absolute top-2 left-3 font-mono text-[9px] text-[#00f3ff]/60 pointer-events-none">
            SAMPLING RATE: 500 Hz · RANGE: ±2.5 mV · FILTER: 0.05–150 Hz
          </div>
          <div className="absolute bottom-2 right-3 font-mono text-[9px] text-[#506882] pointer-events-none">
            CARDIAC RHYTHM: {specimen.status === 'CRITICAL' ? 'TACHYCARDIA (ELEVATED)' : 'SINUS NOMINAL'}
          </div>
        </div>
      </div>

      {/* 4-Quadrant Biometric HUD Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Heart Rate */}
        <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#849495] font-mono text-xs">
              <span>HEART RATE</span>
              <Heart className="w-4 h-4 text-[#ff1e44]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-white">
                {specimen.heartRateBpm}
              </span>
              <span className="font-mono text-xs text-[#506882]">BPM</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#213247] font-mono text-[10px] text-[#506882] flex justify-between">
            <span>BASELINE: 38–46</span>
            <span className={specimen.heartRateBpm > 70 ? 'text-[#ff1e44] font-bold' : 'text-[#00ff88]'}>
              {specimen.heartRateBpm > 70 ? 'HIGH STRESS' : 'RESTING NOMINAL'}
            </span>
          </div>
        </div>

        {/* Metric 2: Core Body Temperature */}
        <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#849495] font-mono text-xs">
              <span>CORE BODY TEMP</span>
              <Thermometer className="w-4 h-4 text-[#ffaa00]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-white">
                {specimen.bodyTempC.toFixed(1)}
              </span>
              <span className="font-mono text-xs text-[#506882]">°C</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#213247] font-mono text-[10px] text-[#506882] flex justify-between">
            <span>HYPERTHERMIA: &gt;39.5°</span>
            <span className="text-[#00ff88]">THERMAL STABLE</span>
          </div>
        </div>

        {/* Metric 3: Blood Oxygenation SpO2 */}
        <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#849495] font-mono text-xs">
              <span>BLOOD OXYGEN (SpO2)</span>
              <Zap className="w-4 h-4 text-[#00f3ff]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-[#00f3ff]">
                {specimen.spO2Percent}
              </span>
              <span className="font-mono text-xs text-[#506882]">%</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#213247] font-mono text-[10px] text-[#506882] flex justify-between">
            <span>RESPIRATION:</span>
            <span className="text-white font-bold">{specimen.respirationRate} / min</span>
          </div>
        </div>

        {/* Metric 4: Gait & Kinetic Velocity */}
        <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-[#849495] font-mono text-xs">
              <span>KINETIC VELOCITY</span>
              <Activity className="w-4 h-4 text-[#00ff88]" />
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-3xl font-bold text-[#00ff88]">
                {specimen.speedKmh}
              </span>
              <span className="font-mono text-xs text-[#506882]">KM/H</span>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-[#213247] font-mono text-[10px] text-[#506882] flex justify-between">
            <span>ALTITUDE:</span>
            <span className="text-white font-bold">{specimen.altitudeM}m AGL</span>
          </div>
        </div>
      </div>

      {/* Kinetic Accelerometer (X/Y/Z) & Dart Calculator Split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 3-Axis Accelerometer Visualizer */}
        <div className="p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-white">
                // 3-AXIS ACCELEROMETER GAIT SIGNATURE
              </span>
              <div className="flex items-center gap-3 text-[10px] font-mono">
                <span className="text-[#00f3ff]">■ X (SURGE)</span>
                <span className="text-[#00ff88]">■ Y (SWAY)</span>
                <span className="text-[#ffaa00]">■ Z (HEAVE)</span>
              </div>
            </div>
            <div className="w-full h-36 bg-[#06090e] border border-[#213247] overflow-hidden">
              <canvas
                ref={accelCanvasRef}
                width={600}
                height={150}
                className="w-full h-full block"
              />
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-[#213247] text-xs font-body text-[#b9cacb]">
            Accelerometer tracks tri-axial physical stride impact. Active gait pattern confirms{' '}
            <strong className="text-[#00ff88]">{specimen.behavior}</strong> locomotion without limping asymmetry or neuromuscular distress.
          </div>
        </div>

        {/* Right: Tactical Field Immobilization & Dart Dosage Calculator */}
        <div className="p-5 bg-[#0a0f18] border border-[#213247] chamfer-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[#00f3ff]" />
              <span className="font-mono text-xs font-bold text-white">
                // IMMOBILIZATION & DART DOSAGE CALCULATOR
              </span>
            </div>
            <span className="text-[10px] font-mono text-[#00ff88] px-2 py-0.5 border border-[#00ff88]/30">
              VET PROTOCOL CERTIFIED
            </span>
          </div>

          {/* Specimen Mass Scrubber Slider */}
          <div className="mb-4">
            <div className="flex justify-between text-xs font-mono mb-1">
              <span className="text-[#849495]">ESTIMATED SPECIMEN MASS:</span>
              <span className="text-white font-bold">{calcWeightKg} KG</span>
            </div>
            <input
              type="range"
              min="30"
              max="5000"
              step="10"
              value={calcWeightKg}
              onChange={(e) => setCalcWeightKg(Number(e.target.value))}
              className="w-full h-1.5 bg-[#181c21] accent-[#00f3ff] cursor-pointer"
            />
          </div>

          {/* Pharmaceutical Formulation Selector */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            {(['etorphine', 'azaperone', 'medetomidine'] as ('etorphine' | 'azaperone' | 'medetomidine')[]).map(
              (drugKey) => (
                <button
                  key={drugKey}
                  onClick={() => {
                    playTacticalClick();
                    setSelectedDrug(drugKey);
                  }}
                  className={`p-2 text-left border text-xs font-mono transition-colors cursor-pointer ${
                    selectedDrug === drugKey
                      ? 'border-[#00f3ff] bg-[#00f3ff]/10 text-white font-bold'
                      : 'border-[#213247] text-[#849495] hover:text-white'
                  }`}
                >
                  <div className="text-[10px] text-[#00f3ff] uppercase">FORMULATION</div>
                  <div className="truncate text-[11px]">{drugSpecs[drugKey].name}</div>
                </button>
              )
            )}
          </div>

          {/* Calculation Readout Matrix */}
          <div className="p-3 bg-[#101419] border border-[#213247] mb-4 grid grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <div className="text-[10px] text-[#506882]">REQUIRED ACTIVE DOSE</div>
              <div className="text-lg font-bold text-[#00f3ff]">
                {totalDoseMg.toFixed(2)} <span className="text-xs font-normal text-[#849495]">mg</span>
              </div>
            </div>

            <div>
              <div className="text-[10px] text-[#506882]">DART CHAMBER VOLUME</div>
              <div className="text-lg font-bold text-white">
                {dartVolumeMl.toFixed(2)} <span className="text-xs font-normal text-[#849495]">ml</span>
              </div>
            </div>

            <div className="col-span-2 pt-2 border-t border-[#213247] flex items-center justify-between text-[11px]">
              <span className="text-[#849495]">STANDBY REVERSAL ANTIDOTE:</span>
              <span className="text-[#00ff88] font-bold">{currentDrug.antidote}</span>
            </div>
          </div>

          {/* Remote Arm & Transmit Action */}
          <button
            onClick={() => {
              playDispatchTone();
              setDartArmed(!dartArmed);
            }}
            className={`w-full py-2.5 font-mono text-xs font-bold tracking-wider uppercase chamfer-tr-bl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              dartArmed
                ? 'bg-[#ff1e44] text-white shadow-[0_0_16px_rgba(255,30,68,0.5)] animate-pulse'
                : 'bg-[#00f3ff] hover:bg-[#33f5ff] text-[#06090e] shadow-[0_0_12px_rgba(0,243,255,0.35)]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {dartArmed ? 'DART ARMED // TRANSMITTED TO DRONE POD' : 'ARM & SYNC TO UAV INTERCEPT POD'}
          </button>
        </div>
      </div>
    </div>
  );
};
