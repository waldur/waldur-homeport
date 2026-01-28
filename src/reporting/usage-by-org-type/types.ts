export interface OrgTypeAggregation {
  organization_type: string;
  total_usage: number;
  total_resources: number;
  components: Record<string, number>;
}

export interface UsageByOrgTypeSummary {
  totalOrgTypes: number;
  totalResources: number;
  totalUsage: number;
}
