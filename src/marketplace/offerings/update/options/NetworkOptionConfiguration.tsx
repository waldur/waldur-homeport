import { FC } from 'react';
import { Field, FieldRenderProps, useField } from 'react-final-form';
import { Offering } from 'waldur-js-client';

import { Checkbox } from 'waldur-ui';

import {
  BooleanGroup,
  FormGroup,
  CommaSeparatedListGroup,
  NumberGroup,
  SelectGroup,
  StringGroup,
} from '@/form';
import { translate } from '@/i18n';
import {
  DH_GROUPS,
  ENCRYPTION_ALGORITHMS,
  groupKey,
  INTEGRITY_ALGORITHMS,
  IpsecPhase,
  PHASE_DEFAULTS,
  resolvePhasePolicy,
} from '@/marketplace/common/ipsecVpn';
import { K8sFormSection } from '@/marketplace/common/K8sFormSection';

import { getCidrOptionCandidates } from './constants';

const NAME = 'default_configs';
// Phase 2 may go without perfect forward secrecy, which the API writes as
// null; a select cannot hold null, so it stands in for it.
const NO_PFS = 'none';

const parseInteger = (value) =>
  value === '' || value === null || value === undefined
    ? undefined
    : parseInt(value, 10);

// A cleared select leaves the key out: the built-in default applies.
const parseChoice = (value) => (value === null ? undefined : value);

const toGroupChoice = (group) => (group === null ? NO_PFS : group);
const fromGroupChoice = (choice) => (choice === NO_PFS ? null : choice);

const getIpVersionOptions = () => [
  { value: 'any', label: translate('IPv4 or IPv6') },
  { value: 'ipv4', label: translate('IPv4 only') },
  { value: 'ipv6', label: translate('IPv6 only') },
];

/**
 * The allowed choices of a list as checkboxes, all in view: the
 * vocabularies are short, and a select would fold all but two of the chosen
 * ones away. Nothing ticked leaves the key out, so the server's default list
 * applies. A choice may be null (no PFS).
 */
const ChoiceCheckboxes: FC<
  FieldRenderProps<unknown[] | undefined> & {
    choices: Array<{ value: string | number | null; label: string }>;
  }
> = ({ input, choices }) => {
  const selected = Array.isArray(input.value) ? input.value : [];
  const toggle = (value, checked: boolean) => {
    const next = choices
      .map((choice) => choice.value)
      .filter((item) => (item === value ? checked : selected.includes(item)));
    input.onChange(next.length ? next : undefined);
  };
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2">
      {choices.map((choice) => (
        <Checkbox
          key={String(choice.value)}
          label={choice.label}
          checked={selected.includes(choice.value)}
          onCheckedChange={(checked) => toggle(choice.value, checked)}
        />
      ))}
    </div>
  );
};

const ChoicesGroup: FC<{
  name: string;
  label: string;
  choices: Array<{ value: string | number | null; label: string }>;
  emptyMeaning: string;
}> = ({ name, label, choices, emptyMeaning }) => (
  <FormGroup label={label} description={emptyMeaning} space={4}>
    <Field name={name} component={ChoiceCheckboxes} choices={choices} />
  </FormGroup>
);

/** The rules of networks in CIDR form, at `name` in the option's form. */
const CidrPolicyFields: FC<{ name: string; withMultiple?: boolean }> = ({
  name,
  withMultiple,
}) => {
  const {
    input: { value: multiple },
  } = useField<boolean>(`${name}.multiple`, { subscription: { value: true } });
  return (
    <>
      <SelectGroup
        space={4}
        name={`${name}.ip_version`}
        label={translate('IP version')}
        options={getIpVersionOptions()}
        placeholder={translate('IPv4 or IPv6')}
        isClearable={false}
        simpleValue
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <NumberGroup
          space={4}
          name={`${name}.prefix_length_min`}
          label={translate('Shortest prefix length')}
          description={translate('The largest network allowed, such as 16.')}
          type="number"
          min="0"
          max="128"
          parse={parseInteger}
        />
        <NumberGroup
          space={4}
          name={`${name}.prefix_length_max`}
          label={translate('Longest prefix length')}
          description={translate('The smallest network allowed, such as 28.')}
          type="number"
          min="0"
          max="128"
          parse={parseInteger}
        />
      </div>
      <CommaSeparatedListGroup
        space={4}
        name={`${name}.allowed_ranges`}
        label={translate('Allowed ranges')}
        description={translate(
          'The network must lie inside one of these. Any network when empty.',
        )}
        // Documentation ranges: examples, not suggested rules.
        placeholder="192.0.2.0/24"
      />
      <CommaSeparatedListGroup
        space={4}
        name={`${name}.excluded_ranges`}
        label={translate('Excluded ranges')}
        description={translate(
          'The network must not overlap any of these, such as networks your platform uses itself.',
        )}
        placeholder="198.51.100.0/24"
      />
      {withMultiple && (
        <BooleanGroup
          name={`${name}.multiple`}
          label={translate('Customers may enter several networks')}
        />
      )}
      {(!withMultiple || multiple) && (
        <NumberGroup
          space={4}
          name={`${name}.max_items`}
          label={translate('Most networks')}
          description={translate('Up to 256 when not set.')}
          type="number"
          min="1"
          max="256"
          parse={parseInteger}
        />
      )}
    </>
  );
};

