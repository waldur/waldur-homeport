// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field } from 'react-final-form';
import { OpenstackImagesListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@/form/AwesomeCheckboxField';
import { translate } from '@/i18n';
import { TableFilterItem } from '@/table/TableFilterItem';

const PureOpenstackImagesFilter: FunctionComponent<{}> = () => (
  <TableFilterItem
    title={translate('Show duplicate names')}
    name="show_duplicate_names"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
    ellipsis={false}
  >
    <Field
      name="show_duplicate_names"
      component={AwesomeCheckboxField}
      label={translate('Show duplicate names')}
      parse={(v) => v || undefined}
    />
  </TableFilterItem>
);

export const OpenstackImagesFilterFormId = 'OpenstackImagesFilter';

export interface OpenstackImagesFilterFormData {
  show_duplicate_names: boolean;
}

export const OpenstackImagesFilter = PureOpenstackImagesFilter;

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
