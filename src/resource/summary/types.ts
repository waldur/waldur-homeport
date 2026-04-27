import { ComponentType } from 'react';

import { Resource } from '@/resource/types';

export interface ResourceSummaryProps<T extends Resource = any> {
  resource: T;
  hideBackendId?: boolean;
  formTableItem?: boolean;
}

export interface ResourceSummaryConfiguration {
  type: string;
  component: ComponentType<ResourceSummaryProps>;
  standalone?: boolean;
}
