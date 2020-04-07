export interface MenuItemType {
  key: string;
  icon: string;
  label: string;
  state?: string;
  params?: Record<string, string>;
  index?: number;
  countFieldKey?: string;
  count?: number;
  children?: MenuItemType[];
  action?(): void;
}
