import { PlusCircleIcon, TrashIcon } from '@phosphor-icons/react';
import { Fragment, useCallback, useMemo } from 'react';
import { Col, Row } from 'react-bootstrap';

import { required } from '@/core/validators';
import { SelectGroup } from '@/form';
import { translate } from '@/i18n';
import { SubnetValueContainer } from '@/openstack/openstack-instance/deploy/FormNetworkSecurityStep';
import { formatSubnet } from '@/openstack/openstack-instance/utils';
import { ActionButton } from '@/table/ActionButton';

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
    <div className="mb-5">
      <div className="border-rows mb-4">
        {fields.map((port, index) => (
          <Fragment key={index}>
            <Row className="g-4">
              <Col sm>
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
              </Col>
              <Col xs="auto" className="align-self-end">
                <ActionButton
                  action={() => fields.remove(index)}
                  iconNode={<TrashIcon weight="bold" />}
                  variant="text-danger"
                  tooltip={translate('Remove')}
                />
              </Col>
              {hasCustomIp && (
                <Col xs={12}>
                  <Col sm={6}>
                    <CustomIpFieldFinal
                      parentName={port}
                      data={fields.value[index]}
                      hasAutoOption
                    />
                  </Col>
                </Col>
              )}
            </Row>
          </Fragment>
        ))}
      </div>
      <ActionButton
        action={addRow}
        disabled={freeSubnets.length === 0}
        tooltip={
          freeSubnets.length === 0
            ? translate('No more subnets available')
            : undefined
        }
        title={translate('Add subnet')}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="text-primary"
      />
    </div>
  );
};
