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
  | 'string'
  | 'text'
  | 'select_string'
  ;
