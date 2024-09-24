import { useAsync } from 'react-use';
import { reduxForm } from 'redux-form';

import { getAll } from '@waldur/core/api';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';

import { formatServiceProviders } from './utils';
import { VmOverviewFilter } from './VmOverviewFilter';

const VmOverviewFilterComponent = (props) => {
  const { error, value, loading } = useAsync(async () => {
    const serviceProviders = await getAll('/openstack-tenants/');
    return formatServiceProviders(serviceProviders);
  }, []);
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return (
      <h3 className="text-center">
        {translate('Unable to load service providers.')}
      </h3>
    );
  }
  return <VmOverviewFilter {...props} serviceProviders={value} />;
};

const enhance = reduxForm({
  form: 'vmOverviewFilter',
  initialValues: { shared: true },
});

export const VmOverviewFilterContainer = enhance(VmOverviewFilterComponent);
