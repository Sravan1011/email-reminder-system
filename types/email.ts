export type Priority = 'high' | 'medium' | 'low';

export interface FollowUpStrategy {
  dates: Date[];
  expectedSuccessRate: number;
  priority: Priority;
  intervals: number[];
}

export interface FollowUpConfig {
  priority: Priority;
  responseRate?: number;
  lastResponseTime?: number;
  totalFollowUps?: number;
  successfulFollowUps?: number;
}

export interface ResponseMetrics {
  lastResponseTime: number;
  averageResponseTime: number;
  responseCount: number;
  totalResponses: number;
  responsePattern: 'quick' | 'delayed' | 'inconsistent';
}

export interface Email {
  id: number;
  subject: string;
  recipient: string;
  sentDate: string;
  priority: Priority;
  strategies: FollowUpStrategy[];
  selectedStrategy: FollowUpStrategy;
  status: 'pending' | 'completed';
  responseRate?: number;
  lastResponseTime?: number;
  totalFollowUps: number;
  successfulFollowUps: number;
  currentFollowUpIndex: number;
  completedFollowUps: Date[];
  body?: string;
  cc?: string[];
  attachments?: File[];
  draft?: boolean;
}

export interface EmailWithMetrics extends Email {
  metrics: ResponseMetrics;
  suggestedPriority?: Priority;
}