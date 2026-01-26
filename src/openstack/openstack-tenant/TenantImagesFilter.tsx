import React from 'react';
import { Field, reduxForm } from 'redux-form';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

export const TENANT_IMAGES_FILTER_FORM_ID = 'openstackTenantImagesFilter';

const PureTenantImagesFilter = () => (
  <TableFilterItem
    title={translate('Show duplicate names')}
    name="show_duplicate_names"
    badgeValue={(value) => (value ? translate('Yes') : translate('No'))}
    ellipsis={false}
  >
    <Field
      name="show_duplicate_names"
      component={(fieldProps) => (
        <AwesomeCheckbox
          label={translate('Show duplicate names')}
          value={fieldProps.input.value}
          onChange={(value) => fieldProps.input.onChange(value)}
        />
      )}
    />
  </TableFilterItem>
);

export const TenantImagesFilter = reduxForm({
  form: TENANT_IMAGES_FILTER_FORM_ID,
  destroyOnUnmount: false,
})(PureTenantImagesFilter) as React.ComponentType;
