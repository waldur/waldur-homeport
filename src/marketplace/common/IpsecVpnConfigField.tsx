import { FC, ReactNode, useState } from 'react';

import {
  AccordionCard,
  FormField,
  FormLabel,
  FormText,
  Input,
  NativeSelect,
  NumberInput,
  PropertyItem,
  PropertyList,
  Switch,
} from 'waldur-ui';

import { FieldError } from '@/form';
import { FormField as FormFieldProps } from '@/form/types';
import { translate } from '@/i18n';
import { propVal } from '@/property/propertyFields';

import { CidrListEditor } from './CidrListEditor';
import {
  describeCidrPolicy,
  getCidrPlaceholder,
  validateNetworkList,
} from './cidrOptions';
import {
  DH_GROUPS,
  DpdAction,
  ENCRYPTION_ALGORITHMS,
  flattenErrors,
  getDefaultIpsecValue,
  getDpdActionOptions,
  getPolicyProviderEnd,
  groupKey,
  INTEGRITY_ALGORITHMS,
  IpsecDpd,
  IpsecErrors,
  IpsecGroup,
  IpsecPhase,
  IpsecPolicy,
  IpsecProviderEnd,
  IpsecVpnConfig,
  resolvePhasePolicy,
} from './ipsecVpn';

const NO_PFS = 'none';

/** "A", "A or B", "A, B or C". */
const joinAlternatives = (items: string[]) =>
  items.length < 2
    ? items.join('')
    : `${items.slice(0, -1).join(', ')} ${translate('or')} ${items[items.length - 1]}`;

const DEFAULT_DPD: IpsecDpd = { action: 'restart', interval: 30, timeout: 120 };

const labelOf = (
  choices: Array<{ value: string | number; label: string }>,
  value: string | number,
) => choices.find((choice) => choice.value === value)?.label ?? String(value);

/** A number typed into a NumberInput, or undefined when the field is empty. */
const toNumber = (value: number | string) =>
  value === '' || value === null ? undefined : Number(value);

/** The provider's end of the tunnel, read-only for the customer. */
const ProviderEndSummary: FC<{ end: IpsecProviderEnd }> = ({ end }) => (
  <div className="mb-4" data-testid="ipsec-provider-end">
    <h6 className="text-secondary mb-2">{translate('Provider end')}</h6>
    {end.gateway_ip || end.local_subnets.length ? (
      <PropertyList variant="summary">
        <PropertyItem
          label={translate('Gateway IP')}
          value={propVal.text(end.gateway_ip)}
        />
        <PropertyItem
          label={translate('Local subnets')}
          value={propVal.list(end.local_subnets)}
        />
      </PropertyList>
    ) : (
      <FormText variant="muted">
        {translate('Assigned by the provider after provisioning.')}
      </FormText>
    )}
  </div>
);

