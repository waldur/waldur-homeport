import { useQuery } from '@tanstack/react-query';
import { openstackTenantsList } from 'waldur-js-client';

import { getAllPages } from '@/core/api';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { translate } from '@/i18n';

import { formatServiceProviders } from './utils';
import { VmOverviewFilter } from './VmOverviewFilter';

export const VmOverviewFilterContainer = (props) => {
  const {
    error,
    data: value,
    isLoading: loading,
  } = useQuery({
    queryKey: ['VmOverviewFilterContainer'],

    queryFn: async () => {
      const serviceProviders = await getAllPages((page) =>
        openstackTenantsList({ query: { page } }),
      );
      return formatServiceProviders(serviceProviders);
    },
  });
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
