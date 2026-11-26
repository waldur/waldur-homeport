import type {
  IpsecDhGroupEnum,
  IpsecEncryptionEnum,
  IpsecIntegrityEnum,
  IpsecPhase1,
  IpsecPhase2,
  OptionDefaultConfigs,
} from 'waldur-js-client';

import { translate } from '@/i18n';

import {
  checkNetwork,
  formatNetworkListErrors,
  validateCidrPolicy,
  validateNetworkList,
} from './cidrOptions';
import { isPublicAddress, networksOverlap, parseIpAddress } from './ipNetworks';
import { isValidEgressDomain } from './k8sEgressRules';

/** The default_configs of an ipsec_vpn_config option. */
export type IpsecPolicy = Pick<
  OptionDefaultConfigs,
  | 'ikev1_allowed'
  | 'allow_private_peer'
  | 'provider_gateway_ip'
  | 'provider_local_subnets'
  | 'remote_subnets'
  | 'no_overlap_with'
  | 'phase1'
  | 'phase2'
>;

type IkeVersion = 'ikev2' | 'ikev1';
export type DpdAction = 'restart' | 'clear' | 'hold';

export interface IpsecDpd {
  action: DpdAction;
  interval: number;
  timeout: number;
}

export interface IpsecProviderEnd {
  gateway_ip: string | null;
  local_subnets: string[];
}

/**
 * An ipsec_vpn_config value. The API types order attributes and resource
 * options as free-form objects, so the value has no SDK type; its phases do.
 * `provider` is set by the server.
 */
export interface IpsecVpnConfig {
  peer_gateway_ip: string;
  peer_id?: string;
  remote_subnets: string[];
  ike_version?: IkeVersion;
  phase1?: IpsecPhase1;
  phase2?: IpsecPhase2;
  dpd?: IpsecDpd | null;
  provider?: IpsecProviderEnd;
}

export type IpsecPhase = 'phase1' | 'phase2';

export const ENCRYPTION_ALGORITHMS: Array<{
  value: IpsecEncryptionEnum;
  label: string;
}> = [
  { value: 'aes128', label: 'AES-128' },
  { value: 'aes192', label: 'AES-192' },
  { value: 'aes256', label: 'AES-256' },
  { value: 'aes128gcm16', label: 'AES-128-GCM' },
  { value: 'aes256gcm16', label: 'AES-256-GCM' },
  { value: 'chacha20poly1305', label: 'ChaCha20-Poly1305' },
];

export const INTEGRITY_ALGORITHMS: Array<{
  value: IpsecIntegrityEnum;
  label: string;
}> = [
  { value: 'sha1', label: 'SHA-1' },
  { value: 'sha256', label: 'SHA-256' },
  { value: 'sha384', label: 'SHA-384' },
  { value: 'sha512', label: 'SHA-512' },
];

export const DH_GROUPS: Array<{ value: IpsecDhGroupEnum; label: string }> = [
  { value: 2, label: 'MODP 1024 (group 2)' },
  { value: 5, label: 'MODP 1536 (group 5)' },
  { value: 14, label: 'MODP 2048 (group 14)' },
  { value: 15, label: 'MODP 3072 (group 15)' },
  { value: 16, label: 'MODP 4096 (group 16)' },
  { value: 19, label: 'ECP 256 (group 19)' },
  { value: 20, label: 'ECP 384 (group 20)' },
  { value: 21, label: 'ECP 521 (group 21)' },
  { value: 31, label: 'Curve25519 (group 31)' },
];

// Left out of the allowed lists unless the provider names them.
const WEAK_INTEGRITY: IpsecIntegrityEnum[] = ['sha1'];
const WEAK_GROUPS: IpsecDhGroupEnum[] = [2, 5];

export const getDpdActionOptions = (): Array<{
  value: DpdAction;
  label: string;
}> => [
  { value: 'restart', label: translate('Restart the tunnel') },
  { value: 'clear', label: translate('Close the tunnel') },
  { value: 'hold', label: translate('Hold traffic until the peer is back') },
];

