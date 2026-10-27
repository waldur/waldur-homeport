import type { Decorator, Meta, StoryObj } from '@storybook/react-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FC } from 'react';
import { Form } from 'react-final-form';
import { Provider } from 'react-redux';
import { expect, within } from 'storybook/test';

import { configureAuthCore } from 'waldur-auth-core';

import { DrawerProvider } from '@/drawer/DrawerContext';
import { ModalProvider } from '@/modal/ModalContext';
import store from '@/store/store';

import { BillingSyncItemsDialog } from './billing/BillingSyncItemsDialog';
import { ConsumptionRecordsList } from './consumption/ConsumptionRecordsList';
import { ArrowLicensesList } from './mappings/ArrowLicensesList';
import { CustomerBillingSummaryDialog } from './mappings/CustomerBillingSummaryDialog';
import { CustomerMappingExpandableRow } from './mappings/CustomerMappingExpandableRow';
import { SuggestedMatches } from './mappings/SuggestedMatches';
import { WaldurResourcesList } from './mappings/WaldurResourcesList';
import { ViewConsumptionHistoryDialog } from './resources/ViewConsumptionHistoryDialog';
import { ArrowHowItWorksDialog } from './settings/ArrowHowItWorksDialog';
import { ArrowSettingsCard } from './settings/ArrowSettingsCard';
import { Step2CustomerDiscovery } from './setup/Step2CustomerDiscovery';
import { Step3Preview } from './setup/Step3Preview';

/**
 * Every table and property list in the Arrow admin screens, fed fixed
 * fixtures through a stubbed fetch, so the screens render without a backend
 * and look the same on every run. Used to compare the screens before and
 * after the hand-rolled table migration (#563).
 */

const range = (n: number) => Array.from({ length: n }, (_, i) => i + 1);
const pad = (n: number) => String(n).padStart(2, '0');

const SETTINGS = {
  uuid: 'settings-1',
  api_url: 'https://xsp.arrow.com/index.php/api',
  partner_name: 'OpenNode Cloud',
  partner_reference: 'XSP-PARTNER-4411',
  export_type_reference: null,
  invoice_price_source: 'sell',
  invoice_item_prefix: '',
  sync_enabled: true,
  created: '2026-03-02T09:15:00Z',
};

const CONSUMPTION_RECORDS = range(14).map((i) => ({
  uuid: `record-${i}`,
  license_reference: `XSP${100200 + i}`,
  resource_name: i % 5 === 0 ? null : `M365 Business Basic ${i}`,
  billing_period: `2026-${pad(((i - 1) % 12) + 1)}-01`,
  customer_name: 'University of Tartu',
  project_name: 'Office licences',
  consumed_sell: (120 + i * 7.5).toFixed(2),
  final_sell: i % 3 === 0 ? null : (118 + i * 7.5).toFixed(2),
  is_finalized: i % 3 !== 0,
  is_reconciled: i % 4 === 0,
  created: `2026-${pad(((i - 1) % 12) + 1)}-03T08:00:00Z`,
}));

const BILLING_LINES = range(14).map((i) => ({
  vendor_name: i % 2 ? 'Microsoft' : 'Acronis',
  license_reference: i % 6 === 0 ? null : `XSP${100200 + i}`,
  offer_sku: `SKU-${4000 + i}`,
  quantity: i % 4 === 0 ? null : i,
  sell_price: i % 7 === 0 ? null : (40 + i * 3.25).toFixed(2),
}));

const CONSUMPTION_LINES = range(5).map((i) => ({
  resource_name: i === 3 ? null : `M365 Business Basic ${i}`,
  license_reference: `XSP${100200 + i}`,
  sell_price: i === 4 ? null : (55 + i).toFixed(2),
  error: i === 4 ? 'License not found in Arrow' : null,
}));

const ARROW_DATA = {
  arrow_reference: 'XSP-CUST-9921',
  arrow_company_name: 'University of Tartu',
  waldur_customer_name: 'University of Tartu',
  period: '2026-09',
  total_customer_resources: 12,
  resources_with_backend_id: 5,
  matched_resources: 0,
  billing_available: true,
  billing_lines: BILLING_LINES,
  billing_total_sell: '1265.40',
  consumption_lines: CONSUMPTION_LINES,
  consumption_total_sell: '231.00',
  error: null,
};

const MAPPING = {
  uuid: 'mapping-1',
  arrow_reference: 'XSP-CUST-9921',
  arrow_company_name: 'University of Tartu',
  waldur_customer_name: 'University of Tartu',
} as any;

const LICENSES = range(14).map((i) => ({
  license_reference: `XSP${100200 + i}`,
  vendor_name: i % 2 ? 'Microsoft' : null,
  offer_name: i % 3 ? `Microsoft 365 Business Basic (${i})` : null,
  friendly_name: i % 3 ? null : `Friendly name ${i}`,
  offer_sku: `SKU-${4000 + i}`,
})) as any[];