/** Proposal of one phase: algorithms and lifetime, limited to the allowed. */
const PhaseFields: FC<{
  phase: IpsecPhase;
  policy: IpsecPolicy;
  value: Record<string, any>;
  errors?: Record<string, string>;
  onChange: (value: Record<string, any>) => void;
  onBlur: () => void;
}> = ({ phase, policy, value, errors = {}, onChange, onBlur }) => {
  const resolved = resolvePhasePolicy(policy, phase);
  const key = groupKey(phase);
  const title =
    phase === 'phase1'
      ? translate('Phase 1 (IKE)')
      : translate('Phase 2 (IPsec)');
  const label = (field: string) =>
    translate('{field} of {phase}', { field, phase: title });
  // A stored value the policy no longer allows stays visible, marked.
  const withCurrent = <T,>(allowed: T[], current: T) =>
    current === undefined || allowed.includes(current)
      ? allowed
      : [...allowed, current];
  const group = value[key] as IpsecGroup;
  const change = (patch: Record<string, any>) =>
    onChange({ ...value, ...patch });
  return (
    <fieldset className="mb-3" data-testid={`ipsec-${phase}`}>
      <legend className="text-sm font-medium text-secondary mb-2">
        {title}
      </legend>
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 @xl:grid-cols-2">
        <FormField>
          <FormLabel>{translate('Encryption')}</FormLabel>
          <NativeSelect
            value={value.encryption}
            aria-label={label(translate('Encryption'))}
            invalid={Boolean(errors.encryption)}
            onBlur={onBlur}
            onChange={(event) => change({ encryption: event.target.value })}
          >
            {withCurrent(resolved.encryption, value.encryption).map((item) => (
              <option key={item} value={item}>
                {labelOf(ENCRYPTION_ALGORITHMS, item)}
              </option>
            ))}
          </NativeSelect>
          {errors.encryption && (
            <FormText variant="danger">{errors.encryption}</FormText>
          )}
        </FormField>
        <FormField>
          <FormLabel>{translate('Integrity')}</FormLabel>
          <NativeSelect
            value={value.integrity}
            aria-label={label(translate('Integrity'))}
            invalid={Boolean(errors.integrity)}
            onBlur={onBlur}
            onChange={(event) => change({ integrity: event.target.value })}
          >
            {withCurrent(resolved.integrity, value.integrity).map((item) => (
              <option key={item} value={item}>
                {labelOf(INTEGRITY_ALGORITHMS, item)}
              </option>
            ))}
          </NativeSelect>
          {errors.integrity && (
            <FormText variant="danger">{errors.integrity}</FormText>
          )}
        </FormField>
        <FormField>
          <FormLabel>
            {phase === 'phase1'
              ? translate('Diffie-Hellman group')
              : translate('PFS group')}
          </FormLabel>
          <NativeSelect
            value={group === null ? NO_PFS : String(group ?? '')}
            aria-label={label(
              phase === 'phase1'
                ? translate('Diffie-Hellman group')
                : translate('PFS group'),
            )}
            invalid={Boolean(errors[key])}
            onBlur={onBlur}
            onChange={(event) =>
              change({
                [key]:
                  event.target.value === NO_PFS
                    ? null
                    : Number(event.target.value),
              })
            }
          >
            {withCurrent(resolved.groups, group).map((item) => (
              <option
                key={String(item)}
                value={item === null ? NO_PFS : String(item)}
              >
                {item === null
                  ? translate('None (no perfect forward secrecy)')
                  : labelOf(DH_GROUPS, item)}
              </option>
            ))}
          </NativeSelect>
          {errors[key] && <FormText variant="danger">{errors[key]}</FormText>}
        </FormField>
        <FormField>
          <FormLabel>{translate('Lifetime')}</FormLabel>
          <NumberInput
            value={value.lifetime ?? ''}
            min={resolved.lifetimeMin}
            max={resolved.lifetimeMax}
            unit={translate('s')}
            aria-label={label(translate('Lifetime'))}
            invalid={Boolean(errors.lifetime)}
            onBlur={onBlur}
            onValueChange={(lifetime) =>
              change({ lifetime: toNumber(lifetime) })
            }
          />
          <FormText variant={errors.lifetime ? 'danger' : 'muted'}>
            {errors.lifetime ||
              translate('From {min} to {max} seconds.', {
                min: resolved.lifetimeMin,
                max: resolved.lifetimeMax,
              })}
          </FormText>
        </FormField>
      </div>
    </fieldset>
  );
};