/** Built-in phase policies: what applies where the provider sets nothing. */
export const PHASE_DEFAULTS = {
  phase1: {
    lifetimeMin: 3600,
    lifetimeMax: 86400,
    defaults: {
      encryption: 'aes256',
      integrity: 'sha256',
      group: 14,
      lifetime: 28800,
    },
  },
  phase2: {
    lifetimeMin: 900,
    lifetimeMax: 28800,
    defaults: {
      encryption: 'aes256',
      integrity: 'sha256',
      group: 14,
      lifetime: 3600,
    },
  },
} as const;

/** The key a phase's group goes under: dh_group in phase 1, pfs_group in 2. */
export const groupKey = (phase: IpsecPhase) =>
  phase === 'phase1' ? 'dh_group' : 'pfs_group';

/** In phase 2, null: no perfect forward secrecy. */
export type IpsecGroup = IpsecDhGroupEnum | null;

export interface ResolvedPhasePolicy {
  encryption: IpsecEncryptionEnum[];
  integrity: IpsecIntegrityEnum[];
  groups: IpsecGroup[];
  lifetimeMin: number;
  lifetimeMax: number;
  defaults: {
    encryption: IpsecEncryptionEnum;
    integrity: IpsecIntegrityEnum;
    group: IpsecGroup;
    lifetime: number;
  };
}

/**
 * A phase's allowed lists, lifetime limits and defaults, filled in as the
 * server fills them (`_phase_policy`): an allowed list the provider left out
 * is the whole vocabulary minus the weak choices, and a default outside the
 * allowed list falls to the first allowed value.
 */
export const resolvePhasePolicy = (
  policy: IpsecPolicy | undefined,
  phase: IpsecPhase,
): ResolvedPhasePolicy => {
  const builtin = PHASE_DEFAULTS[phase];
  const configs = policy?.[phase] || {};
  const given = (configs.defaults || {}) as Partial<IpsecPhase1 & IpsecPhase2>;
  const encryption = configs.encryption?.length
    ? configs.encryption
    : ENCRYPTION_ALGORITHMS.map((item) => item.value);
  const integrity = configs.integrity?.length
    ? configs.integrity
    : INTEGRITY_ALGORITHMS.map((item) => item.value).filter(
        (item) => !WEAK_INTEGRITY.includes(item),
      );
  const allowedGroups =
    phase === 'phase1'
      ? policy?.phase1?.dh_groups
      : (policy?.phase2?.pfs_groups as IpsecGroup[] | undefined);
  const groups: IpsecGroup[] = allowedGroups?.length
    ? allowedGroups
    : DH_GROUPS.map((item) => item.value).filter(
        (item) => !WEAK_GROUPS.includes(item),
      );
  const pick = <T>(key: string, allowed: T[], builtinValue: T): T =>
    key in given
      ? (given[key] as T)
      : allowed.includes(builtinValue)
        ? builtinValue
        : allowed[0];
  const lifetimeMin = configs.lifetime_min || builtin.lifetimeMin;
  const lifetimeMax = configs.lifetime_max || builtin.lifetimeMax;
  const lifetime = given.lifetime ?? builtin.defaults.lifetime;
  return {
    encryption,
    integrity,
    groups,
    lifetimeMin,
    lifetimeMax,
    defaults: {
      encryption: pick('encryption', encryption, builtin.defaults.encryption),
      integrity: pick('integrity', integrity, builtin.defaults.integrity),
      group: pick<IpsecGroup>(groupKey(phase), groups, builtin.defaults.group),
      lifetime: Math.min(Math.max(lifetime, lifetimeMin), lifetimeMax),
    },
  };
};

const phaseValue = (resolved: ResolvedPhasePolicy, phase: IpsecPhase) => ({
  encryption: resolved.defaults.encryption,
  integrity: resolved.defaults.integrity,
  [groupKey(phase)]: resolved.defaults.group,
  lifetime: resolved.defaults.lifetime,
});

