export interface CopilotSource {
  title: string;
  doi_or_url: string;
  confidence: string;
}

export interface CopilotMetrics {
  [key: string]: string | number | string[];
}

export interface CopilotResponse {
  summary: string;
  confidence_score: number;
  metrics?: CopilotMetrics;
  sources: CopilotSource[];
  suggested_actions?: string[];
}

export interface CopilotMessage {
  sender: "system" | "user" | "agent";
  text: string;
  confidence?: number;
  sources?: CopilotSource[];
  timestamp?: number;
}

export interface StationInfo {
  name: string;
  municipality: string;
  elevation_m: number;
  pm25: string;
  turbidity: string;
  do: string;
  status: string;
  color?: string;
}

export interface RainCellInfo {
  intensity: string;
  dbz: string;
  rate: string;
  top_height?: string;
  probability: string;
  alerta?: string;
}

export interface LayerState {
  rain: boolean;
  terrain: boolean;
  buildings: boolean;
  air: boolean;
  water: boolean;
  forest: boolean;
}
