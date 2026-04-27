import { AtLeast } from '@/core/types';
import { FilterItem } from '@/table/types';

export interface MarketplaceFilterItem extends AtLeast<
  FilterItem,
  'name' | 'value'
> {
  getValueLabel?(value): any;
}

export interface FilterState {
  filtersStorage?: MarketplaceFilterItem[];
}