/** The provider's end of new tunnels, from the policy. */
export const getPolicyProviderEnd = (
  policy: IpsecPolicy | undefined,
): IpsecProviderEnd => ({
  gateway_ip: policy?.provider_gateway_ip || null,
  local_subnets: policy?.provider_local_subnets || [],
});

/** A new value: nothing entered yet, the phases on the policy's defaults. */
export const getDefaultIpsecValue = (
  policy: IpsecPolicy | undefined,
): IpsecVpnConfig => ({
  peer_gateway_ip: '',
  peer_id: '',
  remote_subnets: [],
  ike_version: 'ikev2',
  phase1: phaseValue(resolvePhasePolicy(policy, 'phase1'), 'phase1'),
  phase2: phaseValue(resolvePhasePolicy(policy, 'phase2'), 'phase2'),
  dpd: null,
});

const IKE_ID_EMAIL = /^[^@\s]{1,64}@([^@\s]+)$/;

/** An IKE identity: an IP address, a domain name, or user@domain. */
export const isIkeIdentity = (value: string) => {
  if (parseIpAddress(value)) {
    return true;
  }
  const domain = IKE_ID_EMAIL.exec(value)?.[1] ?? value;
  return !domain.startsWith('*.') && isValidEgressDomain(domain);
};

type PhaseErrors = Partial<
  Record<
    'encryption' | 'integrity' | 'dh_group' | 'pfs_group' | 'lifetime',
    string
  >
>;

/** Problems with an IPsec value, shaped like the value. */
export interface IpsecErrors {
  peer_gateway_ip?: string;
  peer_id?: string;
  remote_subnets?: string[];
  ike_version?: string;
  phase1?: PhaseErrors;
  phase2?: PhaseErrors;
  dpd?: Partial<Record<keyof IpsecDpd, string>>;
}

const formatGroupChoice = (group: IpsecGroup) =>
  group === null ? translate('none') : String(group);

const validatePhase = (
  value: (IpsecPhase1 & IpsecPhase2) | undefined,
  resolved: ResolvedPhasePolicy,
  phase: IpsecPhase,
): PhaseErrors | undefined => {
  const filled = { ...phaseValue(resolved, phase), ...(value || {}) };
  const errors: PhaseErrors = {};
  const notAllowed = (given: string, allowed: string[]) =>
    translate('{value} is not allowed. Choose one of: {allowed}.', {
      value: given,
      allowed: allowed.join(', '),
    });
  if (!resolved.encryption.includes(filled.encryption)) {
    errors.encryption = notAllowed(filled.encryption, resolved.encryption);
  }
  if (!resolved.integrity.includes(filled.integrity)) {
    errors.integrity = notAllowed(filled.integrity, resolved.integrity);
  }
  const key = groupKey(phase);
  const group = filled[key] as IpsecGroup;
  if (!resolved.groups.includes(group)) {
    errors[key] = notAllowed(
      formatGroupChoice(group),
      resolved.groups.map(formatGroupChoice),
    );
  }
  const lifetime = filled.lifetime;
  if (
    typeof lifetime !== 'number' ||
    !Number.isInteger(lifetime) ||
    lifetime < resolved.lifetimeMin ||
    lifetime > resolved.lifetimeMax
  ) {
    errors.lifetime = translate(
      'Enter a lifetime from {min} to {max} seconds.',
      { min: resolved.lifetimeMin, max: resolved.lifetimeMax },
    );
  }
  return Object.keys(errors).length ? errors : undefined;
};

