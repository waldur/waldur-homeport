import { PlusCircleIcon, QuestionIcon, TrashIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Col, Row } from 'react-bootstrap';
import { Field, useForm, useFormState } from 'react-final-form';
import { FieldArray } from 'react-final-form-arrays';
import { components } from 'react-select';
import { useToggle } from 'react-use';
import {
  openstackFloatingIpsList,
  OpenStackSubNetAllocationPool,
  openstackSubnetsList,
} from 'waldur-js-client';

import {
  AlertItem,
  BaseButton,
  FormField,
  FormLabel,
  FormText,
  Switch,
  Tooltip,
  WarningTip,
} from 'waldur-ui';

import { getAllPages } from '@/core/api';
import { UI_STALE_TIME } from '@/core/constants';
import { required } from '@/core/validators';
import { BaseStringField, FieldError, SelectGroup } from '@/form';
import { Select } from '@/form/select';
import { translate } from '@/i18n';
import { FormStepProps } from '@/marketplace/deploy/types';
import {
  getIPsInRange,
  isIPInRange,
} from '@/openstack/openstack-network/utils';
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
        <FormField>
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

          <BaseStringField
            aria-label={translate('Custom IP address')}
            placeholder={translate('Enter custom IP')}
            value={input?.value}
            onChange={input.onChange}
            hidden={selected?.value !== 'other'}
            containerClassName={selected?.value === 'other' ? 'mt-4' : 'hidden'}
            autoFocus={autoFocus}
          />

          {(meta.touched || meta.submitFailed) &&
            (meta.error ? (
              <FieldError error={meta.error} />
            ) : isOutsideAllocationPool(input.value) ? (
              <FormText variant="warning" as="div">
                {isOutsideAllocationPool(input.value)}
              </FormText>
            ) : null)}
        </FormField>
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
      <div className="flex items-center justify-between ellipsis">
        {props.children}
        <Tooltip
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
          <QuestionIcon weight="bold" className="svg-icon svg-icon-2" />
        </Tooltip>
      </div>
    </components.ValueContainer>
  );
};

