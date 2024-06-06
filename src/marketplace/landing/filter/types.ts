import { AtLeast } from '@waldur/core/types';
import { FilterItem } from '@waldur/table/types';

export interface MarketplaceFilterItem
  extends AtLeast<FilterItem, 'name' | 'value'> {
  getValueLabel?(value): any;
}

export interface FilterState {
  filtersStorage?: MarketplaceFilterItem[];
}
