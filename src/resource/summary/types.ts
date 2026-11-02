import { ComponentType } from 'react';

import { Resource } from '@/resource/types';

export interface ResourceSummaryProps<T extends Resource = any> {
  resource: T;
  hideBackendId?: boolean;
  /** Rendered in the resource details card (`ResourceMetadataCard`) rather
   * than an expandable row; summaries use it to leave out row-only parts. */
  formTableItem?: boolean;
}

export interface ResourceSummaryConfiguration {
  type: string;
  component: ComponentType<ResourceSummaryProps>;
  standalone?: boolean;
}
