import type { ComponentType } from 'react';

import { FeaturesEnum } from '@waldur/FeaturesEnums';
import { Offering } from '@waldur/marketplace/types';
import { TableProps } from '@waldur/table/types';

interface ResourceTabProps extends Partial<TableProps> {
  resource?: any;
  resourceScope?: any;
  offering?: Offering;
  title?: string;
  refetch?(): void;
  isLoading?: boolean;
}

interface ResourceTab {
  key: string;
  title: string;
  component: ComponentType<ResourceTabProps>;
  feature?: FeaturesEnum;
  visible?: boolean;
}

export interface ResourceParentTab {
  title: string;
  key: string;
  defaultKey?: string;
  component?: ComponentType<ResourceTabProps>;
  children: ResourceTab[];
  feature?: FeaturesEnum;
}

export interface ResourceTabsConfiguration {
  type: string;
  tabs: ResourceParentTab[];
}
