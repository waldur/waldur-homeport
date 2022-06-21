import { Resource } from '@waldur/resource/types';

export interface ResourceSummaryProps<T extends Resource = any> {
  resource: T;
  hideBackendId?: boolean;
}