/** Settings of a cidr option: which networks customers may enter. */
export const CidrPolicyConfiguration: FC = () => (
  <K8sFormSection
    title={translate('Network rules')}
    subtitle={translate(
      'Every setting is optional; without any, customers may enter any IPv4 or IPv6 network.',
    )}
  >
    <CidrPolicyFields name={NAME} withMultiple />
  </K8sFormSection>
);

/** Allowed proposals, lifetime limits and defaults of one phase. */
const PhasePolicyFields: FC<{ phase: IpsecPhase }> = ({ phase }) => {
  const name = `${NAME}.${phase}`;
  const {
    input: { value: configs },
  } = useField(name, { subscription: { value: true } });
  const resolved = resolvePhasePolicy({ [phase]: configs || {} }, phase);
  const builtin = PHASE_DEFAULTS[phase];
  const key = groupKey(phase);
  const groupOptions = [
    ...DH_GROUPS,
    ...(phase === 'phase2'
      ? [
          {
            value: NO_PFS,
            label: translate('None (no perfect forward secrecy)'),
          },
        ]
      : []),
  ];
  const groupsName = phase === 'phase1' ? 'dh_groups' : 'pfs_groups';
  const labelOf = (options, value) =>
    options.find((option) => option.value === toGroupChoice(value))?.label ??
    String(value);
  return (
    <K8sFormSection
      title={
        phase === 'phase1'
          ? translate('Phase 1 (IKE) proposals')
          : translate('Phase 2 (IPsec) proposals')
      }
      subtitle={translate(
        'Leave an allowed list empty to allow every choice but the weak ones (SHA-1, groups 2 and 5).',
      )}
      topSeparator
    >
      <ChoicesGroup
        name={`${name}.encryption`}
        label={translate('Allowed encryption')}
        choices={ENCRYPTION_ALGORITHMS}
        emptyMeaning={translate('None ticked: every algorithm.')}
      />
      <ChoicesGroup
        name={`${name}.integrity`}
        label={translate('Allowed integrity')}
        choices={INTEGRITY_ALGORITHMS}
        emptyMeaning={translate('None ticked: every algorithm but SHA-1.')}
      />
      <ChoicesGroup
        name={`${name}.${groupsName}`}
        label={
          phase === 'phase1'
            ? translate('Allowed DH groups')
            : translate('Allowed PFS groups')
        }
        choices={[
          ...DH_GROUPS,
          ...(phase === 'phase2'
            ? [{ value: null, label: translate('None (no PFS)') }]
            : []),
        ]}
        emptyMeaning={translate('None ticked: every group but 2 and 5.')}
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <NumberGroup
          space={4}
          name={`${name}.lifetime_min`}
          label={translate('Shortest lifetime (seconds)')}
          placeholder={String(builtin.lifetimeMin)}
          type="number"
          min="1"
          parse={parseInteger}
        />
        <NumberGroup
          space={4}
          name={`${name}.lifetime_max`}
          label={translate('Longest lifetime (seconds)')}
          placeholder={String(builtin.lifetimeMax)}
          type="number"
          min="1"
          parse={parseInteger}
        />
      </div>
      <h6 className="text-secondary mt-2 mb-1">{translate('Defaults')}</h6>
      <p className="text-quaternary mb-3">
        {translate(
          'What the order form starts with. Most customers keep them, so pick what your gateway prefers.',
        )}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
        <SelectGroup
          space={4}
          name={`${name}.defaults.encryption`}
          label={translate('Encryption')}
          options={ENCRYPTION_ALGORITHMS.filter((option) =>
            resolved.encryption.includes(option.value),
          )}
          placeholder={labelOf(
            ENCRYPTION_ALGORITHMS,
            resolved.defaults.encryption,
          )}
          isClearable
          simpleValue
          parse={parseChoice}
        />
        <SelectGroup
          space={4}
          name={`${name}.defaults.integrity`}
          label={translate('Integrity')}
          options={INTEGRITY_ALGORITHMS.filter((option) =>
            resolved.integrity.includes(option.value),
          )}
          placeholder={labelOf(
            INTEGRITY_ALGORITHMS,
            resolved.defaults.integrity,
          )}
          isClearable
          simpleValue
          parse={parseChoice}
        />
        <SelectGroup
          space={4}
          name={`${name}.defaults.${key}`}
          label={
            phase === 'phase1' ? translate('DH group') : translate('PFS group')
          }
          options={groupOptions.filter((option) =>
            resolved.groups.map(toGroupChoice).includes(option.value),
          )}
          placeholder={labelOf(groupOptions, resolved.defaults.group)}
          isClearable
          simpleValue
          format={(value) =>
            value === undefined ? value : toGroupChoice(value)
          }
          parse={(value) =>
            value === null ? undefined : fromGroupChoice(value)
          }
        />
        <NumberGroup
          space={4}
          name={`${name}.defaults.lifetime`}
          label={translate('Lifetime (seconds)')}
          placeholder={String(resolved.defaults.lifetime)}
          type="number"
          min="1"
          parse={parseInteger}
        />
      </div>
    </K8sFormSection>
  );
};

