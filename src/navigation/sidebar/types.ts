export interface MenuItemType {
  key: string;
  icon: string;
  label: string;
  state?: string;
  params?: Record<string, string>;
  index?: number;
  countFieldKey?: string;
  children?: MenuItemType[];
  action?(): void;
}

export interface SidebarProps {
  items: MenuItemType[];
  counters?: Record<string, number>;
}
