import type { ComponentType } from 'react';

import { Offering } from '@waldur/marketplace/types';
import { TableProps } from '@waldur/table/Table';

interface ResourceTab {
  key: string;
  title: string;
  component: ComponentType<
    {
      resource?: any;
      resourceScope?: any;
      offering?: Offering;
      title?: string;
      refetch?(): void;
      isLoading?: boolean;
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
