import { PlusCircleIcon, QuestionIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, Col, Form, FormLabel, Row } from 'react-bootstrap';
import { components } from 'react-select';
import { useToggle } from 'react-use';
import { Field, FieldArray } from 'redux-form';
import { OpenStackSubNetAllocationPool } from 'waldur-js-client';

import { AwesomeCheckbox } from '@waldur/core/AwesomeCheckbox';
import { Tip } from '@waldur/core/Tooltip';
import { required } from '@waldur/core/validators';
import { FieldError, FormGroup, SelectField, StringField } from '@waldur/form';
import { Select } from '@waldur/form/themed-select';
import { VStepperFormStepCard } from '@waldur/form/VStepperFormStep';
import { translate } from '@waldur/i18n';
import { FormStepProps } from '@waldur/marketplace/deploy/types';
import { loadFloatingIps, loadSubnets } from '@waldur/openstack/api';
import {
  getIPsInRange,
  isIPInRange,
} from '@waldur/openstack/openstack-network/utils';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';
import { renderFieldOrDash } from '@waldur/table/utils';

import { getDefaultFloatingIps, formatSubnet } from '../utils';

import { FormSecurityGroupsField } from './FormSecurityGroupsField';
import { FormSSHPublicKeysField } from './FormSSHPublicKeysField';

export const CustomIpField = ({
  parentName,
  data,
  autoFocus = false,
  hasAutoOption = false,
}) => {
  const options = useMemo(() => {
    const ipRanges = data?.subnet
      ?.allocation_pools as OpenStackSubNetAllocationPool[];
    const customIps = ipRanges?.length
      ? ipRanges.flatMap(({ start, end }) => getIPsInRange(start, end))
      : [];
    const opts = customIps
      .map((ip) => ({ label: ip, value: ip }))
      .concat({
        value: 'other',
        label: translate('Other (manual input)'),
      });
    if (hasAutoOption) {
      return [{ label: translate('Automatic'), value: false }].concat(opts);
    }
    return opts;
  }, [data?.subnet?.allocation_pools]);

  const isOutsideAllocationPool = useCallback(
    (value) =>
      options.some((opt) => opt.value === value)
        ? null
        : translate('IPs is outside the allocation pool'),
    [options],
  );

  const isOutsideRange = useCallback(
    (value) =>
      !value || isIPInRange(value, data?.subnet?.cidr)
        ? null
        : translate('IP is outside of subnet CIDR'),
    [data?.subnet?.cidr],
  );

  const [selected, setSelected] = useState<{ label; value }>(() =>
    data?.fixed_ip ? { label: data?.fixed_ip, value: data?.fixed_ip } : null,
  );

  return (
    <Field
      name={`${parentName}.fixed_ip`}
      component={(fieldProps) => (
        <div>
          <FormLabel>{translate('Custom IP')}</FormLabel>
          <Select
            placeholder={translate('e.g.') + ' 192.168.42.16'}
            options={options}
            value={options.find((opt) => opt.value === selected?.value)}
            onChange={(opt) => {
              setSelected(opt);
              fieldProps.input.onChange(opt.value === 'other' ? '' : opt.value);
            }}
          />

          <StringField
            placeholder={translate('Enter custom IP')}
            value={fieldProps.input?.value}
            onChange={fieldProps.input.onChange}
            hidden={selected?.value !== 'other'}
            className="mt-4"
            autoFocus={autoFocus}
          />

          {fieldProps.meta.dirty &&
            (fieldProps.meta.error ? (
              <FieldError error={fieldProps.meta.error} />
            ) : fieldProps.meta.warning ? (
              <Form.Text className="text-warning" as="div">
                {fieldProps.meta.warning}
              </Form.Text>
            ) : null)}
        </div>
      )}
      validate={
        selected?.value === false ? undefined : [required, isOutsideRange]
      }
      warn={selected?.value === false ? undefined : [isOutsideAllocationPool]}
      required={true}
    />
  );
};

export const SubnetValueContainer = (props) => {
  if (!props.hasValue) {
    return (
      <components.ValueContainer {...props}>
        {props.children}
      </components.ValueContainer>
    );
  }

  const subnet = props.getValue()[0] || {};

  return (
    <components.ValueContainer {...props} className="pe-0">
      <div className="d-flex align-items-center justify-content-between ellipsis">
        {props.children}
        <Tip
          id={`tip-subnet-${subnet.uuid}`}
          autoWidth
          label={
            <div className="text-start">
              {translate('CIDR')}: {renderFieldOrDash(subnet.cidr)}
              <br />
              {translate('Allocation pool')}:{' '}
              {subnet.allocation_pools?.length ? (
                <>
                  {' '}
                  {subnet.allocation_pools[0].start}
                  {' - '}
                  {subnet.allocation_pools[0].end}
                </>
              ) : (
                DASH_ESCAPE_CODE
              )}
              <br />
              {translate('Gateway IP')}: {renderFieldOrDash(subnet.gateway_ip)}
            </div>
          }
        >
          <span className="svg-icon svg-icon-2">
            <QuestionIcon weight="bold" />
          </span>
        </Tip>
      </div>
    </components.ValueContainer>
  );
};

