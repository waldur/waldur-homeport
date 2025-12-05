import { Limits } from '@waldur/marketplace/common/types';

export type RenewAllocationFormData = {
  extension_months: number; // Number of months
  purchase_order_reference?: string; // FIX: not available in API atm
} & Record<string /* resource-uuid */, { limits?: Limits }>;
