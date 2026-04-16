export interface AnalysisResult {
  disease: string;
  status: string;
  cause: string;
  precautions: string;
  treatment: string;
  longTermCare: string;
  confidence: string;
}

export interface HistoryItem {
  _id?: string;
  id?: string;
  image: string;
  result: AnalysisResult;
  date: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  credits: number;
}
