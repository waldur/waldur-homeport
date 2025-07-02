import { debounce } from 'lodash-es';
import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { OpenStackFlavor, OpenStackImage } from 'waldur-js-client';

import { formatFilesize } from '@waldur/core/utils';
import { required } from '@waldur/core/validators';
import { FilterBox } from '@waldur/form/FilterBox';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { DeployFormData } from '@waldur/marketplace/common/types';
import { orderFormSelector } from '@waldur/marketplace/deploy/selectors';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { createFetcher } from '@waldur/table/api';
import Table from '@waldur/table/Table';
import { useTable } from '@waldur/table/useTable';

import { calculateSystemVolumeSize, flavorValidator } from '../utils';

import { FormAbstractVolumeFields } from './FormAbstractVolumeFields';
import { getOfferingLimit, useQuotasData } from './utils';

export const FormHardwareConfigurationStep = (props: FormStepProps) => {
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

  const applyQuery = useCallback(
    debounce((value) => {
      tableProps.setQuery(value);
      props.change('attributes.flavor', null);
    }, 1000),
    [tableProps],
  );

  const { vcpuQuota, ramQuota } = useQuotasData(props.offering);

  const limit = useMemo(
    () => ({
      ram: getOfferingLimit(props.offering, 'ram'),
      vcpu: getOfferingLimit(props.offering, 'vcpu'),
    }),
    [props?.offering],
  );

  const exceeds = useCallback(
    (value: OpenStackFlavor, formData: DeployFormData) => {
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

  const image = useSelector((state) =>
    orderFormSelector(state, 'attributes.image'),
  ) as OpenStackImage;

  const flavor = useSelector((state) =>
    orderFormSelector(state, 'attributes.flavor'),
  ) as OpenStackFlavor;

  const minSystemVolumeSize = useMemo(() => {
    const minSize = calculateSystemVolumeSize({
      image,
      flavor,
      system_volume_size: 0,
    });
    return minSize || 0;
  }, [image, flavor]);

  return (
    <VStepperFormStepCard
      title={translate('Hardware configuration')}
      id={props.id}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
      actions={
        <div className="ms-auto">
          <FilterBox
            type="search"
            placeholder={translate('Search')}
            onChange={(e) => applyQuery(e.target.value)}
          />
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
            meta: (
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
            meta: (
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
        fieldName="attributes.flavor"
        validate={[required, exceeds]}
      />

      <div className="border-bottom my-5">
        <FormAbstractVolumeFields
          {...props}
          title={translate('System volume')}
          helpText={translate('Non-detachable and non-resizable boot disk')}
          typeField="attributes.system_volume_type"
          sizeField="attributes.system_volume_size"
          optional={false}
          minSize={minSystemVolumeSize}
        />
      </div>

      <FormAbstractVolumeFields
        {...props}
        title={translate('Data volume')}
        helpText={translate('Detachable and resizable data disk')}
        typeField="attributes.data_volume_type"
        sizeField="attributes.data_volume_size"
        optional={true}
      />
    </VStepperFormStepCard>
  );
};