/** Settings of an ipsec_vpn_config option: the rules of the tunnel. */
export const IpsecPolicyConfiguration: FC<{
  offering?: Offering;
  resourceType?: 'options' | 'resource_options';
}> = ({ offering, resourceType = 'options' }) => {
  const candidates = getCidrOptionCandidates(
    offering?.[resourceType],
    resourceType === 'resource_options' ? offering?.options : undefined,
  );
  return (
    <>
      <K8sFormSection
        title={translate('Customer’s gateway')}
        subtitle={translate(
          'Every setting is optional; the order form explains what applies.',
        )}
      >
        <BooleanGroup
          name={`${NAME}.ikev1_allowed`}
          label={translate('Allow IKEv1')}
          description={translate('Otherwise customers can choose IKEv2 only.')}
        />
        <BooleanGroup
          name={`${NAME}.allow_private_peer`}
          label={translate('Allow a private peer address')}
          description={translate(
            'Accept a gateway on a private, loopback, link-local or CGNAT address, for tunnels over a private network.',
          )}
        />
      </K8sFormSection>

      <K8sFormSection
        title={translate('Your end of the tunnel')}
        subtitle={translate(
          'Shown to customers when they order. You can change it per resource afterwards.',
        )}
        topSeparator
      >
        <StringGroup
          space={4}
          name={`${NAME}.provider_gateway_ip`}
          label={translate('Gateway IP')}
          placeholder="203.0.113.10"
        />
        <CommaSeparatedListGroup
          space={4}
          name={`${NAME}.provider_local_subnets`}
          label={translate('Local subnets')}
          description={translate('The networks behind your gateway.')}
          placeholder="10.0.0.0/16"
        />
      </K8sFormSection>

      <K8sFormSection
        title={translate('Customer’s subnets')}
        subtitle={translate(
          'Rules for the networks behind the customer’s gateway.',
        )}
        topSeparator
      >
        <CidrPolicyFields name={`${NAME}.remote_subnets`} />
        <SelectGroup
          space={4}
          name={`${NAME}.no_overlap_with`}
          label={translate('Must not overlap')}
          description={
            candidates.length
              ? translate(
                  'Network (CIDR) options whose networks the subnets must keep clear of, such as the cluster network.',
                )
              : translate(
                  'Add a Network (CIDR) option to this offering to keep the subnets clear of its networks.',
                )
          }
          options={candidates}
          isDisabled={!candidates.length}
          isMulti
          simpleValue
        />
      </K8sFormSection>

      <PhasePolicyFields phase="phase1" />
      <PhasePolicyFields phase="phase2" />
    </>
  );
};