// Why no floating IP, new or existing, can go on a subnet; undefined when one
// can. Both cases are refused by the API.
const getFloatingIpRestriction = (subnet) => {
  // A floating IP is mapped onto a fixed IPv4 address of the port, so an IPv6
  // subnet has nothing to map it to.
  if (subnet?.cidr?.includes(':')) {
    return {
      optionReason: translate(
        'Floating IPs are IPv4 only; this subnet is IPv6.',
      ),
      labelWarning: translate(
        'Floating IPs are IPv4 only, so none can be attached to an IPv6 subnet. The instance is reachable on its own IPv6 address instead.',
      ),
    };
  }
  // A floating IP is NAT on the subnet's router.
  if (subnet?.is_connected === false) {
    return {
      optionReason: translate('This subnet is not connected to a router.'),
      labelWarning: translate(
        'This subnet is not connected to a router, so no floating IP can be attached. The instance uses its own address on this network.',
      ),
    };
  }
  return undefined;
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
        // Matched by URL: floating IPs are fetched with url and address only,
        // and the skip and auto-assign choices carry no uuid either, so a
        // uuid comparison would match every fetched one and hide them all.
        fields.value.forEach((net) => {
          if (net && net[itemType] && net[itemType].url === item.url) {
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

  // A choice made on one subnet can become unavailable when the row's subnet
  // changes, and a disabled option that is already selected stays selected.
  // Fall back to skipping so the order is not refused.
  useEffect(() => {
    fields.value?.forEach((val, index) => {
      const floatingIp = val?.floatingIp;
      if (!floatingIp?.url || floatingIp.url === 'false') return;
      if (
        getFloatingIpRestriction(val.subnet) ||
        (floatingIp.url === 'true' && fipQuotaExhausted)
      ) {
        fields.update(index, {
          ...val,
          floatingIp: getDefaultFloatingIps()[0],
        });
      }
    });
  }, [fields, fipQuotaExhausted]);

  return (
    <div className="mb-5">
      <div className="border-rows mb-4">
        {fields.map((network, index) => {
          // Decided per row: a tenant can hold subnets of both families, and
          // with and without a router, and a row that can take a floating IP
          // must keep auto-assign.
          const rowRestriction = getFloatingIpRestriction(
            fields.value?.[index]?.subnet,
          );
          const rowFloatingIps = rowRestriction
            ? freeFloatingIps.map((option) =>
                option.url === 'false'
                  ? option
                  : {
                      ...option,
                      isDisabled: true,
                      disabledReason: rowRestriction.optionReason,
                    },
              )
            : freeFloatingIps;
          const labelWarning =
            rowRestriction?.labelWarning ||
            (fipQuotaExhausted
              ? translate(
                  'Floating IP quota is exhausted; auto-assign is unavailable. Ask the administrator to raise the limit.',
                )
              : undefined);
          return (
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
                      labelWarning ? (
                        <>
                          {translate('Floating IP')}{' '}
                          <WarningTip
                            label={labelWarning}
                            size={14}
                            className="align-text-bottom ms-1"
                          />
                        </>
                      ) : (
                        translate('Floating IP')
                      )
                    }
                    options={rowFloatingIps}
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
                <Col xs="auto" className="self-end">
                  <BaseButton
                    tooltip={translate('Remove')}
                    onClick={() => fields.remove(index)}
                    iconNode={<TrashIcon weight="bold" />}
                    variant="text-danger"
                    size="lg"
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
          );
        })}
      </div>
      <BaseButton
        onClick={addRow}
        disabled={freeSubnets.length === 0}
        disabledReason={translate('No available subnets')}
        label={translate('Add subnet')}
        iconNode={<PlusCircleIcon weight="bold" />}
        variant="text-primary"
        size="lg"
      />
    </div>
  );
};

export const FormNetworkSecurityStep = (props: FormStepProps) => {
  const [customIpEnabled, setCustomIpEnabled] = useToggle(false);
  const [portSecurityEnabled, setPortSecurityEnabled] = useToggle(true);
  const showSshKeyWarning = (props.offering.plugin_options as any)
    ?.show_ssh_key_loss_warning;
  const form = useForm();
  const { values } = useFormState({ subscription: { values: true } });

  // Track whether the user has explicitly flipped the toggle. Once true,
  // we stop auto-defaulting on subnet changes so a deliberate choice is not
  // clobbered when the user switches subnets.
  const userTouchedRef = useRef(false);
  const lastAppliedSubnetUuidRef = useRef<string | undefined>(undefined);

  const firstSubnet = values?.attributes?.networks?.[0]?.subnet;
  const firstSubnetUuid: string | undefined = firstSubnet?.uuid;
  const firstSubnetPortSecurity: boolean | undefined =
    firstSubnet?.port_security_enabled;

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

  // When the selected subnet changes, default the "Disable port security"
  // toggle to match the parent network's port_security_enabled flag.
  // Skip if the user has already made an explicit choice this session, and
  // skip when the backend payload omits the field (older Neutron clouds).
  useEffect(() => {
    if (!firstSubnetUuid) return;
    if (firstSubnetUuid === lastAppliedSubnetUuidRef.current) return;
    lastAppliedSubnetUuidRef.current = firstSubnetUuid;
    if (userTouchedRef.current) return;
    if (firstSubnetPortSecurity === false) {
      setPortSecurityEnabled(false);
    } else if (firstSubnetPortSecurity === true) {
      setPortSecurityEnabled(true);
    }
  }, [firstSubnetUuid, firstSubnetPortSecurity, setPortSecurityEnabled]);

  const { data, isLoading } = useQuery({
    queryKey: ['network-step', props.offering.scope_uuid],

    queryFn: () => {
      return Promise.all([
        getAllPages((page) =>
          openstackSubnetsList({
            query: { page, tenant_uuid: props.offering.scope_uuid },
          }),
        ),
        getAllPages((page) =>
          openstackFloatingIpsList({
            query: {
              page,
              tenant_uuid: props.offering.scope_uuid,
              free: true,
              field: ['url', 'address'],
            },
          }),
        ),
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
      <div className="mb-5 mt-n4 border-b-[1px] border-b-secondary">
        {showSshKeyWarning && (
          <AlertItem
            variant="warning"
            className="mb-4"
            title={translate(
              'Important: If you lose the SSH private key selected here, you will permanently lose access to your virtual machine (VM). It cannot be recovered without the key.',
            )}
            body={
              <>
                <p className="mb-1">
                  {translate(
                    'To reduce this risk, we strongly recommend that you:',
                  )}
                </p>
                <ul className="mb-2">
                  <li>
                    {translate(
                      'Keep your SSH private key secure and back it up in a safe location.',
                    )}
                  </li>
                  <li>
                    {translate(
                      'Configure at least one additional trusted user with root-level privileges and SSH access to the VM as a backup.',
                    )}
                  </li>
                </ul>
                <p className="mb-0">
                  {translate(
                    "As a service provider, we do not retain access or any backdoor to your VM, meaning we cannot add, modify, or recover SSH keys for you after creation. Managing system access is strictly the client's responsibility.",
                  )}
                </p>
              </>
            }
          />
        )}
        <FormSSHPublicKeysField
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="text-sm text-secondary"
        />
      </div>

      <FormField className="mb-2 border-b-[1px] border-b-secondary">
        <div className="flex justify-between mb-5">
          <FormLabel className="font-semibold mb-0">
            {translate('Network')}
          </FormLabel>
          <Switch
            checked={customIpEnabled}
            onCheckedChange={setCustomIpEnabled}
            size="sm"
            className="self-center"
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
      </FormField>
      <div className={!portSecurityEnabled ? 'opacity-50 pe-none' : ''}>
        <FormSecurityGroupsField
          offering={props.offering}
          cardBordered={false}
          minHeight="auto"
          headerClassName="mx-0"
          titleClassName="text-sm text-secondary"
          tableActions={
            <div
              style={
                !portSecurityEnabled
                  ? { opacity: 1, pointerEvents: 'auto' as const }
                  : undefined
              }
            >
              <Switch
                checked={!portSecurityEnabled}
                onCheckedChange={() => {
                  userTouchedRef.current = true;
                  setPortSecurityEnabled(!portSecurityEnabled);
                }}
                size="sm"
                className="self-center font-normal"
                label={translate('Disable port security')}
              />
            </div>
          }
        />
      </div>
      {!portSecurityEnabled && (
        <FormText variant="muted">
          {translate(
            'Port security is disabled. Security groups will not be applied. Use this for VM-based routers that manage their own firewall.',
          )}
        </FormText>
      )}
    </VStepperFormStepCard>
  );
};
