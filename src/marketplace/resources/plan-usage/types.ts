export interface PlanUsageRow {
  customer_provider_uuid: string;
  customer_provider_name: string;

  offering_uuid: string;
  offering_name: string;

  plan_uuid: string;
  plan_name: string;

  limit: number;
  usage: number;
  remaining: number;
}

export interface PlanUsageRowProps {
  row: PlanUsageRow;
}
