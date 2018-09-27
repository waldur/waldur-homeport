import { ReactNode } from 'react';

export type OfferingStep = 'Describe' | 'Configure' | 'Review';

export const STEPS = ['Describe', 'Configure', 'Review'];

export interface FilterQuery {
  name?: string;
  attributes?: object;
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

export type OfferingStateTransition =
  'activate' | 'pause' | 'archive' | undefined;

export interface OfferingAction<OfferingActionValue> {
  value: OfferingActionValue;
  label: string;
  handler?(value: ReactNode): void;
}
