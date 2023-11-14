import type { ComponentType } from 'react';

import { TableProps } from '@waldur/table/Table';

export interface ResourceTab {
  key: string;
  title: string;
  component: ComponentType<
    {
      resource: any;
      marketplaceResource?: any;
      title?: string;
    } & Partial<TableProps>
  >;
  feature?: string;
  isVisible?(resource): boolean;
}

export interface ResourceParentTab {
  title: string;
  key: string;
  children: ResourceTab[];
}
