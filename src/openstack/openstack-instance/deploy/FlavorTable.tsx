import { useCallback, useMemo } from 'react';
import { useFormState } from 'react-final-form';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@/core/constants';
import { formatFilesize } from '@/core/utils';
import { required } from '@/core/validators';
import { translate } from '@/i18n';
import { DeployFormData } from '@/marketplace/common/types';
import { Offering } from '@/marketplace/types';
import { TENANT_TYPE } from '@/openstack/constants';
import { QuotaUsageBarChart } from '@/quotas/QuotaUsageBarChart';
import { createFetcher } from '@/table/api';
import { PAGE_SIZE_FULL } from '@/table/constants';
import Table from '@/table/Table';
import { useTable } from '@/table/useTable';

import { flavorValidator } from '../utils';

import { getOfferingLimit, useQuotasData } from './utils';

export const FlavorTable = ({
  offering,
  query,
  fieldName,
}: {
  offering: Offering;
  fieldName: string;
  query?: string;
}) => {
  const filter = useMemo(
    () =>
      offering.type === TENANT_TYPE
        ? { settings_uuid: offering.scope_uuid, name: query }
        : { tenant_uuid: offering.scope_uuid, name: query },
    [offering.scope_uuid, query],
  );

  const tableProps = useTable({
    table: 'deploy-openstack-flavors',
    fetchData: createFetcher(openstackFlavorsList),
    filter,
    staleTime: UI_STALE_TIME,
  });

  const { vcpuQuota, ramQuota } = useQuotasData(offering);

  const limit = useMemo(
    () => ({
      ram: getOfferingLimit(offering, 'ram'),
      vcpu: getOfferingLimit(offering, 'vcpu'),
    }),
    [offering],
  );

  const exceeds = useCallback(
    (value: OpenStackFlavor, formData: DeployFormData) => {
      if (limit.ram === -1 && limit.vcpu === -1) {
        return undefined;
      }
      if (!value || !limit) return undefined;
      const errors = [];

      if (
        formData?.attributes?.image &&
        flavorValidator({ image: formData.attributes?.image }, value)
      ) {
        errors.push(
          translate("The image's minimum RAM is over the flavor RAM"),
        );
      }

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

  const { values: formValues } = useFormState<DeployFormData>({
    subscription: { values: true },
  });

  const rowClass = useCallback(
    ({ row }: { row: OpenStackFlavor }) =>
      exceeds(row, formValues) ? 'text-muted' : '',
    [exceeds, formValues],
  );

  return (
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
          meta:
            vcpuQuota.limit === -1 ||
            typeof vcpuQuota.limit !== 'number' ? null : (
              <QuotaUsageBarChart
                className="capacity-bar ms-auto"
                quotas={[vcpuQuota]}
                hideLabel
              />
            ),
        },
        {
          title: translate('RAM'),
          render: ({ row }) => formatFilesize(row.ram),
          orderField: 'ram',
          meta:
            ramQuota.limit === -1 ||
            typeof ramQuota.limit !== 'number' ? null : (
              <QuotaUsageBarChart
                className="capacity-bar ms-auto"
                quotas={[ramQuota]}
                hideLabel
              />
            ),
        },
      ]}
      verboseName={translate('flavors')}
      hasActionBar={false}
      cardBordered={false}
      fullWidth
      className="mt-n5 border-bottom"
      minHeight="auto"
      hoverable
      fieldType="radio"
      fieldName={fieldName}
      validate={required}
      rowValidate={exceeds}
      rowClass={rowClass}
      initialPageSize={PAGE_SIZE_FULL * 5}
    />
  );
};
