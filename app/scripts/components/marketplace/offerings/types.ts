export type OfferingStep = 'Describe' | 'Configure' | 'Review';

export const STEPS = ['Describe', 'Configure', 'Review'];

export interface FilterQuery {
  name?: string;
  attributes?: object;
}
