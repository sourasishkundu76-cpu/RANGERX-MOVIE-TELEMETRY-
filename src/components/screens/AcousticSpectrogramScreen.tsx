import React, { useState, useEffect, useRef } from 'react';
import { CameraTrapCapture, EnvironmentalData } from '../../types/telemetry';
import {
  Eye,
  Radio,
  Volume2,
  Wind,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Maximize2,
  Sun,
  Moon,
  CloudRain,
  Activity,
} from 'lucide-react';
import { playTacticalClick, playTargetLock } from '../../utils/audioEffects';

interface Props {
  cameraTraps: CameraTrapCapture[];
  environmental: EnvironmentalData;
}

export const AcousticSpectrogramScreen: React.FC<Props> = ({
  cameraTraps,
  environmental,
}) => {
  const spectrogramCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const eqCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const [selectedTrap, setSelectedTrap] = useState<CameraTrapCapture>(cameraTraps[0]);
  const [activeFrequencyBand, setActiveFrequencyBand] = useState<'ALL' | 'INFRASOUND' | 'BALLISTIC'>('ALL');

  // Waterfall Spectrogram Canvas Rendering
  useEffect(() => {
    let animId: number;
    const canvas = spectrogramCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;

    // Waterfall buffer
    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = w;
    bufferCanvas.height = h;
    const bufferCtx = bufferCanvas.getContext('2d');
    if (!bufferCtx) return;

    bufferCtx.fillStyle = '#06090e';
    bufferCtx.fillRect(0, 0, w, h);

    const render = () => {
      // Shift existing image down by 2 pixels
      bufferCtx.drawImage(canvas, 0, 0, w, h - 2, 0, 2, w, h - 2);

      // Generate new top frequency line
      const imgData = bufferCtx.createImageData(w, 2);
      const data = imgData.data;

      for (let x = 0; x < w; x++) {
        // Frequency bands
        const freqRatio = x / w;
        let intensity = Math.random() * 0.15; // baseline noise

        // Simulated gunshot impulse signature spike at ~2.2kHz
        if (freqRatio > 0.45 && freqRatio < 0.52) {
          intensity += 0.8 * Math.random();
        }
        // Simulated elephant infrasound rumble at <30Hz
        if (freqRatio < 0.05) {
          intensity += 0.65 * (0.5 + 0.5 * Math.sin(Date.now() / 200));
        }
        // Diesel engine harmonics around 300Hz-600Hz
        if (freqRatio > 0.15 && freqRatio < 0.22) {
          intensity += 0.4 * Math.random();
        }

        // Color mapping: Blue -> Cyan -> Yellow -> Red
        let r = 0, g = 0, b = 0;
        if (intensity < 0.25) {
          b = Math.floor((intensity / 0.25) * 120);
        } else if (intensity < 0.5) {
          const t = (intensity - 0.25) / 0.25;
          g = Math.floor(t * 220);
          b = 220;
        } else if (intensity < 0.75) {
          const t = (intensity - 0.5) / 0.25;
          r = Math.floor(t * 240);
          g = 240;
          b = Math.floor((1 - t) * 200);
        } else {
          const t = (intensity - 0.75) / 0.25;
          r = 255;
          g = Math.floor((1 - t) * 150);
          b = 40;
        }

        for (let row = 0; row < 2; row++) {
          const idx = (row * w + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      bufferCtx.putImageData(imgData, 0, 0);

      // Draw buffer to main canvas
      ctx.drawImage(bufferCanvas, 0, 0);

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Equalizer Bars Canvas
  useEffect(() => {
    let animId: number;
    const canvas = eqCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const barCount = 32;
    const renderEQ = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0a0f18';
      ctx.fillRect(0, 0, w, h);

      const barWidth = (w - (barCount - 1) * 2) / barCount;

      for (let i = 0; i < barCount; i++) {
        const ratio = i / barCount;
        let amp = 0.1 + Math.random() * 0.3;
        // Peak at gunshot harmonic
        if (i >= 14 && i <= 17) {
          amp = 0.5 + Math.random() * 0.5;
        }
        // Infrasound peak
        if (i <= 2) {
          amp = 0.6 + Math.random() * 0.35;
        }

        const barHeight = amp * (h - 10);
        const x = i * (barWidth + 2);
        const y = h - barHeight;

        // Gradient
        const grad = ctx.createLinearGradient(0, y, 0, h);
        if (amp > 0.75) {
          grad.addColorStop(0, '#ff1e44');
          grad.addColorStop(1, '#ffaa00');
        } else if (amp > 0.4) {
          grad.addColorStop(0, '#ffaa00');
          grad.addColorStop(1, '#00f3ff');
        } else {
          grad.addColorStop(0, '#00f3ff');
          grad.addColorStop(1, '#00ff88');
        }

        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barWidth, barHeight);
      }

      animId = requestAnimationFrame(renderEQ);
    };

    renderEQ();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 pb-16">
      {/* Screen Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#00f3ff]/15 border border-[#00f3ff] text-[#00f3ff] chamfer-4">
            <Volume2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-white">
              ACOUSTIC SPECTROGRAM & SENSOR INTELLIGENCE
            </h2>
            <p className="font-mono text-xs text-[#849495]">
              HYDROPHONE SEISMIC WATERFALL · BALLISTIC IMPULSE AI CLASSIFIER · OPTICAL TRAP AUDIT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-[#00ff88]">ARRAY HEALTH: 98.4%</span>
          <span className="text-[#506882]">|</span>
          <span className="text-[#e0e2ea]">4 ACTIVE SENSORS LOCKED</span>
        </div>
      </div>

      {/* Acoustic Waterfall Spectrogram & Multi-Channel EQ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Waterfall Spectrogram (8 cols) */}
        <div className="lg:col-span-8 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                // REAL-TIME AUDIO WATERFALL SPECTROGRAM (0 Hz – 20,000 Hz)
              </span>
              <div className="flex items-center gap-1 font-mono text-[10px]">
                <span className="text-[#ff1e44]">■ BALLISTIC SPIKE</span>
                <span className="text-[#00f3ff]">■ AMBIENT</span>
                <span className="text-[#00ff88]">■ INFRASOUND</span>
              </div>
            </div>

            {/* Spectrogram Canvas */}
            <div className="relative w-full h-56 bg-[#06090e] border border-[#213247] overflow-hidden">
              <canvas
                ref={spectrogramCanvasRef}
                width={800}
                height={220}
                className="w-full h-full block"
              />
              {/* Frequency Scale Legend */}
              <div className="absolute bottom-1 left-2 right-2 flex justify-between font-mono text-[9px] text-[#506882] bg-black/60 px-2 py-0.5">
                <span>0 Hz (INFRASOUND)</span>
                <span>500 Hz</span>
                <span className="text-[#ff1e44] font-bold">2.2 kHz (GUNSHOT PEAK)</span>
                <span>8 kHz</span>
                <span>20 kHz (ULTRASONIC)</span>
              </div>
            </div>
          </div>

          {/* Equalizer Frequency Strips */}
          <div className="mt-4 pt-3 border-t border-[#213247]">
            <div className="flex items-center justify-between mb-1.5 font-mono text-[10px] text-[#849495]">
              <span>CHANNEL PEAK AMPLITUDE SPECTRUM (dB SPL)</span>
              <span className="text-[#00f3ff]">SAMPLE RATE 48 kHz / 24-BIT</span>
            </div>
            <div className="w-full h-20 bg-[#06090e] border border-[#213247] overflow-hidden">
              <canvas
                ref={eqCanvasRef}
                width={800}
                height={80}
                className="w-full h-full block"
              />
            </div>
          </div>
        </div>

        {/* Neural Acoustic Classifier Matrix (4 cols) */}
        <div className="lg:col-span-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                // ACOUSTIC AI CLASSIFIER
              </span>
              <span className="text-[10px] font-mono text-[#00ff88] px-1.5 py-0.5 border border-[#00ff88]/30">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              {/* Threat 1 */}
              <div className="p-2.5 bg-[#101419] border border-[#ff1e44]/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">CENTERFIRE RIFLE REPORT</span>
                  <span className="text-[#ff1e44] font-bold">96.4% MATCH</span>
                </div>
                <div className="w-full bg-[#1c2025] h-1.5 overflow-hidden mb-1.5">
                  <div className="bg-[#ff1e44] h-full" style={{ width: '96.4%' }} />
                </div>
                <div className="text-[10px] text-[#849495]">
                  Caliber: .375 H&H Magnum · Triangulated at Grid SEC-02
                </div>
              </div>

              {/* Threat 2 */}
              <div className="p-2.5 bg-[#101419] border border-[#ffaa00]/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">4X4 DIESEL ENGINE RPM</span>
                  <span className="text-[#ffaa00] font-bold">88.5% MATCH</span>
                </div>
                <div className="w-full bg-[#1c2025] h-1.5 overflow-hidden mb-1.5">
                  <div className="bg-[#ffaa00] h-full" style={{ width: '88.5%' }} />
                </div>
                <div className="text-[10px] text-[#849495]">
                  Low harmonic idle · Vectoring west along boundary
                </div>
              </div>

              {/* Threat 3 */}
              <div className="p-2.5 bg-[#101419] border border-[#00ff88]/40">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-white">ELEPHANT INFRASOUND RUMBLE</span>
                  <span className="text-[#00ff88] font-bold">98.1% MATCH</span>
                </div>
                <div className="w-full bg-[#1c2025] h-1.5 overflow-hidden mb-1.5">
                  <div className="bg-[#00ff88] h-full" style={{ width: '98.1%' }} />
                </div>
                <div className="text-[10px] text-[#849495]">
                  18.5 Hz sub-audible social communication (Gaia Pod)
                </div>
              </div>

              {/* Threat 4 */}
              <div className="p-2.5 bg-[#101419] border border-[#213247]">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[#849495]">CHAINSAW / DEFORESTATION</span>
                  <span className="text-[#506882]">6.2% NOISE</span>
                </div>
                <div className="w-full bg-[#1c2025] h-1.5 overflow-hidden mb-1.5">
                  <div className="bg-[#506882] h-full" style={{ width: '6.2%' }} />
                </div>
                <div className="text-[10px] text-[#506882]">Negative detection</div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#213247] font-mono text-[11px] text-[#506882]">
            Hydrophone and seismic arrays update continuously at 20 ms resolution.
          </div>
        </div>
      </div>

      {/* Optical Camera Trap Intel & Environmental Telemetry Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Camera Trap Recon Stream (8 cols) */}
        <div className="lg:col-span-8 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs font-bold text-white tracking-wider">
              // CAMERA TRAP OPTICAL AI AUDIT FEED
            </span>
            <span className="font-mono text-[10px] text-[#506882]">4 WIRELESS NODES</span>
          </div>

          {/* Large Preview of Selected Trap */}
          <div className="relative aspect-video w-full bg-[#06090e] border border-[#213247] overflow-hidden chamfer-4 mb-3">
            <img
              src={selectedTrap.imageUrl}
              alt={selectedTrap.classification}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover brightness-90 contrast-110"
            />
            {/* HUD Bounding Box Graphic Overlay */}
            <div className="absolute inset-0 p-4 pointer-events-none flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] font-mono bg-black/75 px-3 py-1 border border-[#00f3ff]/40">
                <span className="text-[#00f3ff] font-bold">{selectedTrap.cameraCode}</span>
                <span className="text-white">{selectedTrap.sector}</span>
                <span className="text-[#506882]">{selectedTrap.timestamp}</span>
              </div>

              {/* Target Bounding Box on Image */}
              <div className="self-center w-48 h-36 border-2 border-[#00f3ff] relative">
                <div className="absolute -top-5 left-0 bg-[#00f3ff] text-[#06090e] font-mono font-bold text-[10px] px-1.5 py-0.5">
                  {selectedTrap.classification.split(':')[0]} [{(selectedTrap.confidence * 100).toFixed(1)}%]
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 text-[#00f3ff]">
                  +
                </div>
              </div>

              <div className="bg-black/75 p-2 border border-[#213247] text-xs font-mono text-[#b9cacb]">
                <strong className="text-white">AI DIAGNOSIS: </strong> {selectedTrap.details}
              </div>
            </div>

            <div className="absolute inset-0 pointer-events-none crt-scanlines opacity-30" />
          </div>

          {/* Thumbnails of Trap captures */}
          <div className="grid grid-cols-4 gap-2">
            {cameraTraps.map((trap) => {
              const isSelected = trap.id === selectedTrap.id;
              return (
                <button
                  key={trap.id}
                  onClick={() => {
                    playTargetLock();
                    setSelectedTrap(trap);
                  }}
                  className={`p-1.5 border text-left font-mono text-[10px] transition-colors cursor-pointer ${
                    isSelected
                      ? 'border-[#00f3ff] bg-[#00f3ff]/15 text-white'
                      : 'border-[#213247] bg-[#101419] text-[#849495] hover:text-white'
                  }`}
                >
                  <div className="truncate font-bold text-white">{trap.cameraCode}</div>
                  <div className="truncate text-[#506882]">{trap.sector.split(' ')[0]}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Environmental Telemetry Station (4 cols) */}
        <div className="lg:col-span-4 p-4 bg-[#0a0f18] border border-[#213247] chamfer-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-xs font-bold text-white tracking-wider">
                // SAVANNA ENVIRONMENTAL TELEMETRY
              </span>
              <span className="text-[10px] font-mono text-[#00f3ff]">STATION S-01</span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">AMBIENT SAVANNA TEMP</div>
                  <div className="text-xl font-bold text-white">{environmental.ambientTempC}°C</div>
                </div>
                <Sun className="w-5 h-5 text-[#ffaa00]" />
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">BAROMETRIC PRESSURE</div>
                  <div className="text-xl font-bold text-[#00f3ff]">
                    {environmental.barometricPressureHpa} <span className="text-xs text-[#849495]">hPa</span>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-[#00f3ff]" />
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">WIND AZIMUTH & SPEED</div>
                  <div className="text-lg font-bold text-white">
                    {environmental.windSpeedKts} KTS · {environmental.windDirectionDeg}° ENE
                  </div>
                </div>
                <Wind className="w-5 h-5 text-[#00ff88]" />
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">SOLAR FLUX & UV INDEX</div>
                  <div className="text-lg font-bold text-white">
                    {environmental.solarFluxWm2} W/m² · UV {environmental.uvIndex}
                  </div>
                </div>
                <Sun className="w-5 h-5 text-[#ffaa00]" />
              </div>

              <div className="p-3 bg-[#101419] border border-[#213247] flex justify-between items-center">
                <div>
                  <div className="text-[10px] text-[#506882]">MOON ILLUMINATION</div>
                  <div className="text-lg font-bold text-white">
                    {environmental.moonIlluminationPercent}% (WANING CRESCENT)
                  </div>
                </div>
                <Moon className="w-5 h-5 text-[#849495]" />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#213247] text-xs font-mono text-[#506882]">
            Thermal Inversion Risk:{' '}
            <strong className="text-[#00ff88]">{environmental.thermalInversionRisk}</strong> · FLIR visibility optimal.
          </div>
        </div>
      </div>
    </div>
  );
};
