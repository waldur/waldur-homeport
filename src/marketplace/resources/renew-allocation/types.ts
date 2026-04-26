import { Limits } from '@waldur/marketplace/common/types';

export type RenewAllocationFormData = {
  extension_months: number;
  request_comment?: string;
  attachment?: File;
} & Record<string /* resource-uuid */, { limits?: Limits }>;