const validateDpd = (dpd: IpsecDpd | null | undefined) => {
  if (!dpd) {
    return undefined;
  }
  const errors: IpsecErrors['dpd'] = {};
  const isPositive = (value: unknown) =>
    typeof value === 'number' && Number.isInteger(value) && value >= 1;
  if (!dpd.action) {
    errors.action = translate('Choose what to do when the peer is lost.');
  }
  if (!isPositive(dpd.interval)) {
    errors.interval = translate('Enter a whole number of seconds, 1 or more.');
  }
  if (!isPositive(dpd.timeout)) {
    errors.timeout = translate('Enter a whole number of seconds, 1 or more.');
  } else if (isPositive(dpd.interval) && dpd.timeout < dpd.interval) {
    errors.timeout = translate(
      'The timeout must not be shorter than the interval.',
    );
  }
  return Object.keys(errors).length ? errors : undefined;
};

export interface IpsecValidationContext {
  /** Values of the cidr options named by no_overlap_with, by option name. */
  overlapValues?: Record<string, unknown>;
  /** Labels of those options, to name them in a message. */
  optionLabels?: Record<string, string>;
}

const asList = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Array.isArray(value)
      ? value.filter((item) => typeof item === 'string')
      : [];

/**
 * The first remote subnet overlapping one of the provider end's subnets:
 * both ends route the other's networks through the tunnel, so a network on
 * both sides breaks routing. Mirrors `_check_provider_overlap`.
 */
const findProviderOverlap = (
  subnets: string[],
  providerEnd: IpsecProviderEnd,
): string | undefined => {
  const local = providerEnd.local_subnets.flatMap((item) => {
    const network = checkNetwork(item).network;
    return network ? [{ item, network }] : [];
  });
  for (const subnet of subnets) {
    const network = checkNetwork(subnet).network;
    const conflict =
      network && local.find((other) => networksOverlap(network, other.network));
    if (conflict) {
      return translate(
        "{subnet} overlaps the provider's subnet {provider_subnet}.",
        {
          subnet,
          provider_subnet: conflict.item,
        },
      );
    }
  }
  return undefined;
};

/** The first remote subnet overlapping a network of a no_overlap_with option. */
const findOverlap = (
  subnets: string[],
  policy: IpsecPolicy,
  context: IpsecValidationContext,
): string | undefined => {
  for (const other of policy.no_overlap_with || []) {
    for (const item of asList(context.overlapValues?.[other])) {
      const otherNetwork = checkNetwork(item).network;
      for (const subnet of subnets) {
        const network = checkNetwork(subnet).network;
        if (network && otherNetwork && networksOverlap(network, otherNetwork)) {
          return translate('{subnet} overlaps {network} of {option}.', {
            subnet,
            network: item,
            option: context.optionLabels?.[other] || other,
          });
        }
      }
    }
  }
  return undefined;
};

/**
 * Problems with an IPsec value under the option's policy, or undefined.
 * Mirrors `IpsecVpnConfigField` and `check_network_overlaps` in Mastermind.
 */
export const validateIpsecValue = (
  value: IpsecVpnConfig | undefined,
  policy: IpsecPolicy = {},
  context: IpsecValidationContext = {},
): IpsecErrors | undefined => {
  const config = { ...getDefaultIpsecValue(policy), ...(value || {}) };
  const errors: IpsecErrors = {};

  const peer = parseIpAddress(config.peer_gateway_ip || '');
  if (!peer) {
    errors.peer_gateway_ip = translate(
      'Enter the IP address of your VPN gateway, such as 198.51.100.10.',
    );
  } else if (!policy.allow_private_peer && !isPublicAddress(peer)) {
    errors.peer_gateway_ip = translate(
      '{address} is not a public address. Enter the public IP address of your VPN gateway.',
      { address: config.peer_gateway_ip.trim() },
    );
  }

  const peerId = (config.peer_id || '').trim();
  if (peerId && !isIkeIdentity(peerId)) {
    errors.peer_id = translate(
      'Enter an IP address, a domain name or an identity such as vpn@example.com.',
    );
  }

  if (config.ike_version === 'ikev1' && !policy.ikev1_allowed) {
    errors.ike_version = translate('This offering accepts IKEv2 only.');
  }

  for (const phase of ['phase1', 'phase2'] as const) {
    const phaseErrors = validatePhase(
      config[phase] as IpsecPhase1 & IpsecPhase2,
      resolvePhasePolicy(policy, phase),
      phase,
    );
    if (phaseErrors) {
      errors[phase] = phaseErrors;
    }
  }

  const subnetErrors = formatNetworkListErrors(
    validateNetworkList(config.remote_subnets, policy.remote_subnets || {}, {
      allowEmpty: false,
    }),
    (position) => translate('Remote subnet {position}', { position }),
  );
  if (subnetErrors.length) {
    errors.remote_subnets = subnetErrors;
  } else {
    // The provider end the value is stored with: the resource's own, or
    // the policy's for a new tunnel.
    const overlap =
      findProviderOverlap(
        config.remote_subnets,
        config.provider || getPolicyProviderEnd(policy),
      ) || findOverlap(config.remote_subnets, policy, context);
    if (overlap) {
      errors.remote_subnets = [overlap];
    }
  }

  const dpdErrors = validateDpd(config.dpd);
  if (dpdErrors) {
    errors.dpd = dpdErrors;
  }

  return Object.keys(errors).length ? errors : undefined;
};

