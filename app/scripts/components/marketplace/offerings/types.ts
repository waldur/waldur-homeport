export type OfferingStep = 'Describe' | 'Configure' | 'Review';

export const STEPS = ['Describe', 'Configure', 'Review'];

export interface FilterQuery {
  name?: string;
  attributes?: object;
}

export interface Option {
  key: string;
  title: string;
}

export type FieldType =
  | 'boolean'
  | 'integer'
  | 'money'
  | 'string'
  | 'text'
  | 'html_text'
  | 'select_string'
  | 'select_openstack_tenant'
  ;
export interface Choice {
  value: string;
  label: string;
}
