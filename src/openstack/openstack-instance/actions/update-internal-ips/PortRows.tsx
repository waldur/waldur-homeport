import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useMemo } from 'react';

import { BaseButton } from 'waldur-ui';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { SubnetValueContainer } from '@/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import { formatSubnet } from '@/openstack/openstack-instance/utils';

import { CustomIpFieldFinal } from './CustomIpFieldFinal';

export const PortRows = ({ fields, subnets, hasCustomIp }: any) => {
  const availableSubnetsFilter = useCallback(
    (item) => {
      for (let i = 0; i < fields.length; i++) {
        const port = fields.value[i];
        if (port?.subnet?.uuid === item.uuid) return false;
      }
      return true;
    },
    [fields],
  );

  const freeSubnets = useMemo(
    () =>
      subnets.filter(availableSubnetsFilter).map((subnet) => ({
        ...subnet,
        label: formatSubnet(subnet),
      })),
    [subnets, availableSubnetsFilter],
  );

  const addRow = useCallback(() => {
    if (freeSubnets.length > 0) {
      fields.push({ subnet: freeSubnets[0] });
    }
  }, [fields, freeSubnets]);

  return (
    <div className="mb-4">
      <div className="border-rows mb-3">
        {fields.map((port, index) => (
          <Fragment key={index}>
            <div className="flex flex-wrap gap-3">
              <div className="w-full sm:flex-1 sm:min-w-0">
                <SelectGroup
                  name={`${port}.subnet`}
                  label={translate('Subnet')}
                  validate={required}
                  required={true}
                  options={freeSubnets}
                  placeholder={translate('Select subnet')}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.name}
                  spaceless
                  components={{
                    ValueContainer: SubnetValueContainer,
                  }}
                />
              </div>
              <div className="flex-none self-end">
                <BaseButton
                  onClick={() => fields.remove(index)}
                  iconNode={<TrashIcon weight="bold" />}
                  variant="text-danger"
                  tooltip={translate('Remove')}
                  size="lg"
                />
              </div>
              {hasCustomIp && (
                <div className="w-full">
                  <div className="sm:w-6/12">
                    <CustomIpFieldFinal
                      parentName={port}
                      data={fields.value[index]}
                      hasAutoOption
                    />
                  </div>
                </div>
              )}
            </div>
          </Fragment>
        ))}
      </div>
      <BaseButton
        onClick={addRow}
        disabled={freeSubnets.length === 0}
        tooltip={
          freeSubnets.length === 0
            ? translate('No more subnets available')
            : undefined
        }
        label={translate('Add subnet')}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="text-primary"
        size="lg"
      />
    </div>
  );
};
