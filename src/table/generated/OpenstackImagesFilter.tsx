// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { OpenstackImagesListData } from 'waldur-js-client';

import { translate } from '@/i18n';
import { BooleanFilter } from '@/table';

export const OpenstackImagesFilter: FunctionComponent<{}> = () => (
  <BooleanFilter
    title={translate('Show duplicate names')}
    name="show_duplicate_names"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
    ellipsis={false}
    parse={(v) => v || undefined}
  />
);

export const OpenstackImagesFilterFormId = 'OpenstackImagesFilter';

export interface OpenstackImagesFilterFormData {
  show_duplicate_names: boolean;
}

type OpenstackImagesFilterQuery = OpenstackImagesListData['query'];

export const selectOpenstackImagesFilter = (
  values?: Partial<OpenstackImagesFilterFormData>,
): OpenstackImagesFilterQuery => {
  const filter: OpenstackImagesFilterQuery = {} as any;
  if (values) {
    if (values.show_duplicate_names) {
      filter.show_duplicate_names = values.show_duplicate_names;
    }
  }
  return filter;
};