const renderNetworkRows = ({
  fields,
  subnets,
  floatingIps,
  hasCustomIp,
}: any) => {
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

  useEffect(() => {
    if (!hasCustomIp) {
      fields.forEach((_, index) => {
        delete fields.get(index).fixed_ip;
      });
    }
  }, [hasCustomIp]);

  return (
    <div className="mb-5">
      <div className="border-rows mb-4">
        {fields.map((network, index) => (
          <Fragment key={index}>
            <Row className="g-4">
              <Col sm={6}>
                <Field
                  name={`${network}.subnet`}
                  label={translate('Subnet')}
                  component={FormGroup}
                  options={freeSubnets}
                  validate={[required]}
                  required={true}
                  placeholder={translate('Select subnet')}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.name}
                  noUpdateOnBlur
                  spaceless
                  components={{ ValueContainer: SubnetValueContainer }}
                >
                  <SelectField />
                </Field>
              </Col>
              <Col sm>
                <Field
                  name={`${network}.floatingIp`}
                  label={translate('Floating IP')}
                  component={FormGroup}
                  options={freeFloatingIps}
                  validate={[required]}
                  required={true}
                  isDisabled={!fields.get(index)?.subnet?.uuid}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.address}
                  noUpdateOnBlur
                  spaceless
                >
                  <SelectField />
                </Field>
              </Col>
              <Col xs="auto" className="align-self-end">
                <Button
                  variant="active-light-danger"
                  className="btn-icon btn-icon-danger"
                  onClick={() => fields.remove(index)}
                >
                  <span className="svg-icon svg-icon-1x">
                    <TrashIcon weight="bold" />
                  </span>
                </Button>
              </Col>
              {hasCustomIp && (
                <Col xs={12}>
                  <Col sm={6}>
                    <CustomIpField
                      parentName={network}
                      data={fields.get(index)}
                      hasAutoOption
                    />
                  </Col>
                </Col>
              )}
            </Row>
          </Fragment>
        ))}
      </div>
      <Button
        variant="active-secondary"
        className="btn-text-primary btn-icon-primary"
        disabled={freeSubnets.length === 0}
        onClick={addRow}
      >
        <span className="svg-icon svg-icon-2">
          <PlusCircleIcon weight="bold" />
        </span>{' '}
        {translate('Add subnet')}
      </Button>
    </div>
  );
};

export const FormNetworkSecurityStep = (props: FormStepProps) => {
  const [customIpEnabled, setCustomIpEnabled] = useToggle(false);

  const { data, isLoading } = useQuery({
    queryKey: ['network-step', props.offering.scope_uuid],

    queryFn: () => {
      return Promise.all([
        loadSubnets({ tenant_uuid: props.offering.scope_uuid }),
        loadFloatingIps({
          tenant_uuid: props.offering.scope_uuid,
          free: true,
          field: ['url', 'address'],
        }),
      ]).then(([subnets, floatingIps]) => ({
        subnets,
        floatingIps,
      }));
    },

    staleTime: 3 * 60 * 1000,
  });

  return (
    <VStepperFormStepCard
      title={translate('Network and security')}
      id={props.id}
      loading={isLoading}
      disabled={props.disabled}
      disabledTooltip={props.disabledTooltip}
    >
      <div className="mb-5 mt-n4 border-bottom">
        <FormSSHPublicKeysField
          change={props.change}
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="fs-6 text-gray-700"
        />
      </div>

      <Form.Group className="mb-2 border-bottom">
        <div className="d-flex justify-content-between mb-5">
          <Form.Label className="fs-6 fw-bolder mb-0">
            {translate('Network')}
          </Form.Label>
          <AwesomeCheckbox
            value={customIpEnabled}
            onChange={setCustomIpEnabled}
            size="sm"
            className="align-self-center"
            label={translate('Custom IP configuration')}
          />
        </div>
        <FieldArray
          name="attributes.networks"
          component={renderNetworkRows}
          hasCustomIp={customIpEnabled}
          {...data}
        />
      </Form.Group>
      <FormSecurityGroupsField
        offering={props.offering}
        change={props.change}
        cardBordered={false}
        minHeight="auto"
        headerClassName="mx-0"
        titleClassName="fs-6 text-gray-700"
      />
    </VStepperFormStepCard>
  );
};