const DpdFields: FC<{
  dpd: IpsecDpd | null | undefined;
  errors?: IpsecErrors['dpd'];
  onChange: (dpd: IpsecDpd | null) => void;
  onBlur: () => void;
}> = ({ dpd, errors = {}, onChange, onBlur }) => (
  <div className="mb-3" data-testid="ipsec-dpd">
    <Switch
      checked={Boolean(dpd)}
      onCheckedChange={(checked) => onChange(checked ? DEFAULT_DPD : null)}
      label={translate('Dead peer detection')}
      description={translate(
        'Check that the peer is still there, and act when it stops answering.',
      )}
    />
    {dpd && (
      <div className="grid grid-cols-1 gap-x-3 gap-y-2 mt-2 @xl:grid-cols-3">
        <FormField>
          <FormLabel>{translate('When the peer is lost')}</FormLabel>
          <NativeSelect
            value={dpd.action}
            invalid={Boolean(errors.action)}
            onBlur={onBlur}
            onChange={(event) =>
              onChange({ ...dpd, action: event.target.value as DpdAction })
            }
          >
            {getDpdActionOptions().map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </FormField>
        <FormField>
          <FormLabel>{translate('Interval')}</FormLabel>
          <NumberInput
            value={dpd.interval ?? ''}
            min={1}
            unit={translate('s')}
            invalid={Boolean(errors.interval)}
            onBlur={onBlur}
            onValueChange={(interval) =>
              onChange({ ...dpd, interval: toNumber(interval) })
            }
          />
          {errors.interval && (
            <FormText variant="danger">{errors.interval}</FormText>
          )}
        </FormField>
        <FormField>
          <FormLabel>{translate('Timeout')}</FormLabel>
          <NumberInput
            value={dpd.timeout ?? ''}
            min={1}
            unit={translate('s')}
            invalid={Boolean(errors.timeout)}
            onBlur={onBlur}
            onValueChange={(timeout) =>
              onChange({ ...dpd, timeout: toNumber(timeout) })
            }
          />
          {errors.timeout && (
            <FormText variant="danger">{errors.timeout}</FormText>
          )}
        </FormField>
      </div>
    )}
  </div>
);

const Heading: FC<{ children: ReactNode }> = ({ children }) => (
  <h6 className="text-secondary mb-2">{children}</h6>
);

/**
 * An ipsec_vpn_config option: the customer's end of a site-to-site tunnel,
 * with the provider's end shown read-only above it. The proposals start on
 * the offering's defaults and sit in a folded section, as most customers keep
 * them. A pre-shared key, if the tunnel needs one, is a separate secret
 * option: it is never part of this value.
 */
export const IpsecVpnConfigField: FC<
  FormFieldProps & {
    field: {
      label?: string;
      help_text?: string;
      required?: boolean;
      default_configs?: IpsecPolicy;
    };
    /** Labels of the offering's options, to name those to keep clear of. */
    optionLabels?: Record<string, string>;
  }
> = ({ field, input, meta, optionLabels }) => {
  const policy = field.default_configs || {};
  const value = (input.value || undefined) as IpsecVpnConfig | undefined;
  const config: IpsecVpnConfig = {
    ...getDefaultIpsecValue(policy),
    ...(value || {}),
  };
  const errors: IpsecErrors =
    meta?.error && typeof meta.error === 'object' && !Array.isArray(meta.error)
      ? meta.error
      : {};
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [advancedOpen, setAdvancedOpen] = useState(() =>
    Boolean(errors.phase1 || errors.phase2),
  );
  const attempted = Boolean(meta?.submitFailed);
  const touch = (key: string) => () =>
    setTouched((current) =>
      current[key] ? current : { ...current, [key]: true },
    );
  const shown = (key: string, error: string | undefined) =>
    touched[key] || attempted ? error : undefined;
  const change = (patch: Partial<IpsecVpnConfig>) =>
    input.onChange({ ...config, ...patch });
  const enabled = Boolean(value) || Boolean(field.required);
  const subnetPolicy = policy.remote_subnets || {};
  const subnetErrors = validateNetworkList(
    config.remote_subnets,
    subnetPolicy,
    {
      allowEmpty: false,
    },
  );
  // Errors in the list itself are shown by the editor; what is left is an
  // overlap with another option of the order or resource.
  const overlapError =
    !subnetErrors.list && !subnetErrors.items.some(Boolean)
      ? errors.remote_subnets?.[0]
      : undefined;
  const serverErrors =
    meta?.submitError && !meta.dirtySinceLastSubmit
      ? flattenErrors(meta.submitError)
      : [];
  const providerEnd = value?.provider || getPolicyProviderEnd(policy);
  const subnetHelp = describeCidrPolicy(subnetPolicy);
  // What the subnets must keep clear of, as the validator checks it.
  const keepClearOf = [
    ...(providerEnd.local_subnets.length
      ? [translate('the provider’s subnets')]
      : []),
    ...(policy.no_overlap_with || []).map(
      (name) => optionLabels?.[name] || name,
    ),
  ];

  return (
    <AccordionCard
      title={field.label || translate('IPsec VPN')}
      subtitle={
        field.help_text ||
        translate(
          'A site-to-site IPsec tunnel between your network and the provider’s.',
        )
      }
      secondary
      defaultOpen
      className="@container"
    >
      {/* A tunnel already set up on the resource is changed, not removed. */}
      {!field.required && !meta?.initial && (
        <Switch
          className="mb-3"
          checked={enabled}
          onCheckedChange={(checked) =>
            input.onChange(checked ? getDefaultIpsecValue(policy) : undefined)
          }
          label={translate('Set up this VPN tunnel')}
        />
      )}
      {enabled && (
        <div data-testid="ipsec-vpn-config">
          <ProviderEndSummary end={providerEnd} />

          <Heading>{translate('Your end')}</Heading>
          <div className="grid grid-cols-1 gap-x-3 gap-y-2 mb-3 @xl:grid-cols-2">
            <FormField>
              <FormLabel required>
                {translate('Peer gateway public IP')}
              </FormLabel>
              <Input
                value={config.peer_gateway_ip}
                placeholder="198.51.100.10"
                invalid={Boolean(shown('peer', errors.peer_gateway_ip))}
                onBlur={touch('peer')}
                onChange={(event) =>
                  change({ peer_gateway_ip: event.target.value.trim() })
                }
              />
              {shown('peer', errors.peer_gateway_ip) && (
                <FormText variant="danger">{errors.peer_gateway_ip}</FormText>
              )}
            </FormField>
            <FormField>
              <FormLabel>{translate('Peer ID')}</FormLabel>
              <Input
                value={config.peer_id || ''}
                placeholder={translate('Optional')}
                invalid={Boolean(errors.peer_id)}
                onBlur={touch('peer_id')}
                onChange={(event) =>
                  change({ peer_id: event.target.value.trim() })
                }
              />
              <FormText variant={errors.peer_id ? 'danger' : 'muted'}>
                {errors.peer_id ||
                  translate(
                    'The IKE identity of your gateway, if not its IP address: a domain name or vpn@example.com.',
                  )}
              </FormText>
            </FormField>
            {(policy.ikev1_allowed || config.ike_version === 'ikev1') && (
              <FormField>
                <FormLabel>{translate('IKE version')}</FormLabel>
                <NativeSelect
                  value={config.ike_version || 'ikev2'}
                  invalid={Boolean(errors.ike_version)}
                  onChange={(event) =>
                    change({
                      ike_version: event.target
                        .value as IpsecVpnConfig['ike_version'],
                    })
                  }
                >
                  <option value="ikev2">IKEv2</option>
                  <option value="ikev1">IKEv1</option>
                </NativeSelect>
                {errors.ike_version && (
                  <FormText variant="danger">{errors.ike_version}</FormText>
                )}
              </FormField>
            )}
          </div>

          <FormField className="mb-3">
            <FormLabel required>{translate('Remote subnets')}</FormLabel>
            <CidrListEditor
              values={config.remote_subnets}
              onChange={(remote_subnets) => change({ remote_subnets })}
              policy={subnetPolicy}
              itemLabel={(position) =>
                translate('Remote subnet {position}', { position })
              }
              addLabel={translate('Add subnet')}
              emptyTitle={translate('No remote subnets')}
              emptyMessage={translate(
                'Add the networks behind your gateway that use the tunnel.',
              )}
              required
              startWithRow
              keepOneRow
              placeholder={getCidrPlaceholder(
                subnetPolicy,
                providerEnd.local_subnets,
              )}
              showEmptyErrors={attempted}
              listError={overlapError}
            />
            <FormText variant="muted">
              {[
                translate('The networks behind your gateway.'),
                subnetHelp ? `${subnetHelp}.` : '',
                keepClearOf.length
                  ? translate('They must not overlap {networks}.', {
                      networks: joinAlternatives(keepClearOf),
                    })
                  : '',
              ]
                .filter(Boolean)
                .join(' ')}
            </FormText>
          </FormField>

          <AccordionCard
            title={translate('Advanced: IKE and IPsec proposals')}
            subtitle={
              meta?.initial
                ? translate(
                    'The proposals of this tunnel. Change them only to match your gateway.',
                  )
                : translate(
                    'Set to the offering’s defaults. Change them only to match your gateway.',
                  )
            }
            secondary
            size="sm"
            isOpen={advancedOpen}
            onToggle={setAdvancedOpen}
            className="mb-3"
          >
            {(['phase1', 'phase2'] as const).map((phase) => (
              <PhaseFields
                key={phase}
                phase={phase}
                policy={policy}
                value={config[phase] || {}}
                errors={errors[phase]}
                onChange={(phaseValue) => change({ [phase]: phaseValue })}
                onBlur={touch(phase)}
              />
            ))}
          </AccordionCard>
          <DpdFields
            dpd={config.dpd}
            errors={errors.dpd}
            onChange={(dpd) => change({ dpd })}
            onBlur={touch('dpd')}
          />
        </div>
      )}
      {serverErrors.length > 0 && <FieldError error={serverErrors} />}
    </AccordionCard>
  );
};
