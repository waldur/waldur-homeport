import { FunctionComponent } from 'react';
import { reduxForm } from 'redux-form';

import { translate } from '@waldur/i18n';
import { TableFilterItem } from '@waldur/table/TableFilterItem';

import { ProviderCustomerFilter } from './ProviderCustomerFilter';
import { ProviderProjectFilter } from './ProviderProjectFilter';

const PureProviderRobotAccountFilter: FunctionComponent<{ provider }> = ({
  provider,
}) => {
  return (
    <>
      <TableFilterItem
        title={translate('Organization')}
        name="customer"
        badgeValue={(value) => value?.name}
      >
        <ProviderCustomerFilter provider_uuid={provider.uuid} />
      </TableFilterItem>
      <TableFilterItem
        title={translate('Project')}
        name="project"
        badgeValue={(value) => value?.name}
      >
        <ProviderProjectFilter provider_uuid={provider.uuid} />
      </TableFilterItem>
    </>
  );
};

const enhance = reduxForm<{}, { provider }>({
  form: 'ProviderRobotAccountFilter',
});

export const ProviderRobotAccountFilter = enhance(
  PureProviderRobotAccountFilter,
);