const RESOURCES = range(12).map((i) => ({
  uuid: `resource-${i}`,
  name: `Office licences ${i}`,
  project_name: i % 4 === 0 ? null : 'Teaching',
  offering_name: 'Microsoft 365',
  backend_id: i % 3 === 0 ? `XSP${100200 + i}` : null,
  state: i % 5 === 0 ? 'Erred' : i % 4 === 0 ? 'Creating' : 'OK',
})) as any[];

const SUGGESTIONS = [
  {
    resource_name: 'Office licences 1',
    resource_uuid: 'resource-1',
    license_reference: 'XSP100201',
    license_name: 'Microsoft 365 Business Basic',
    confidence: 0.92,
  },
  {
    resource_name: 'Office licences 2',
    resource_uuid: 'resource-2',
    license_reference: 'XSP100202',
    confidence: 0.61,
  },
  {
    resource_name: 'Office licences 7',
    resource_uuid: 'resource-7',
    license_reference: 'XSP100207',
    license_name: 'Acronis Cyber Protect',
    confidence: 0.34,
  },
] as any[];

const BILLING_SYNC = {
  uuid: 'sync-1',
  arrow_reference: 'BILL-2026-09',
  items: range(16).map((i) => ({
    uuid: `item-${i}`,
    arrow_line_reference: `LINE-${7000 + i}`,
    subscription_reference: `SUB-${3000 + i}`,
    vendor_name: i % 2 ? 'Microsoft' : 'Acronis',
    description: `Microsoft 365 Business Basic, seat ${i}`,
    quantity: i,
    original_price: (12.5 * i).toFixed(2),
  })),
} as any;

const RESOURCE = {
  uuid: 'resource-1',
  name: 'Office licences 1',
  backend_id: 'XSP100201',
} as any;

const WIZARD_VALUES = {
  api_url: 'https://xsp.arrow.com/index.php/api',
  api_key: 'not-a-real-key',
  credentialsValid: true,
  partnerInfo: {
    company_name: 'OpenNode Cloud',
    reference: 'XSP-PARTNER-4411',
  },
  discoveryComplete: true,
  customers: range(6).map((i) => ({
    reference: `XSP-CUST-${9920 + i}`,
    companyName: [
      'University of Tartu',
      'Tallinn University of Technology',
      'Estonian University of Life Sciences',
      'CSC – IT Center for Science',
      'Uppsala University',
      'Institute of Cybernetics',
    ][i - 1],
  })),
  waldurCustomers: [
    { uuid: 'org-1', name: 'University of Tartu' },
    { uuid: 'org-2', name: 'TalTech' },
    { uuid: 'org-4', name: 'CSC' },
  ],
  suggestions: [
    {
      arrow_customer: { reference: 'XSP-CUST-9921' },
      suggested_waldur_customer: { uuid: 'org-1', name: 'University of Tartu' },
      confidence: 0.95,
      existing_mapping: true,
    },
    {
      arrow_customer: { reference: 'XSP-CUST-9922' },
      suggested_waldur_customer: { uuid: 'org-2', name: 'TalTech' },
      confidence: 0.81,
      existing_mapping: false,
    },
  ],
  exportTypes: [
    {
      reference: 'EXP-STANDARD',
      name: 'Standard billing export',
      recommended: true,
      compatible: true,
      required_fields_found: 12,
      required_fields_total: 12,
      important_fields_found: 7,
      important_fields_total: 8,
      missing_required_fields: [],
    },
    {
      reference: 'EXP-LEGACY',
      name: 'Legacy export',
      recommended: false,
      compatible: false,
      required_fields_found: 9,
      required_fields_total: 12,
      important_fields_found: 3,
      important_fields_total: 8,
      missing_required_fields: ['license_reference', 'sell_price', 'period'],
    },
  ],
  selectedMappings: { 'XSP-CUST-9921': 'org-1', 'XSP-CUST-9922': 'org-2' },
};

// Answers the Arrow endpoints with the fixtures above, the way the backend
// would (list endpoints with an X-Result-Count header); every other request
// goes to the real fetch.
const json = (body: unknown, count?: number) =>
  new Response(JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      ...(count === undefined ? {} : { 'X-Result-Count': String(count) }),
    },
  });

const ROUTES: Array<[RegExp, (url: URL) => Response]> = [
  [/\/api\/admin\/arrow\/settings\/$/, () => json([SETTINGS], 1)],
  [
    /\/api\/admin\/arrow\/customer-mappings\/[^/]+\/fetch_arrow_data\/$/,
    () => json(ARROW_DATA),
  ],
  [
    /\/api\/admin\/arrow\/consumption-records\/$/,
    (url) => {
      const page = Number(url.searchParams.get('page') || 1);
      const size = Number(url.searchParams.get('page_size') || 10);
      return json(
        CONSUMPTION_RECORDS.slice((page - 1) * size, page * size),
        CONSUMPTION_RECORDS.length,
      );
    },
  ],
  [
    /\/api\/admin\/arrow\/billing-sync-items\/$/,
    () => json(BILLING_SYNC.items, BILLING_SYNC.items.length),
  ],
  [
    /\/api\/admin\/arrow\/customer-mappings\/[^/]+\/link_resource\/$/,
    () => json({}),
  ],
];

