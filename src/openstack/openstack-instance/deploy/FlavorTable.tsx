import { useCallback, useMemo } from 'react';
import { OpenStackFlavor, openstackFlavorsList } from 'waldur-js-client';

import { UI_STALE_TIME } from '@waldur/core/constants';
import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { translate } from '@waldur/i18n';
import { DeployFormData } from '@waldur/marketplace/common/types';
import { Offering } from '@waldur/marketplace/types';
import { TENANT_TYPE } from '@waldur/openstack/constants';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { createFetcher } from '@waldur/table/api';
import { PAGE_SIZE_FULL } from '@waldur/table/constants';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

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
        formData.attributes?.image &&
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
      validate={[required, exceeds]}
      initialPageSize={PAGE_SIZE_FULL * 5}
    />
  );
};
