import { Checklist, Offering } from 'waldur-js-client';

export interface Attribute {
  key: string;
  title: string;
  type: string;
  maxLength?: number;
  required?: boolean;
  description?: string;
  requiredMsg?: string;
}
export interface EditOfferingProps {
  offering: Offering;
  refetch(): void;
  attribute?: Attribute;
  disabled?: boolean;
}
export interface EditOfferingChecklistProps {
  offering: Offering;
  checklist?: Checklist;
  refetch(): void;
}

export type MediaType = 'thumbnail' | 'image';
