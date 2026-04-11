export interface Choice {
  value: string;
  label: string;
  description?: string;
}

export interface OfferingComponentUsage {
  component_type: string;
  component_name: string;
  measured_unit: string;
  billing_type: string;
  limit_period: string;
  total_allocated: number;
  total_consumed: number;
  usage_percent?: number;
  billing_period: string;
  offering_uuid: string;
  offering_name: string;
  offering_type: string;
  service_provider_name: string;
  service_provider_uuid: string;
  category_uuid: string;
  category_title: string;
}
