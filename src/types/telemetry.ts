export type StatusType = 'STABLE' | 'WARNING' | 'CRITICAL' | 'CAUTION';

export type OpticalMode = 'SYNTHETIC_SAR' | 'THERMAL_FLIR' | 'NIGHT_VISION' | 'OPTICAL';

export interface Specimen {
  id: string;
  code: string;
  name: string;
  scientificName: string;
  species: string;
  status: StatusType;
  coordinates: { lat: number; lng: number };
  altitudeM: number;
  speedKmh: number;
  headingDeg: number;
  heartRateBpm: number;
  bodyTempC: number;
  spO2Percent: number;
  respirationRate: number;
  transponderBattery: number;
  signalDbm: number;
  behavior: 'GRAZING' | 'TRANSIT' | 'SPRINT' | 'RESTING' | 'DISTRESSED';
  weightKg: number;
  sector: string;
  lastPingSec: number;
  geofenceState: 'INSIDE_SECURE' | 'BUFFER_ZONE' | 'BREACH';
  collarTagId: string;
  notes: string;
  historyCoords: { lat: number; lng: number }[];
}

export interface DroneUnit {
  id: string;
  callsign: string;
  model: string;
  status: 'PATROL' | 'INTERCEPT' | 'RTB' | 'HOVER';
  coordinates: { lat: number; lng: number };
  altitudeM: number;
  speedKmh: number;
  headingDeg: number;
  batteryPercent: number;
  opticalMode: OpticalMode;
  targetLockedId?: string;
  payload: string;
  flightTimeMinutes: number;
  signalLatencyMs: number;
}

export interface RangerUnit {
  id: string;
  callsign: string;
  name: string;
  teamSize: number;
  vehicle: string;
  coordinates: { lat: number; lng: number };
  status: 'ON_PATROL' | 'DISPATCHED' | 'ENGAGED' | 'STANDBY';
  assignedIncidentId?: string;
  etaMinutes?: number;
  fuelPercent: number;
  radioFrequencyMhz: number;
}

export interface IncidentAlert {
  id: string;
  title: string;
  sector: string;
  timestamp: string;
  severity: StatusType;
  category: 'GUNSHOT' | 'FENCE_BREACH' | 'THERMAL_ANOMALY' | 'UNAUTHORIZED_VEHICLE' | 'FAUNA_DISTRESS';
  coordinates: { lat: number; lng: number };
  confidencePercent: number;
  description: string;
  assignedUnitId?: string;
  resolved: boolean;
  acousticDecibels?: number;
}

export interface AcousticNode {
  id: string;
  code: string;
  sector: string;
  coordinates: { lat: number; lng: number };
  status: 'NOMINAL' | 'ALERT' | 'OFFLINE';
  lastDecibel: number;
  dominantFrequencyHz: number;
  batteryPercent: number;
  detectedEvent?: string;
}

export interface CameraTrapCapture {
  id: string;
  cameraCode: string;
  sector: string;
  timestamp: string;
  classification: string;
  confidence: number;
  alertLevel: StatusType;
  imageUrl: string;
  threatDetected: boolean;
  details: string;
}

export interface EnvironmentalData {
  ambientTempC: number;
  humidityPercent: number;
  barometricPressureHpa: number;
  windSpeedKts: number;
  windDirectionDeg: number;
  solarFluxWm2: number;
  uvIndex: number;
  moonIlluminationPercent: number;
  thermalInversionRisk: 'LOW' | 'MODERATE' | 'HIGH';
}
