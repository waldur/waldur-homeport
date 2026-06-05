import {
  PlusCircleIcon,
  QuestionIcon,
  TrashIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Form, FormLabel, Row } from 'react-bootstrap';
import { Field, useForm } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { components } from 'react-select';
import { useToggle } from 'react-use';
import { OpenStackSubNetAllocationPool } from 'waldur-js-client';

import { AwesomeCheckbox } from '@/core/AwesomeCheckbox';
import { UI_STALE_TIME } from '@/core/constants';
import { Tip } from '@/core/Tooltip';
import { required } from '@/core/validators';
import { FieldError, SelectGroup, StringField } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import { loadFloatingIps, loadSubnets } from '@/openstack/api';
import {
  getIPsInRange,
  isIPInRange,
} from '@/openstack/openstack-network/utils';
import { ActionButton } from '@/table/ActionButton';
import { DASH_ESCAPE_CODE } from '@/table/constants';
import { renderFieldOrDash } from '@/table/utils';
import { VStepperFormStepCard } from '@/wizard';

import { formatSubnet, getDefaultFloatingIps } from '../utils';

import { FormSecurityGroupsField } from './FormSecurityGroupsField';
import { FormSSHPublicKeysField } from './FormSSHPublicKeysField';
import { useQuotasData } from './utils';