/** Nested errors, such as the server's {phase1: {encryption: [...]}}, as lines. */
export const flattenErrors = (error: unknown): string[] => {
  if (!error) {
    return [];
  }
  if (typeof error === 'string') {
    return [error];
  }
  if (Array.isArray(error)) {
    return error.flatMap(flattenErrors);
  }
  if (typeof error === 'object') {
    return Object.values(error).flatMap(flattenErrors);
  }
  return [String(error)];
};

const labelOf = (
  choices: Array<{ value: string | number; label: string }>,
  value: string | number,
) => choices.find((choice) => choice.value === value)?.label ?? String(value);

/** A group as the form names it: "MODP 2048 (group 14)", or "no PFS". */
const formatGroup = (group: IpsecGroup) =>
  group === null ? translate('no PFS') : labelOf(DH_GROUPS, group);

/** "AES-256, SHA-256, MODP 2048 (group 14)", with the form's labels. */
const formatProposal = (
  phase: (IpsecPhase1 & IpsecPhase2) | undefined,
  key: 'dh_group' | 'pfs_group',
) => {
  if (!phase?.encryption) {
    return null;
  }
  const group = phase[key] as IpsecGroup | undefined;
  return [
    labelOf(ENCRYPTION_ALGORITHMS, phase.encryption),
    phase.integrity ? labelOf(INTEGRITY_ALGORITHMS, phase.integrity) : null,
    group === undefined ? null : formatGroup(group),
  ]
    .filter(Boolean)
    .join(', ');
};

/**
 * The tunnel on one line: "Peer 198.51.100.10 · IKEv2 · Phase 1: AES-256,
 * SHA-256, MODP 2048 (group 14) · Phase 2: AES-256, SHA-256, no PFS ·
 * 192.168.10.0/24 ↔ 10.0.0.0/16".
 */
export const formatIpsecValue = (
  value: Partial<IpsecVpnConfig> | null | undefined,
): string => {
  if (!value || typeof value !== 'object') {
    return '';
  }
  const parts: string[] = [];
  if (value.peer_gateway_ip) {
    parts.push(translate('Peer {address}', { address: value.peer_gateway_ip }));
  }
  parts.push(value.ike_version === 'ikev1' ? 'IKEv1' : 'IKEv2');
  const phase1 = formatProposal(
    value.phase1 as IpsecPhase1 & IpsecPhase2,
    'dh_group',
  );
  if (phase1) {
    parts.push(translate('Phase 1: {proposal}', { proposal: phase1 }));
  }
  const phase2 = formatProposal(
    value.phase2 as IpsecPhase1 & IpsecPhase2,
    'pfs_group',
  );
  if (phase2) {
    parts.push(translate('Phase 2: {proposal}', { proposal: phase2 }));
  }
  const remote = (value.remote_subnets || []).join(', ');
  const local = (value.provider?.local_subnets || []).join(', ');
  if (remote || local) {
    parts.push(`${remote || '?'} ↔ ${local || '?'}`);
  }
  return parts.join(' · ');
};

