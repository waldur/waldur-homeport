import { useCallback, useMemo, useState } from 'react';

import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import {
  StepCardTabs,
  TabSpec,
} from '@waldur/marketplace/deploy/steps/StepCardTabs';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { Table, createFetcher } from '@waldur/table';
import { useTable } from '@waldur/table/utils';

import { Flavor } from '../types';

import { getOfferingLimit, useQuotasData } from './utils';

const tabs: TabSpec[] = [
  { title: translate('Shared'), key: 'shared' },
  { title: translate('Dedicated'), key: 'dedicated' },
];

export const FormFlavorStep = (props: FormStepProps) => {
  const [tab, setTab] = useState<TabSpec>(tabs[0]);
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const filter = useMemo(
    () => ({ tenant_uuid: props.offering.scope_uuid }),
    [props.offering.scope_uuid],
  );

  const tableProps = useTable({
    table: 'deploy-openstack-flavors',
    fetchData: createFetcher('openstack-flavors'),
    filter,
    queryField: 'name',
    staleTime: 3 * 60 * 1000,
  });

  const { vcpuQuota, ramQuota } = useQuotasData(props.offering);

  const limit = useMemo(
    () => ({
      ram: getOfferingLimit(props.offering, 'ram'),
      vcpu: getOfferingLimit(props.offering, 'vcpu'),
    }),
    [props?.offering],
  );

  const exceeds = useCallback(
    (value: Flavor) => {
      if (!value || !limit) return undefined;
      const errors = [];

      if ((value.cores || 0) + (vcpuQuota.usage || 0) > limit.vcpu) {
        errors.push(translate('The CPU quota is over the limit'));
      }
      if ((value.ram || 0) + (ramQuota.usage || 0) > limit.ram) {
        errors.push(translate('The RAM quota is over the limit'));
      }
      return errors.length > 0 ? errors : undefined;
    },
    [limit, vcpuQuota.usage, ramQuota.usage],
  );

  return (
    <VStepperFormStepCard
      title={translate('Flavor')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      disabled={props.disabled}
      required={props.required}
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
        hoverable
        fieldType="radio"
        fieldName="attributes.flavor"
        validate={[required, exceeds]}
      />
    </VStepperFormStepCard>
  );
};
