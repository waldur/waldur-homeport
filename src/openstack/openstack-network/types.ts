import { BaseResource } from '@waldur/resource/types';

export interface Network extends BaseResource {
  type: string;
  segmentation_id?: number;
  is_external: boolean;
}
