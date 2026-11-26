import {
  DefaultPermissionEnum,
  OfferingOptions,
  OptionFieldTypeEnum,
} from 'waldur-js-client';

import { translate } from '@/i18n';
import { isK8sConfigFieldType } from '@/marketplace/common/k8s-types';

// Storage folder permission choices - values from SDK DefaultPermissionEnum
export const STORAGE_FOLDER_PERMISSIONS: Array<{
  value: DefaultPermissionEnum;
  label: string;
}> = [
  {
    value: '2770',
    label: translate(
      '2770 - Group write, setgid (recommended for shared projects)',
    ),
  },
  { value: '2775', label: translate('2775 - Group write, world read, setgid') },
  {
    value: '2777',
    label: translate('2777 - Full access, setgid (least secure)'),
  },
  { value: '770', label: translate('770 - Group write, no setgid') },
  {
    value: '775',
    label: translate('775 - Group write, world read, no setgid'),
  },
  { value: '777', label: translate('777 - Full access, no setgid') },
];

export const FIELD_TYPES: Array<{
  value: OptionFieldTypeEnum;
  label: string;
  /** What the type does, for types whose name does not say it. */
  description?: string;
}> = [
  {
    value: 'boolean',
    label: translate('Boolean'),
  },
  {
    value: 'integer',
    label: translate('Integer'),
  },
  {
    value: 'money',
    label: translate('Money'),
  },
  {
    value: 'string',
    label: translate('String'),
  },
  {
    value: 'text',
    label: translate('Text'),
  },
  {
    value: 'html_text',
    label: translate('HTML text'),
  },
  {
    value: 'select_string',
    label: translate('Select'),
  },
  {
    value: 'select_string_multi',
    label: translate('Select multiple options'),
  },
  {
    value: 'select_openstack_tenant',
    label: translate('Select OpenStack tenant'),
  },
  {
    value: 'select_openstack_instance',
    label: translate('Select OpenStack instance'),
  },
  {
    value: 'select_multiple_openstack_instances',
    label: translate('Select multiple OpenStack instances'),
  },
  {
    value: 'date',
    label: translate('Date'),
  },
  {
    value: 'time',
    label: translate('Time'),
  },
  {
    value: 'conditional_cascade',
    label: translate('Conditional Cascade'),
  },
  {
    value: 'component_multiplier',
    label: translate('Component Multiplier'),
    description: translate(
      'Shows a number calculated from a limit the customer sets (limit × factor), which the customer may override within a range. It is stored as an order attribute and changes no limit or price.',
    ),
  },
  {
    value: 'component_formula',
    label: translate('Component Formula'),
    description: translate(
      'The customer enters one number, and each chosen limit component is set to a formula of it, such as input * 2. The calculated limits are priced like any other and cannot be edited by the customer.',
    ),
  },
  {
    value: 'component_sum',
    label: translate('Component Sum'),
    description: translate(
      'Sets a limit component to the sum of other limit components, whether entered by the customer or calculated by a formula. The customer does not fill it in; the total is shown and priced.',
    ),
  },
  {
    value: 'k8s_cluster_config',
    label: translate('Kubernetes Cluster Configuration'),
    description: translate(
      'A Kubernetes cluster: version, one or three sites, node groups and access rules. You set the node sizes, the versions, the topology and the load balancer.',
    ),
  },
  {
    value: 'k8s_egress_rules',
    label: translate('Kubernetes Egress Rules'),
    description: translate(
      'Lets customers change the egress rules of a cluster after ordering. It pairs with the Kubernetes configuration order option and follows its egress settings and baseline destinations.',
    ),
  },
  {
    value: 'storage_folder_manager',
    label: translate('Storage Folder Manager'),
  },
  {
    value: 'cidr',
    label: translate('Network (CIDR)'),
    description: translate(
      'A network in CIDR form, such as 10.20.0.0/16, or a list of them. You set the IP version, the prefix lengths and the ranges it must lie inside or keep out of.',
    ),
  },
  {
    value: 'ipsec_vpn_config',
    label: translate('IPsec VPN'),
    description: translate(
      'A site-to-site IPsec tunnel: the customer enters their gateway and the networks behind it. You set the allowed proposals, the defaults and your end of the tunnel.',
    ),
  },
  {
    value: 'secret',
    label: translate('Secret'),
    description: translate(
      'A value kept encrypted, such as a VPN pre-shared key, an API token or a private key. The customer enters it, or you set it on the resource; it is never shown with the other settings.',
    ),
  },
];

// A sum has no value of its own to change after ordering.
export const ORDER_ONLY_FIELD_TYPES: OptionFieldTypeEnum[] = ['component_sum'];

// Egress rules are ordered in the Kubernetes configuration; this type only
// changes them on an existing resource.
export const RESOURCE_ONLY_FIELD_TYPES: OptionFieldTypeEnum[] = [
  'k8s_egress_rules',
];

/** The offering's Kubernetes configuration order options. */
export const getK8sConfigOrderOptions = (offering) =>
  Object.entries(offering?.options?.options || {}).filter(
    ([, option]: [string, any]) => isK8sConfigFieldType(option?.type),
  );

/**
 * The cidr options an IPsec option's remote subnets can be kept apart from:
 * those of its own options set and, for a resource option, the order options,
 * whose values the resource's attributes hold.
 */
export const getCidrOptionCandidates = (
  options?: OfferingOptions,
  orderOptions?: OfferingOptions,
) => {
  const seen = new Set<string>();
  return [options, orderOptions].flatMap((set) =>
    Object.entries(set?.options || {}).flatMap(([key, option]) => {
      if (option?.type !== 'cidr' || seen.has(key)) {
        return [];
      }
      seen.add(key);
      return [{ value: key, label: `${option.label || key} (${key})` }];
    }),
  );
};

/** Description of Component Formula on the resource options tab. */
export const getPairedFormulaDescription = () =>
  translate(
    'Lets customers change the number entered for a Component Formula order option after ordering. The change is ordered with the recalculated limits and price. It uses the formulas and bounds of that order option.',
  );

/** The offering's Component Formula order options, which a resource option can pair with. */
export const getFormulaOrderOptions = (offering) =>
  Object.entries(offering?.options?.options || {})
    .filter(([, option]: [string, any]) => option?.type === 'component_formula')
    .map(([key, option]: [string, any]) => ({
      value: key,
      label: `${option.label || key} (${key})`,
    }));

export const OPTION_FORM_ID = 'OptionDialog';
