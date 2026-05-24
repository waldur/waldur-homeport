import { FC, useState, useMemo } from 'react';
import { Form } from 'react-bootstrap';
import { Form as RffForm, useFormState } from 'react-final-form';
import { OpenStackInstanceAggregateGroupByEnum } from 'waldur-js-client';

import { LoadingErred } from '@/core/LoadingErred';
import { LoadingSpinner } from '@/core/LoadingSpinner';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { NoResult } from '@/navigation/header/search/NoResult';
import {
  selectMarketplaceStatsOpenstackInstancesFilter,
  MarketplaceStatsOpenstackInstancesFilterFormId,
} from '@/table/generated/MarketplaceStatsOpenstackInstancesFilter';

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

const OpenstackInstancesAggregateViewTable: FC<any> = () => {
  const [groupBy, setGroupBy] =
    useState<OpenStackInstanceAggregateGroupByEnum>('customer');
  const { values } = useFormState();

  const filter = useMemo(
    () => selectMarketplaceStatsOpenstackInstancesFilter(values),
    [values],
  );

  const { data, isLoading, error, refetch } = useOpenstackInstancesAggregate(
    groupBy,
    filter,
  );

  const selectedOption = GROUP_BY_OPTIONS.find((o) => o.value === groupBy);

  return (
    <div>
      <div className="mb-6" style={{ maxWidth: 300 }}>
        <Form.Label>{translate('Group by')}</Form.Label>
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

export const OpenstackInstancesAggregateView: FC<any> = (props) => (
  <RffForm
    id={MarketplaceStatsOpenstackInstancesFilterFormId}
    onSubmit={() => {}}
    subscription={{
      values: true,
    }}
  >
    {() => <OpenstackInstancesAggregateViewTable {...props} />}
  </RffForm>
);
