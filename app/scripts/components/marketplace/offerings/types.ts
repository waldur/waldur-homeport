export type OfferingStep = 'Describe' | 'Configure' | 'Review';

export const STEPS = ['Describe', 'Configure', 'Review'];

export interface FilterQuery {
  name?: string;
  attributes?: object;
}

export interface Choice {
  value: string;
  label: string;
}
