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
}
