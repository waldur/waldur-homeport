import { useMemo, useState } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { translate } from '@waldur/i18n';
import { StepCard } from '@waldur/marketplace/deploy/steps/StepCard';
import { StepCardTabs } from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { useQuotasData } from './utils';

const tabs = [
  { label: translate('Shared'), value: 'shared' },
  { label: translate('Dedicated'), value: 'dedicated' },
];

export const FormFlavorStep = (props: FormStepProps) => {
  const [tab, setTab] = useState<'shared' | 'dedicated'>('shared');
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const filter = useMemo(
    () => ({ settings_uuid: props.offering.scope_uuid }),
    [props.offering],
  );

  const tableProps = useTable({
    table: 'deploy-openstacktenant-flavors',
    fetchData: createFetcher('openstacktenant-flavors'),
    filter,
    queryField: 'name',
  });

  const { vcpuQuota, ramQuota } = useQuotasData(props.offering);

  return (
    <StepCard
      title={translate('Flavor')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      actions={
        <div className="d-flex justify-content-between flex-grow-1 align-items-center">
          <div>
            {showExperimentalUiComponents && (
              <StepCardTabs tabs={tabs} tab={tab} setTab={setTab} />
            )}
          </div>
          <div className="d-flex gap-10 justify-content-end">
            <QuotaUsageBarChart
              className="capacity-bar"
              quotas={[vcpuQuota, ramQuota]}
            />
          </div>
        </div>
      }
    >
      <Table
        {...tableProps}
        columns={[
          {
            title: translate('Flavor'),
            render: ({ row }) => row.name,
          },
          {
            title: translate('vCPU'),
            render: ({ row }) => row.cores,
            orderField: 'cores',
          },
          {
            title: translate('RAM'),
            render: ({ row }) => formatFilesize(row.ram),
            orderField: 'ram',
          },
        ]}
        verboseName={translate('flavors')}
        hasActionBar={false}
        fullWidth
        hoverable
        fieldType="radio"
        fieldName="attributes.flavor"
        required
      />
    </StepCard>
  );
};
