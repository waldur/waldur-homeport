import { EventGroupSection } from './eventGroupLabels';

export interface EventGroupOption {
  key: string;
  title: string;
  description?: string;
  section?: EventGroupSection;
}

export type HookType = 'email' | 'webhook';

export interface HookResponse {
  uuid: string;
  hook_type: HookType;
  is_active: boolean;
  email?: string;
  destination_url?: string;
  event_groups: string[];
}

export interface HookFormData {
  hook_type: HookType;
  is_active: boolean;
  email?: string;
  destination_url?: string;
  event_groups: Record<string, boolean>;
}