// The SDK client's interceptors read the auth configuration that the app
// sets up at boot; an anonymous one is enough for fixture responses.
const noStorage = {
  get: () => null,
  set: () => undefined,
  remove: () => undefined,
};
configureAuthCore({
  storage: {
    token: noStorage,
    method: noStorage,
    impersonation: noStorage,
    language: noStorage,
  },
  getApiEndpoint: () => '/',
  isConfigLoaded: () => false,
  isOidcAccessTokenEnabled: () => false,
  onSessionExpired: () => undefined,
});

// Installed for each story and removed after it, so no other story sees it.
const stubArrowApi = () => {
  const realFetch = window.fetch;
  window.fetch = (input, init) => {
    const href =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;
    const url = new URL(href, window.location.origin);
    const route = ROUTES.find(([pattern]) => pattern.test(url.pathname));
    return route ? Promise.resolve(route[1](url)) : realFetch(input, init);
  };
  return () => {
    window.fetch = realFetch;
  };
};

const withArrowProviders: Decorator = (Story) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ModalProvider>
          <DrawerProvider>
            <div className="max-w-[1100px] p-3">
              <Story />
            </div>
          </DrawerProvider>
        </ModalProvider>
      </QueryClientProvider>
    </Provider>
  );
};

const meta: Meta = {
  title: 'Arrow/Tables and property lists',
  decorators: [withArrowProviders],
  beforeEach: stubArrowApi,
  parameters: { layout: 'fullscreen' },
};
export default meta;

type Story = StoryObj;

// Each story waits for one fixture value, so the smoke run in CI fails when
// a screen renders without its data (a stub that no longer matches, say),
// not only when it throws. Dialogs render into the body, outside the canvas.
const showsFixture =
  (text: string): Story['play'] =>
  async () => {
    await expect(
      await within(document.body).findByText(text),
    ).toBeInTheDocument();
  };

const wizardProps = {
  title: 'Arrow setup',
  submitLabel: 'Next',
  steps: [],
  onPrev: () => undefined,
  setLoading: () => undefined,
};

const WizardStep: FC<{ step: FC<any>; index: number }> = ({
  step: Step,
  index,
}) => (
  <Form
    onSubmit={() => undefined}
    initialValues={WIZARD_VALUES}
    render={(formProps) => (
      <Step {...formProps} {...wizardProps} step={index} />
    )}
  />
);

export const ConsumptionRecords: Story = {
  play: showsFixture('XSP100201'),
  render: () => <ConsumptionRecordsList />,
};

export const ConsumptionHistoryDialog: Story = {
  play: showsFixture('2026-01-01'),
  render: () => (
    <ViewConsumptionHistoryDialog resolve={{ resource: RESOURCE }} />
  ),
};

export const BillingSyncItems: Story = {
  play: showsFixture('LINE-7001'),
  render: () => (
    <BillingSyncItemsDialog resolve={{ billingSync: BILLING_SYNC }} />
  ),
};

export const BillingSummaryDialog: Story = {
  play: showsFixture('XSP-CUST-9921'),
  render: () => <CustomerBillingSummaryDialog resolve={{ mapping: MAPPING }} />,
};

export const MappingExpandableRow: Story = {
  play: showsFixture('SKU-4001'),
  render: () => <CustomerMappingExpandableRow row={MAPPING} />,
};

export const LinkResourcesLists: Story = {
  play: showsFixture('Acronis Cyber Protect'),
  render: () => (
    <div className="flex flex-col gap-3">
      <SuggestedMatches mappingUuid="mapping-1" suggestions={SUGGESTIONS} />
      <ArrowLicensesList licenses={LICENSES} />
      <WaldurResourcesList resources={RESOURCES} />
    </div>
  ),
};

export const SettingsCard: Story = {
  play: showsFixture('OpenNode Cloud'),
  render: () => <ArrowSettingsCard />,
};

export const HowItWorksDialog: Story = {
  play: showsFixture('Sync states'),
  render: () => <ArrowHowItWorksDialog />,
};

export const SetupCustomerMapping: Story = {
  play: showsFixture('Institute of Cybernetics'),
  render: () => <WizardStep step={Step2CustomerDiscovery} index={1} />,
};

export const SetupPreview: Story = {
  play: showsFixture('EXP-LEGACY'),
  render: () => <WizardStep step={Step3Preview} index={2} />,
};
