import { AttributesType } from '../types';

export interface ResourceReference {
  resource_uuid: string;
  resource_type: string;
}

export interface Resource extends ResourceReference {
  attributes: AttributesType;
  backend_metadata: AttributesType;
  offering_name: string;
  offering_type: string;
  state: string;
  scope?: string;
}

export interface PlanUsageRow {
  customer_provider_uuid: string;
  customer_provider_name: string;

  offering_uuid: string;
  offering_name: string;

  plan_uuid: string;
  plan_name: string;

  limit: number;
  usage: number;
}

export interface PlanUsageRowProps {
  row: PlanUsageRow;
}
