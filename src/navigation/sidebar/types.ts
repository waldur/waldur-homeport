export interface MenuItemType {
  key?: string;
  label: string;
  state?: string;
  params?: Record<string, string>;
  index?: number;
  countFieldKey?: string;
  feature?: string;
  parent?: string;
  orderByLabel?: boolean;
  children?: MenuItemType[];
  action?(): void;
}
