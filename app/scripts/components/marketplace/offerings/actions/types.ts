import { ReactNode } from 'react';

export type OfferingStateTransition =
  'activate' | 'pause' | 'archive' | undefined;

export interface OfferingAction<OfferingActionValue> {
  value: OfferingActionValue;
  label: string;
  handler?(value: ReactNode): void;
}
