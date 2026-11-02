interface SettingChoiceOption {
  value: string;
  label: string;
}

export interface SettingItemDescription {
  key: string;
  description: string;
  default?: unknown;
  type: string;
  options?: SettingChoiceOption[];
  fields?: Record<string, unknown>;
}

export interface SettingGroupDescription {
  description: string;
  items: SettingItemDescription[];
}
