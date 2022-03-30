export interface MenuItemType {
  key?: string;
  icon: string;
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

export interface SidebarSection {
  label: string;
  items: MenuItemType[];
}

export interface SidebarMenuProps {
  sections: SidebarSection[];
}
