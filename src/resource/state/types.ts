import { StateVariant } from '@waldur/offering/StateIndicator';
export { ResourceState } from '@waldur/resource/types';

export interface StateIndicator {
  variant: StateVariant;
  label: string;
  active?: boolean;
  tooltip: string;
}
