import { OfferingCost } from 'waldur-js-client';

export interface OfferingCostsStats {
  offerings: OfferingCost[];
}

export interface OfferingCostsSummary {
  totalCost: number;
  offeringCount: number;
  averageCost: number;
}
