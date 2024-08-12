import { Plus } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';
import { Button, Col, Row } from 'react-bootstrap';
import { Field, FieldArray } from 'redux-form';

import { required } from '@waldur/core/validators';
import { SelectField } from '@waldur/form';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { isExperimentalUiComponentsVisible } from '@waldur/marketplace/utils';
import { loadFloatingIps, loadSubnets } from '@waldur/openstack/api';

import { getDefaultFloatingIps, formatSubnet } from '../utils';

const renderNetworkRows = ({ fields, subnets, floatingIps }: any) => {
  const availableNetworkItemsFilter = useCallback(
    (itemType) => (item) => {
      let res = true;
      if (fields.length > 0) {
        fields.forEach((_, i) => {
          const net = fields.get(i);
          if (net && net[itemType] && net[itemType].uuid === item.uuid) {
            res = false;
          }
        });
      }
      return res;
    },
    [fields],
  );

  const freeSubnets = useMemo(
    () =>
      subnets.filter(availableNetworkItemsFilter('subnet')).map((subnet) => ({
        ...subnet,
        label: formatSubnet(subnet),
      })),
    [subnets, availableNetworkItemsFilter],
  );

  const freeFloatingIps = useMemo(
    () => [
      ...getDefaultFloatingIps(),
      ...floatingIps.filter(availableNetworkItemsFilter('floatingIp')),
    ],
    [floatingIps, availableNetworkItemsFilter],
  );

  const getDefaultValue = useCallback(
    () => ({
      subnet: freeSubnets.length !== 0 ? freeSubnets[0] : {},
      floatingIp:
        getDefaultFloatingIps().length !== 0 ? getDefaultFloatingIps()[0] : {},
    }),
    [freeSubnets],
  );

  const addRow = useCallback(() => {
    // if has free subnets
    if (freeSubnets.length > 0) {
      fields.push(getDefaultValue());
    }
  }, [fields, freeSubnets, getDefaultValue]);

  useEffect(() => {
    if (fields?.length === 0) {
      addRow();
    }
  }, []);

  return (
    <>
      {fields.map((network, index) => (
        <Row key={index} className="mb-7">
          <Col sm={6}>
            <Field
              name={`${network}.subnet`}
              component={SelectField}
              options={freeSubnets}
              validate={[required]}
              required={true}
              placeholder={translate('Select subnet')}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.name}
              noUpdateOnBlur
            />
          </Col>
          <Col sm>
            <Field
              name={`${network}.floatingIp`}
              component={SelectField}
              options={freeFloatingIps}
              validate={[required]}
              required={true}
              isDisabled={!fields.get(index)?.subnet?.uuid}
              getOptionValue={(option) => option.url}
              getOptionLabel={(option) => option.address}
              noUpdateOnBlur
            />
          </Col>
          <Col xs="auto">
            <Button
              variant="light"
              className="btn-icon btn-active-light-danger"
              onClick={() => fields.remove(index)}
            >
              <i className="fa fa-times fs-4" />
            </Button>
          </Col>
        </Row>
      ))}
      <Button
        variant="light"
        className="text-nowrap"
        disabled={freeSubnets.length === 0}
        onClick={addRow}
      >
        <span className="svg-icon svg-icon-2">
          <Plus />
        </span>
        {translate('Add')}
      </Button>
    </>
  );
};

export const FormNetworkStep = (props: FormStepProps) => {
  const showExperimentalUiComponents = isExperimentalUiComponentsVisible();

  const { data, isLoading } = useQuery(
    ['network-step', props.offering.uuid],
    () => {
      return Promise.all([
        loadSubnets(props.offering.scope_uuid),
        loadFloatingIps(props.offering.scope_uuid),
      ]).then((res) => {
        return {
          subnets: res[0],
          floatingIps: res[1],
        };
      });
    },
    { staleTime: 3 * 60 * 1000 },
  );

  return (
    <VStepperFormStepCard
      title={translate('Network')}
      step={props.step}
      id={props.id}
      completed={props.observed}
      loading={isLoading}
      disabled={props.disabled}
      required={props.required}
      actions={
        showExperimentalUiComponents ? (
          <div className="d-flex justify-content-end flex-grow-1">
            <Button variant="light" className="text-nowrap" size="sm">
              <span className="svg-icon svg-icon-2">
                <Plus />
              </span>
              {translate('New network')}
            </Button>
          </div>
        ) : null
      }
    >
      <FieldArray
        name="attributes.networks"
        component={renderNetworkRows}
        {...data}
      />
    </VStepperFormStepCard>
  );
};
