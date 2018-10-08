import { Resource } from '@waldur/resource/types';

export interface Network extends Resource {
  type: string;
  segmentation_id?: number;
  is_external: boolean;
}
