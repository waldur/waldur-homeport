export interface MaintenanceFilterState {
  startDate: string; // ISO date string YYYY-MM-DD
  endDate: string; // ISO date string YYYY-MM-DD
  providerUuid?: string;
  offeringUuid?: string;
  states?: string[];
  maintenanceType?: number;
  impactLevel?: number;
}

export type MaintenanceViewTab = 'table' | 'timeline';

export type TimelineGrouping = 'provider' | 'offering';

export type TimelineColoring = 'state' | 'impact' | 'timing';

export type TimingBucket =
  'on_time' | 'late_start' | 'overrun' | 'early' | 'pending';

export interface MaintenanceTimelineItem {
  id: string;
  name: string;
  state: string;
  scheduledStart: Date;
  scheduledEnd: Date;
  actualStart?: Date | null;
  actualEnd?: Date | null;
  providerName: string;
  providerUuid: string;
  offeringNames: string[];
  maxImpactLevel: number;
  startDeltaMinutes: number | null;
  endDeltaMinutes: number | null;
  timingBucket: TimingBucket;
}