export interface IpsecPolicyErrors {
  provider_gateway_ip?: string;
  provider_local_subnets?: string;
  remote_subnets?: ReturnType<typeof validateCidrPolicy>;
  no_overlap_with?: string;
  phase1?: PhasePolicyErrors;
  phase2?: PhasePolicyErrors;
}

interface PhasePolicyErrors {
  lifetime_max?: string;
  defaults?: Partial<
    Record<
      'encryption' | 'integrity' | 'dh_group' | 'pfs_group' | 'lifetime',
      string
    >
  >;
}

/**
 * Problems with an IPsec policy as a provider saves it, keyed like the
 * policy. Mirrors `validate_ipsec_policy` and, with `cidrOptions` (the names
 * of the cidr options it may refer to), the offering's check of
 * no_overlap_with.
 */
export const validateIpsecPolicy = (
  policy: IpsecPolicy | undefined,
  cidrOptions?: string[],
): IpsecPolicyErrors | undefined => {
  const configs = policy || {};
  const errors: IpsecPolicyErrors = {};
  if (
    configs.provider_gateway_ip &&
    !parseIpAddress(configs.provider_gateway_ip)
  ) {
    errors.provider_gateway_ip = translate(
      'Enter a valid IPv4 or IPv6 address.',
    );
  }
  const localErrors = formatNetworkListErrors(
    validateNetworkList(configs.provider_local_subnets, {}),
  );
  if (localErrors.length) {
    errors.provider_local_subnets = localErrors.join(' ');
  }
  const subnetErrors = validateCidrPolicy(configs.remote_subnets);
  if (subnetErrors) {
    errors.remote_subnets = subnetErrors;
  }
  const unknown = (configs.no_overlap_with || []).filter(
    (name) => cidrOptions && !cidrOptions.includes(name),
  );
  if (unknown.length) {
    errors.no_overlap_with = translate(
      '{options}: not a cidr option of this offering.',
      { options: unknown.join(', ') },
    );
  }
  for (const phase of ['phase1', 'phase2'] as const) {
    const phaseConfigs = configs[phase];
    if (!phaseConfigs) {
      continue;
    }
    const builtin = PHASE_DEFAULTS[phase];
    const low = phaseConfigs.lifetime_min || builtin.lifetimeMin;
    const high = phaseConfigs.lifetime_max || builtin.lifetimeMax;
    const phaseErrors: PhasePolicyErrors = {};
    if (low > high) {
      phaseErrors.lifetime_max = translate(
        'The longest lifetime must not be shorter than the shortest.',
      );
    }
    const defaults = (phaseConfigs.defaults || {}) as Record<string, unknown>;
    const resolved = resolvePhasePolicy(configs, phase);
    const allowed = {
      encryption: resolved.encryption as unknown[],
      integrity: resolved.integrity as unknown[],
      [groupKey(phase)]: resolved.groups as unknown[],
    };
    const defaultErrors: PhasePolicyErrors['defaults'] = {};
    for (const [key, values] of Object.entries(allowed)) {
      if (key in defaults && !values.includes(defaults[key])) {
        defaultErrors[key] = translate(
          'The default must be one of the allowed values.',
        );
      }
    }
    const lifetime = defaults.lifetime as number | undefined;
    if (lifetime != null && (lifetime < low || lifetime > high)) {
      defaultErrors.lifetime = translate(
        'The default lifetime must be within the lifetime limits.',
      );
    }
    if (Object.keys(defaultErrors).length) {
      phaseErrors.defaults = defaultErrors;
    }
    if (Object.keys(phaseErrors).length) {
      errors[phase] = phaseErrors;
    }
  }
  return Object.keys(errors).length ? errors : undefined;
};
