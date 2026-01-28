import { translate } from '@waldur/i18n';

import { FieldDiff, HistoryEntityType } from './types';

// Field labels for different entity types
const entityFieldLabels: Record<HistoryEntityType, Record<string, string>> = {
  resource: {
    name: 'Name',
    description: 'Description',
    state: 'State',
    backend_id: 'Backend ID',
    limits: 'Limits',
    current_usages: 'Current usages',
    plan_uuid: 'Plan',
    attributes: 'Attributes',
    effective_id: 'Effective ID',
    end_date: 'End date',
    end_date_requested_by: 'End date requested by',
    report: 'Report',
    error_message: 'Error message',
    error_traceback: 'Error traceback',
    restrict_member_access: 'Restrict member access',
    downscaled: 'Downscaled',
    paused: 'Paused',
    requested_downscaling: 'Requested downscaling',
    options: 'Options',
  },
  customer: {
    name: 'Name',
    native_name: 'Native name',
    abbreviation: 'Abbreviation',
    contact_details: 'Contact details',
    agreement_number: 'Agreement number',
    sponsor_number: 'Sponsor number',
    email: 'Email',
    phone_number: 'Phone number',
    access_subnets: 'Access subnets',
    registration_code: 'Registration code',
    homepage: 'Homepage',
    domain: 'Domain',
    address: 'Address',
    postal: 'Postal code',
    country: 'Country',
    vat_code: 'VAT code',
    bank_name: 'Bank name',
    bank_account: 'Bank account',
    default_tax_percent: 'Default tax percent',
    backend_id: 'Backend ID',
    blocked: 'Blocked',
  },
  user: {
    username: 'Username',
    full_name: 'Full name',
    native_name: 'Native name',
    email: 'Email',
    phone_number: 'Phone number',
    organization: 'Organization',
    job_title: 'Job title',
    affiliations: 'Affiliations',
    is_staff: 'Staff status',
    is_support: 'Support status',
    is_active: 'Active',
    description: 'Description',
    preferred_language: 'Preferred language',
    competence: 'Competence',
    token_lifetime: 'Token lifetime',
  },
  ssh_key: {
    name: 'Name',
    public_key: 'Public key',
    fingerprint: 'Fingerprint',
    type: 'Type',
  },
  offering: {
    name: 'Name',
    description: 'Description',
    full_description: 'Full description',
    terms_of_service: 'Terms of service',
    terms_of_service_link: 'Terms of service link',
    privacy_policy_link: 'Privacy policy link',
    getting_started: 'Getting started',
    integration_guide: 'Integration guide',
    state: 'State',
    paused_reason: 'Paused reason',
    attributes: 'Attributes',
    options: 'Options',
    secret_options: 'Secret options',
    plugin_options: 'Plugin options',
    components: 'Components',
    plans: 'Plans',
    backend_id: 'Backend ID',
    shared: 'Shared',
    billable: 'Billable',
    latitude: 'Latitude',
    longitude: 'Longitude',
    country: 'Country',
    vendor_details: 'Vendor details',
  },
  plan: {
    name: 'Name',
    description: 'Description',
    unit: 'Unit',
    unit_price: 'Unit price',
    init_price: 'Initial price',
    switch_price: 'Switch price',
    max_amount: 'Max amount',
    article_code: 'Article code',
    archived: 'Archived',
    is_active: 'Active',
    prices: 'Prices',
    quotas: 'Quotas',
    future_prices: 'Future prices',
  },
};

// Fields to exclude from diff (internal/technical fields)
const excludedFields = new Set([
  'uuid',
  'url',
  'created',
  'modified',
  'pk',
  'id',
  'content_type',
  'object_id',
]);

function getFieldLabel(entityType: HistoryEntityType, field: string): string {
  const labels = entityFieldLabels[entityType];
  return labels?.[field] || formatFieldName(field);
}

function formatFieldName(field: string): string {
  // Convert snake_case to Title Case
  return field
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export function formatFieldValue(value: unknown): string {
  if (value === null || value === undefined) {
    return translate('N/A');
  }
  if (typeof value === 'boolean') {
    return value ? translate('Yes') : translate('No');
  }
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  return String(value);
}

export function computeFieldDiffs(
  entityType: HistoryEntityType,
  oldData: Record<string, unknown> | null,
  newData: Record<string, unknown>,
): FieldDiff[] {
  const diffs: FieldDiff[] = [];
  const allFields = new Set([
    ...Object.keys(oldData || {}),
    ...Object.keys(newData),
  ]);

  for (const field of allFields) {
    if (excludedFields.has(field)) continue;

    const oldValue = oldData?.[field];
    const newValue = newData[field];
    const changed = !deepEqual(oldValue, newValue);

    diffs.push({
      field,
      label: getFieldLabel(entityType, field),
      oldValue,
      newValue,
      changed,
    });
  }

  // Sort: changed fields first, then alphabetically by label
  return diffs.sort((a, b) => {
    if (a.changed !== b.changed) {
      return a.changed ? -1 : 1;
    }
    return a.label.localeCompare(b.label);
  });
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;
  if (typeof a !== 'object') return false;

  const aObj = a as Record<string, unknown>;
  const bObj = b as Record<string, unknown>;
  const aKeys = Object.keys(aObj);
  const bKeys = Object.keys(bObj);

  if (aKeys.length !== bKeys.length) return false;

  return aKeys.every((key) => deepEqual(aObj[key], bObj[key]));
}

export function serializeForDiff(data: Record<string, unknown>): string {
  // Filter out excluded fields and sort keys for consistent output
  const filtered: Record<string, unknown> = {};
  const sortedKeys = Object.keys(data)
    .filter((key) => !excludedFields.has(key))
    .sort();

  for (const key of sortedKeys) {
    filtered[key] = data[key];
  }

  return JSON.stringify(filtered, null, 2);
}
