
export interface ProductInput {
  name: string;
  description: string;
  targetAudience: string;
  keyBenefits: string[];
}

export interface JTBDAnalysis {
  functionalJob: string;
  emotionalJob: string;
  socialJob: string;
  mainInsight: string;
}

export interface ContentStrategy {
  threeSecondHook: string;
  caption: string;
  videoPrompt: string;
  visualKeywords: string[];
}

export interface AnalysisResult {
  jtbd: JTBDAnalysis;
  strategy: ContentStrategy;
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  GENERATING_VIDEO = 'GENERATING_VIDEO',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
