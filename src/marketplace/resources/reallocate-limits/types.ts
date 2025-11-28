import { type ResourceReallocateTargetRequest } from 'waldur-js-client';

import { Limits } from '@waldur/marketplace/common/types';

// resource name to be shown in the review and confirm tab
interface ReallocateTarget extends ResourceReallocateTargetRequest {
  resource_name?: string;
}

export interface ReallocateFormData {
  limits: Limits;
  targets: ReallocateTarget[];
}

export interface ResourceSelection {
  uuid: string;
  name: string;
  offering_name: string;
  customer_name: string;
  project_name: string;
  limits: Limits;
  current_usages: Limits;
}
