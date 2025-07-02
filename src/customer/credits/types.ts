import { Customer, NestedProviderOffering, Project } from 'waldur-js-client';

export interface BaseCreditFormData {
  expected_consumption: string;
  value: string;
  end_date: string;
  minimal_consumption_logic: 'fixed' | 'linear';
}

export interface CustomerCreditFormData extends BaseCreditFormData {
  customer: Pick<Customer, 'uuid' | 'name' | 'url'>;
  offerings: Array<NestedProviderOffering>;
}

export interface ProjectCreditFormData extends BaseCreditFormData {
  project: Project;
}