const CustomIpField = ({
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
      validate={(value) => {
        if (selected?.value === false) return undefined;
        const req = required(value);
        if (req) return req;
        return isOutsideRange(value);
      }}
    >
      {({ input, meta }) => (
        <div>
          <FormLabel>{translate('Custom IP')}</FormLabel>
          <Select
            placeholder={translate('e.g. 192.168.42.16')}
            options={options}
            value={options.find((opt) => opt.value === selected?.value)}
            onChange={(opt) => {
              setSelected(opt);
              input.onChange(opt.value === 'other' ? '' : opt.value);
            }}
            onBlur={input.onBlur}
          />

          <StringField
            placeholder={translate('Enter custom IP')}
            value={input?.value}
            onChange={input.onChange}
            hidden={selected?.value !== 'other'}
            className="mt-4"
            autoFocus={autoFocus}
          />

          {(meta.touched || meta.submitFailed) &&
            (meta.error ? (
              <FieldError error={meta.error} />
            ) : isOutsideAllocationPool(input.value) ? (
              <Form.Text className="text-warning" as="div">
                {isOutsideAllocationPool(input.value)}
              </Form.Text>
            ) : null)}
        </div>
      )}
    </Field>
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
  fipQuotaExhausted,
}: any) => {
  const form = useForm();
  const availableNetworkItemsFilter = useCallback(
    (itemType) => (item) => {
      let res = true;
      if (fields.length > 0 && fields.value) {
        fields.value.forEach((net) => {
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
      ...getDefaultFloatingIps({ fipQuotaExhausted }),
      ...floatingIps.filter(availableNetworkItemsFilter('floatingIp')),
    ],

    [floatingIps, availableNetworkItemsFilter, fipQuotaExhausted],
  );

  const getDefaultValue = useCallback(
    () => ({
      subnet: freeSubnets.length !== 0 ? freeSubnets[0] : {},
      floatingIp:
        getDefaultFloatingIps().length !== 0 ? getDefaultFloatingIps()[0] : {},
    }),
    [freeSubnets],
  );

  // The "Add subnet" button uses addRow. Dedupe via `form.getState()` so any
  // accidental double-fire (stale `fields.value` snapshot, click replay)
  // can't push the same subnet twice.
  const addRow = useCallback(() => {
    if (freeSubnets.length === 0) return;
    const value = getDefaultValue();
    const current: any[] = form.getState().values?.attributes?.networks ?? [];
    if (
      value.subnet?.uuid &&
      current.some((n) => n?.subnet?.uuid === value.subnet.uuid)
    ) {
      return;
    }
    fields.push(value);
  }, [form, fields, freeSubnets, getDefaultValue]);

  useEffect(() => {
    if (!hasCustomIp && fields.value) {
      fields.value.forEach((val, index) => {
        if (val && val.fixed_ip !== undefined) {
          fields.update(index, { ...val, fixed_ip: undefined });
        }
      });
    }
  }, [hasCustomIp, fields]);

  return (
    <div className="mb-5">
      <div className="border-rows mb-4">
        {fields.map((network, index) => (
          <Fragment key={index}>
            <Row className="g-4">
              <Col sm={6}>
                <SelectGroup
                  name={`${network}.subnet`}
                  label={translate('Subnet')}
                  options={freeSubnets}
                  validate={required}
                  required={true}
                  placeholder={translate('Select subnet')}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.name}
                  noUpdateOnBlur
                  spaceless
                  components={{ ValueContainer: SubnetValueContainer }}
                />
              </Col>
              <Col sm>
                <SelectGroup
                  name={`${network}.floatingIp`}
                  label={
                    fipQuotaExhausted ? (
                      <>
                        {translate('Floating IP')}{' '}
                        <Tip
                          id={`fip-quota-tip-${index}`}
                          label={translate(
                            'Floating IP quota is exhausted; auto-assign is unavailable. Ask the administrator to raise the limit.',
                          )}
                        >
                          <WarningCircleIcon
                            weight="bold"
                            size={14}
                            className="text-warning align-text-bottom ms-1"
                          />
                        </Tip>
                      </>
                    ) : (
                      translate('Floating IP')
                    )
                  }
                  options={freeFloatingIps}
                  validate={required}
                  required={true}
                  isDisabled={!fields.value[index]?.subnet?.uuid}
                  isOptionDisabled={(option) => Boolean(option.isDisabled)}
                  getOptionValue={(option) => option.url}
                  getOptionLabel={(option) => option.address}
                  noUpdateOnBlur
                  spaceless
                />
              </Col>
              <Col xs="auto" className="align-self-end">
                <ActionButton
                  action={() => fields.remove(index)}
                  iconNode={<TrashIcon weight="bold" />}
                  variant="text-danger"
                />
              </Col>
              {hasCustomIp && (
                <Col xs={12}>
                  <Col sm={6}>
                    <CustomIpField
                      parentName={network}
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
        disabledReason={translate('No available subnets')}
        title={translate('Add subnet')}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="text-primary"
      />
    </div>
  );
};

export const FormNetworkSecurityStep = (props: FormStepProps) => {
  const [customIpEnabled, setCustomIpEnabled] = useToggle(false);
  const [portSecurityEnabled, setPortSecurityEnabled] = useToggle(true);
  const form = useForm();

  const { fipQuota } = useQuotasData(props.offering);
  const fipQuotaExhausted = Boolean(
    fipQuota &&
    typeof fipQuota.limit === 'number' &&
    fipQuota.limit !== -1 &&
    (fipQuota.usage || 0) >= fipQuota.limit,
  );

  useEffect(() => {
    form.change('attributes.port_security_enabled', portSecurityEnabled);
  }, [portSecurityEnabled, form]);

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

    staleTime: UI_STALE_TIME,
  });

  // Seed the first network row once subnet data is available.
  // Must run in the PARENT effect (not inside the FieldArray's component),
  // because react-final-form's `useField` registers its subscription in its
  // own `useEffect`; child effects fire before that, so a push from inside
  // FieldArray's render component would update form state but never reach
  // the field subscriber (it sees only the post-registration "initial"
  // notification, which `useField` deliberately skips on first render). The
  // parent's effect runs after the child's, so the subscription is in place
  // by the time we push and the row renders.
  useEffect(() => {
    if (!data?.subnets?.length) return;
    const existing = form.getState().values?.attributes?.networks;
    if (existing && existing.length > 0) return;
    form.change('attributes.networks', [
      {
        subnet: data.subnets[0],
        floatingIp: getDefaultFloatingIps({ fipQuotaExhausted })[0],
      },
    ]);
  }, [data, form, fipQuotaExhausted]);

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
          fipQuotaExhausted={fipQuotaExhausted}
          {...data}
        />
      </Form.Group>
      <div className={!portSecurityEnabled ? 'opacity-50 pe-none' : ''}>
        <FormSecurityGroupsField
          offering={props.offering}
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="fs-6 text-gray-700"
          tableActions={
            <div
              style={
                !portSecurityEnabled
                  ? { opacity: 1, pointerEvents: 'auto' as const }
                  : undefined
              }
            >
              <AwesomeCheckbox
                value={!portSecurityEnabled}
                onChange={() => setPortSecurityEnabled(!portSecurityEnabled)}
                size="sm"
                className="align-self-center fw-normal"
                label={translate('Disable port security')}
              />
            </div>
          }
        />
      </div>
      {!portSecurityEnabled && (
        <Form.Text className="text-muted">
          {translate(
            'Port security is disabled. Security groups will not be applied. Use this for VM-based routers that manage their own firewall.',
          )}
        </Form.Text>
      )}
    </VStepperFormStepCard>
  );
};
