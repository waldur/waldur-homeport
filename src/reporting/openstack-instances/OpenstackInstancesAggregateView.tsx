import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { OpenStackInstanceAggregateGroupByEnum } from 'waldur-js-client';

import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { Select } from '@waldur/form/themed-select';
import { translate } from '@waldur/i18n';
import { NoResult } from '@waldur/navigation/header/search/NoResult';
import { selectMarketplaceStatsOpenstackInstancesFilter } from '@waldur/table/generated/MarketplaceStatsOpenstackInstancesFilter';

import { AggregateChart } from './AggregateChart';
import { AggregateTable } from './AggregateTable';
import { useOpenstackInstancesAggregate } from './api';

const GROUP_BY_OPTIONS: Array<{
  value: OpenStackInstanceAggregateGroupByEnum;
  label: string;
}> = [
  { value: 'customer', label: translate('Organization') },
  { value: 'hypervisor_hostname', label: translate('Hypervisor') },
  { value: 'flavor_name', label: translate('Flavor') },
  { value: 'image_name', label: translate('Image') },
  { value: 'availability_zone', label: translate('Availability zone') },
  { value: 'service_settings', label: translate('Service settings') },
  { value: 'runtime_state', label: translate('Runtime state') },
];

export const OpenstackInstancesAggregateView: FC = () => {
  const [groupBy, setGroupBy] =
    useState<OpenStackInstanceAggregateGroupByEnum>('customer');
  const filter = useSelector(selectMarketplaceStatsOpenstackInstancesFilter);
  const { data, isLoading, error, refetch } = useOpenstackInstancesAggregate(
    groupBy,
    filter,
  );

  const selectedOption = GROUP_BY_OPTIONS.find((o) => o.value === groupBy);

  return (
    <div>
      <div className="mb-6" style={{ maxWidth: 300 }}>
        <label className="form-label">{translate('Group by')}</label>
        <Select
          value={selectedOption}
          options={GROUP_BY_OPTIONS}
          onChange={(option) => setGroupBy(option.value)}
          getOptionValue={(o) => o.value}
          getOptionLabel={(o) => o.label}
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred loadData={refetch} />
      ) : !data?.length ? (
        <NoResult
          title={translate('No data')}
          message={translate(
            'No aggregated data found. Try adjusting your filters.',
          )}
          callback={() => refetch()}
          buttonTitle={translate('Refresh')}
        />
      ) : (
        <>
          <div className="mb-6">
            <AggregateChart data={data} />
          </div>
          <AggregateTable data={data} />
        </>
      )}
    </div>
  );
};
