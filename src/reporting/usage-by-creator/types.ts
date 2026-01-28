export interface AffiliationAggregation {
  affiliation: string;
  total_usage: number;
  total_cost: number;
  total_resources: number;
  components: Record<string, number>;
}

export interface UsageByAffiliationSummary {
  totalAffiliations: number;
  totalResources: number;
  totalCost: number;
}
