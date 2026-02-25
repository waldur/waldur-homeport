// This file is auto-generated. Do not edit manually.

import { FunctionComponent } from 'react';
import { Field, getFormValues, reduxForm } from 'redux-form';
import { createSelector } from 'reselect';
import { OpenstackImagesListData } from 'waldur-js-client';

import { AwesomeCheckboxField } from '@waldur/form/AwesomeCheckboxField';
import { translate } from '@waldur/i18n';
import { RootState } from '@waldur/store/reducers';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const PureTenantImagesFilter: FunctionComponent<{}> = () => (
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

export const TenantImagesFilterFormId = 'TenantImagesFilter';

interface TenantImagesFilterFormData {
  show_duplicate_names: boolean;
}

export const TenantImagesFilter = reduxForm<TenantImagesFilterFormData, {}>({
  form: TenantImagesFilterFormId,
  destroyOnUnmount: false,
})(PureTenantImagesFilter);

export const selectTenantImagesFilter = createSelector<
  RootState,
  Partial<TenantImagesFilterFormData>,
  OpenstackImagesListData['query']
>(getFormValues(TenantImagesFilterFormId), (values) => {
  const filter: OpenstackImagesListData['query'] = {} as any;
  if (values) {
    if (values.show_duplicate_names) {
      filter.show_duplicate_names = values.show_duplicate_names;
    }
  }
  return filter;
});
