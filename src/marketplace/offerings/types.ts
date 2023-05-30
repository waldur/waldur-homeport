export type OfferingStep =
  | 'Overview'
  | 'Description'
  | 'Management'
  | 'Accounting'
  | 'Review';

export const STEPS: OfferingStep[] = [
  'Overview',
  'Description',
  'Management',
  'Accounting',
  'Review',
];

export interface Choice {
  value: string;
  label: string;
}
