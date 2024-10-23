import { Offering } from '@waldur/marketplace/types';

export interface CustomerCredit {
  uuid: string;
  url: string;
  customer: string;
  customer_name: string;
  customer_uuid: string;
  end_date: string;
  minimal_consumption: string; // number
  consumption_last_month: number;
  offerings: Pick<Offering, 'uuid' | 'name' | 'type' | 'url'>[];
  value: string; // number
  allocated_to_projects: number;
}

export interface CustomerCreditFormData {
  value: string;
  customer: string;
  offerings: string[];
  end_date: string;
  minimal_consumption: string;
}

export interface ProjectCredit {
  uuid: string;
  url: string;
  project: string;
  project_name: string;
  value: string; // number
  use_organisation_credit: boolean;
  consumption_last_month: number;
}

export interface ProjectCreditFormData {
  value: string;
  project: string;
  use_organisation_credit: string;
}
