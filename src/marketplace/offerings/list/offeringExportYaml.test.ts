import { load } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import { OfferingExportData } from 'waldur-js-client';

import { generateOfferingExportYaml } from './offeringExportYaml';

const makeExportData = (
  overrides: Partial<OfferingExportData> = {},
): OfferingExportData => ({
  offering: {
    name: 'Kubernetes',
    description: 'Managed clusters',
    full_description: '',
    vendor_details: '',
    getting_started: '',
    integration_guide: '',
    type: 'Marketplace.Basic',
    shared: true,
    billable: true,
    state: 'Active',
    category_name: 'Containers',
    country: 'EE',
    latitude: 0,
    longitude: null,
    access_url: '',
    paused_reason: '',
    attributes: { tier: 'premium' },
    options: { order: ['size'], options: { size: { type: 'integer' } } },
  },
  components: [
    {
      type: 'hours',
      name: 'Hours',
      description: '',
      billing_type: 'usage',
      measured_unit: '',
      unit_factor: 1,
      limit_period: null,
      limit_amount: 0,
      article_code: '',
      backend_id: '',
    },
  ],
  plans: [
    {
      name: 'Default',
      description: '',
      unit_price: 0,
      unit: 'month',
      archived: false,
      max_amount: 0,
      article_code: '',
      backend_id: '',
      components: [
        { component_type: 'hours', amount: 0, price: 1.5, future_price: 0 },
      ],
    },
  ],
  screenshots: [],
  files: [],
  endpoints: [],
  organization_groups: [],
  terms_of_service: [],
  plugin_options: { auto_approve_remote_orders: false },
  resource_options: {},
  ...overrides,
});

const roundTrip = (data: OfferingExportData) =>
  load(generateOfferingExportYaml(data)) as Record<string, any>;

describe('generateOfferingExportYaml', () => {
  it('keeps empty strings and zeroes instead of writing null', () => {
    const parsed = roundTrip(makeExportData());
    const component = parsed.components[0];
    const plan = parsed.plans[0];

    expect(component.measured_unit).toBe('');
    expect(component.limit_amount).toBe(0);
    expect(component.limit_period).toBeNull();
    expect(plan.max_amount).toBe(0);
    expect(plan.unit_price).toBe(0);
    expect(plan.components[0].future_price).toBe(0);
    expect(plan.components[0].amount).toBe(0);
    expect(parsed.offering.latitude).toBe(0);
    expect(parsed.offering.longitude).toBeNull();
    expect(parsed.offering.access_url).toBe('');
  });

  it('round-trips names, units and types with special characters', () => {
    const tricky = [
      'key: value',
      'value # not a comment',
      '"double" quoted',
      "'single' quoted",
      'line one\nline two',
      'yes',
      '1_000',
      '- dash',
    ];
    tricky.forEach((value) => {
      const data = makeExportData();
      data.offering.name = value;
      data.offering.category_name = value;
      data.components[0].name = value;
      data.components[0].type = value;
      data.components[0].measured_unit = value;
      data.plans[0].name = value;
      data.plans[0].unit = value;
      data.plans[0].components[0].component_type = value;

      const parsed = roundTrip(data);

      expect(parsed.offering.name).toBe(value);
      expect(parsed.offering.category_name).toBe(value);
      expect(parsed.components[0].name).toBe(value);
      expect(parsed.components[0].type).toBe(value);
      expect(parsed.components[0].measured_unit).toBe(value);
      expect(parsed.plans[0].name).toBe(value);
      expect(parsed.plans[0].unit).toBe(value);
      expect(parsed.plans[0].components[0].component_type).toBe(value);
    });
  });

  it('writes options and attributes as mappings', () => {
    const data = makeExportData();
    const parsed = roundTrip(data);

    expect(parsed.offering.attributes).toEqual(data.offering.attributes);
    expect(parsed.offering.options).toEqual(data.offering.options);
    expect(parsed.plugin_options).toEqual(data.plugin_options);
    expect(parsed.resource_options).toEqual({});
  });

  it('preserves the section and field order', () => {
    const parsed = roundTrip(
      makeExportData({ secret_options: { token: 'x' } }),
    );

    expect(Object.keys(parsed)).toEqual([
      'offering',
      'components',
      'plans',
      'screenshots',
      'files',
      'endpoints',
      'organization_groups',
      'terms_of_service',
      'plugin_options',
      'resource_options',
      'secret_options',
    ]);
    expect(Object.keys(parsed.offering)).toEqual([
      'name',
      'description',
      'full_description',
      'vendor_details',
      'getting_started',
      'integration_guide',
      'type',
      'shared',
      'billable',
      'state',
      'category_name',
      'country',
      'latitude',
      'longitude',
      'access_url',
      'paused_reason',
      'attributes',
      'options',
    ]);
    expect(Object.keys(parsed.components[0])).toEqual([
      'type',
      'name',
      'description',
      'billing_type',
      'measured_unit',
      'unit_factor',
      'limit_period',
      'limit_amount',
      'article_code',
      'backend_id',
    ]);
    expect(Object.keys(parsed.plans[0])).toEqual([
      'name',
      'description',
      'unit_price',
      'unit',
      'archived',
      'max_amount',
      'article_code',
      'backend_id',
      'components',
    ]);
  });

  it('writes empty list sections and omits empty components and plans', () => {
    const parsed = roundTrip(
      makeExportData({
        components: [],
        plans: [],
        plugin_options: undefined,
        resource_options: undefined,
      }),
    );

    expect(Object.keys(parsed)).toEqual([
      'offering',
      'screenshots',
      'files',
      'endpoints',
      'organization_groups',
      'terms_of_service',
    ]);
    expect(parsed.screenshots).toEqual([]);
  });

  it('writes list items at the same indentation as their key', () => {
    const yaml = generateOfferingExportYaml(makeExportData());

    expect(yaml).toContain("components:\n- type: 'hours'\n");
  });
});
