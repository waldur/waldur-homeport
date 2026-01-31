import { FC, useMemo } from 'react';

import { MermaidChart } from '@waldur/core/MermaidChart';
import { translate } from '@waldur/i18n';
import { CloseDialogButton } from '@waldur/modal/CloseDialogButton';
import { ModalDialog } from '@waldur/modal/ModalDialog';

import { useArrowSettings } from '../api';

const SETUP_FLOW_DIAGRAM = `
flowchart TB
    subgraph setup["Initial Setup"]
        A[Staff clicks 'Setup Arrow Integration'] --> B["Enter API credentials"]
        B --> C["Validate credentials"]
        C --> D{Valid?}
        D -->|No| B
        D -->|Yes| E["Discover Arrow customers"]
    end

    subgraph mapping["Customer Mapping"]
        E --> F["Map Arrow customers to Waldur organizations"]
        F --> G["Select which customers to sync"]
        G --> H["Save settings & mappings"]
    end

    subgraph result["Ready"]
        H --> I["Arrow Integration Active"]
        I --> J["Billing sync can begin"]
    end

    style D fill:#fff3e0,color:#000
    style I fill:#e8f5e9,color:#000
`;

const DATA_FLOW_DIAGRAM = `
flowchart LR
    subgraph arrow["Arrow API"]
        A1["whoami"]
        A2["customers"]
        A3["consumption/monthly"]
        A4["billing/erp/exports"]
    end

    subgraph waldur["Waldur Models"]
        W1["ArrowSettings"]
        W2["ArrowCustomerMapping"]
        W3["ArrowConsumptionRecord"]
        W4["ArrowBillingSyncItem"]
    end

    A1 -->|"partner_reference, partner_name"| W1
    A2 -->|"Reference, CompanyName"| W2
    A3 -->|"Total sell/buy price"| W3
    A4 -->|"Customer Total Price, Total Wholesale Price"| W4

    W2 -->|"waldur_customer"| C["Customer"]
    W3 -->|"resource"| R["Resource"]
    W4 -->|"invoice_item"| I["InvoiceItem"]

    style arrow fill:#e3f2fd,color:#000
    style waldur fill:#e8f5e9,color:#000
`;

const BILLING_SYNC_DIAGRAM = `
flowchart TB
    subgraph trigger["Sync Trigger"]
        A["Manual trigger or scheduled job"] --> B["POST /billing-sync/"]
    end

    subgraph fetch["Data Fetching"]
        B --> C["Fetch billing export from Arrow API"]
        C --> C1{Classification filter works?}
        C1 -->|Yes| D["Group lines by customer"]
        C1 -->|No| C2["Retry without classification filter"]
        C2 --> D
    end

    subgraph grouping["Customer Matching"]
        D --> D1{Customer Reference field exists?}
        D1 -->|Yes| D2["Match by arrow_reference"]
        D1 -->|No| D3["Match by End User Company Name → arrow_company_name"]
        D2 --> E["Process each customer's lines"]
        D3 --> E
    end

    subgraph process["Line Processing"]
        E --> F["For each billing line"]
        F --> G["Identify line via Line Reference || Sequence || Order Id"]
        G --> H["Parse prices: Customer Total Price / Total Wholesale Price"]
        H --> I["Create InvoiceItem + BillingSyncItem"]
    end

    subgraph sync["Sync Complete"]
        I --> J["Aggregate sell_total / buy_total"]
        J --> K["Mark ArrowBillingSync as 'synced'"]
    end

    style C1 fill:#fff3e0,color:#000
    style D1 fill:#fff3e0,color:#000
    style K fill:#e8f5e9,color:#000
`;

const getReconciliationDiagram = (priceLabel: string) => `
flowchart TB
    subgraph fetch["Fetch Billing Export"]
        A["Fetch billing data for period"] --> A1{Classification filter works?}
        A1 -->|Yes| B["Parse billing lines"]
        A1 -->|No| A2["Retry without filter"]
        A2 --> B
    end

    subgraph match["Match Records"]
        B --> C["For each unfinalized consumption record"]
        C --> D{Find by License Reference?}
        D -->|Yes| E["Billing data found"]
        D -->|No| D2{Find by ARS Subscription ID?}
        D2 -->|Yes| E
        D2 -->|No| F["Skip — no billing data"]
    end

    subgraph reconcile["Reconciliation"]
        E --> G["Compare consumed_${priceLabel} vs final_${priceLabel}"]
        G --> H{Amounts match?}
        H -->|Yes| I["Finalize record"]
        H -->|No| J["Create compensation item"]
        J --> K["adjustment = final_${priceLabel} - consumed_${priceLabel}"]
        K --> I
    end

    style A1 fill:#fff3e0,color:#000
    style D fill:#fff3e0,color:#000
    style D2 fill:#fff3e0,color:#000
    style H fill:#fff3e0,color:#000
    style I fill:#e8f5e9,color:#000
`;

const CONSUMPTION_FLOW_DIAGRAM = `
flowchart TB
    subgraph source["Arrow Consumption Data"]
        A["License subscriptions"]
        B["Cloud resources"]
        C["Service fees"]
    end

    subgraph sync["Consumption Sync"]
        A & B & C --> D["Fetch from Arrow API"]
        D --> E["Create/Update consumption records"]
    end

    subgraph mapping["Resource Mapping"]
        E --> F{Mapped to Waldur?}
        F -->|Yes| G["Link to Waldur project/resource"]
        F -->|No| H["Store as unmapped"]
    end

    subgraph finalize["Finalization"]
        G --> I["Calculate sell/buy prices"]
        H --> I
        I --> J["Mark as finalized at period end"]
    end

    style F fill:#fff3e0,color:#000
    style J fill:#e8f5e9,color:#000
`;

const SYNC_STATES = [
  {
    state: 'pending',
    description: translate('Billing sync has been scheduled but not started'),
  },
  {
    state: 'syncing',
    description: translate('Data is being fetched from Arrow and processed'),
  },
  {
    state: 'synced',
    description: translate(
      'All data has been fetched and processed successfully',
    ),
  },
  {
    state: 'reconciling',
    description: translate('Comparing Arrow amounts with Waldur invoice data'),
  },
  {
    state: 'reconciled',
    description: translate('Arrow and Waldur amounts match - sync is complete'),
  },
  {
    state: 'failed',
    description: translate(
      'An error occurred during sync - check logs for details',
    ),
  },
];

const KEY_CONCEPTS = [
  {
    term: translate('Customer Mapping'),
    description: translate(
      'Links an Arrow customer (by their reference ID) to a Waldur organization. This determines where consumption records and billing data are attributed.',
    ),
  },
  {
    term: translate('Billing Sync'),
    description: translate(
      'Periodic job that fetches billing reports from Arrow for a specific month/year. Creates line items that can be reconciled with Waldur invoices.',
    ),
  },
  {
    term: translate('Consumption Record'),
    description: translate(
      'Individual usage record from Arrow (e.g., a license subscription, cloud resource usage). Contains pricing, dates, and can be linked to Waldur resources.',
    ),
  },
  {
    term: translate('Reconciliation'),
    description: translate(
      'Process of comparing Arrow billing amounts with Waldur invoice amounts to ensure they match. Creates compensation items for discrepancies.',
    ),
  },
  {
    term: translate('License Import'),
    description: translate(
      'Process of importing Arrow licenses as Waldur marketplace resources. Select a customer mapping, choose a vendor offering, pick a project, then select licenses to import.',
    ),
  },
  {
    term: translate('Consumption History Sync'),
    description: translate(
      'Backport historical consumption data for a resource. Fetches Arrow consumption for a date range (default: last 12 months) and creates usage records for billing.',
    ),
  },
];

const RESOURCE_IMPORT_DIAGRAM = `
flowchart TB
    subgraph step1["Step 1: Select Customer"]
        A["Choose customer mapping"] --> B["Maps to Arrow customer reference"]
    end

    subgraph step2["Step 2: Select Offering"]
        B --> C["Choose vendor offering mapping"]
        C --> D["Links to Waldur marketplace offering"]
    end

    subgraph step3["Step 3: Select Project"]
        D --> E["Choose target project"]
        E --> F["Resources will be created here"]
    end

    subgraph step4["Step 4: Select Licenses"]
        F --> G["Discover available Arrow licenses"]
        G --> H["Filter by vendor name"]
        H --> I["Select licenses to import"]
    end

    subgraph result["Result"]
        I --> J["Create Waldur resources"]
        J --> K["Set backend_id = license_reference"]
        K --> L["Ready for consumption sync"]
    end

    style J fill:#e8f5e9,color:#000
    style L fill:#e8f5e9,color:#000
`;

const CONSUMPTION_SYNC_DIAGRAM = `
flowchart LR
    subgraph trigger["Sync Trigger"]
        A["Select resource with backend_id"]
        A --> B["Choose date range"]
        B --> C["Default: last 12 months"]
    end

    subgraph sync["For Each Month"]
        C --> D["Fetch Arrow consumption API"]
        D --> E["Aggregate sell/buy amounts"]
        E --> F{Already finalized?}
        F -->|Yes| G["Skip period"]
        F -->|No| H["Create/update record"]
    end

    subgraph result["Result"]
        H --> I["ArrowConsumptionRecord created"]
        I --> J["ComponentUsage updated"]
        J --> K["Invoice item created"]
    end

    style F fill:#fff3e0,color:#000
    style K fill:#e8f5e9,color:#000
`;

// Invoice Item creation types
const getInvoiceItemTypes = (priceLabel: string) => [
  {
    type: translate('Provisional'),
    source: 'arrow_consumption',
    trigger: translate(
      'Created/updated during real-time consumption sync. Used for end-of-month invoice generation.',
    ),
    nameFormat: 'Arrow consumption: {Resource.name}',
    quantity: '1',
    unitPrice: `consumed_${priceLabel}`,
    details: [
      'source: "arrow_consumption"',
      'license_reference',
      'consumed_sell, consumed_buy',
    ],
  },
  {
    type: translate('Compensation'),
    source: 'arrow_reconciliation',
    trigger: translate(
      'Created when final billing export arrives and differs from provisional amount. Added to current month invoice.',
    ),
    nameFormat:
      'Arrow adjustment: {Resource.name} (additional charge|credit for {billing_period})',
    quantity: '1',
    unitPrice: `final_${priceLabel} - consumed_${priceLabel}`,
    details: [
      'source: "arrow_reconciliation"',
      'license_reference',
      `consumed_${priceLabel}, final_${priceLabel}`,
      'adjustment',
    ],
  },
];

const CUSTOMER_MAPPING_FIELDS = [
  {
    arrowField: 'customers[].reference',
    waldurField: 'arrow_reference',
    description: translate('Arrow customer ID (e.g., XSP661245)'),
  },
  {
    arrowField: 'customers[].companyName',
    waldurField: 'arrow_company_name',
    description: translate(
      'Arrow company display name. Also used as fallback for billing sync grouping when "Customer Reference" field is absent from the export.',
    ),
  },
  {
    arrowField: 'User selection',
    waldurField: 'waldur_customer',
    description: translate('FK to Waldur Customer (organization)'),
  },
  {
    arrowField: 'User selection',
    waldurField: 'is_active',
    description: translate('Whether this mapping is enabled for sync'),
  },
];

const BILLING_SYNC_ITEM_FIELDS = [
  {
    arrowField: 'export[].Vendor Name || Service Name',
    waldurField: 'vendor_name',
    description: translate(
      'Vendor name (e.g., Microsoft, Amazon Web Services). Falls back to Service Name.',
    ),
  },
  {
    arrowField: 'export[].Product Name || Friendly Name || Description',
    waldurField: 'invoice_item.name',
    description: translate(
      'Product description for invoice item. Tries Product Name, Friendly Name, then Description.',
    ),
  },
  {
    arrowField: 'export[].Subscription Reference',
    waldurField: 'subscription_reference',
    description: translate('Arrow subscription reference ID'),
  },
  {
    arrowField: 'export[].Line Reference || Sequence || Order Id',
    waldurField: 'arrow_line_reference',
    description: translate(
      'Unique line identifier. Different export types use different fields — falls back through Line Reference, Sequence, then Order Id.',
    ),
  },
  {
    arrowField: 'export[].Classification',
    waldurField: 'classification',
    description: translate('IAAS or SAAS classification'),
  },
  {
    arrowField:
      'export[].Sell Total Price || Customer Total Price / Buy Total Price || Total Wholesale Price',
    waldurField: 'original_price',
    description: translate(
      'Invoice price from billing export. Sell price tries "Sell Total Price" then "Customer Total Price". Buy price tries "Buy Total Price" then "Total Wholesale Price".',
    ),
  },
  {
    arrowField: 'Sum of "Buy Total Price" || "Total Wholesale Price"',
    waldurField: 'ArrowBillingSync.buy_total',
    description: translate('Buy price aggregated to parent sync record'),
  },
  {
    arrowField: 'Sum of "Sell Total Price" || "Customer Total Price"',
    waldurField: 'ArrowBillingSync.sell_total',
    description: translate('Sell price aggregated to parent sync record'),
  },
  {
    arrowField: 'export[].Quantity || Qty',
    waldurField: 'invoice_item.quantity',
    description: translate(
      'Quantity for invoice item. Tries "Quantity" then "Qty", defaults to 1.',
    ),
  },
];

const CONSUMPTION_RECORD_FIELDS = [
  {
    arrowField: 'license_reference (URL param)',
    waldurField: 'license_reference',
    description: translate('Arrow license reference (e.g., XSP12345)'),
  },
  {
    arrowField: 'Sum of "Total sell price"',
    waldurField: 'consumed_sell',
    description: translate(
      'Aggregated sell amount from consumption API. Defaults to 0 if the license has no consumption data for the period.',
    ),
  },
  {
    arrowField: 'Sum of "Total buy price"',
    waldurField: 'consumed_buy',
    description: translate(
      'Aggregated buy amount from consumption API. Defaults to 0 if the license has no consumption data for the period.',
    ),
  },
  {
    arrowField:
      'Matched by "License Reference" || "ARS Subscription ID" → "Customer Total Price"',
    waldurField: 'final_sell',
    description: translate(
      'Final sell amount from billing export. Reconciliation matches by License Reference first, then falls back to ARS Subscription ID.',
    ),
  },
  {
    arrowField:
      'Matched by "License Reference" || "ARS Subscription ID" → "Total Wholesale Price"',
    waldurField: 'final_buy',
    description: translate(
      'Final buy amount from billing export. Same matching logic as final_sell.',
    ),
  },
  {
    arrowField: 'Sync task parameter',
    waldurField: 'billing_period',
    description: translate('First day of billing month (date)'),
  },
  {
    arrowField: 'FK',
    waldurField: 'resource',
    description: translate('Link to Waldur Resource'),
  },
  {
    arrowField: 'FK',
    waldurField: 'invoice_item',
    description: translate('Link to provisional InvoiceItem'),
  },
  {
    arrowField: 'FK',
    waldurField: 'compensation_item',
    description: translate(
      'Link to compensation InvoiceItem (if adjustment needed)',
    ),
  },
];

const RESOURCE_ATTRIBUTE_FIELDS = [
  {
    arrowField: 'License Reference || ARS Subscription ID',
    waldurField: 'attributes["arrow_license_reference"]',
    description: translate(
      'Must be set on Resource to enable consumption sync. During reconciliation, matched against both "License Reference" and "ARS Subscription ID" fields in the billing export.',
    ),
  },
  {
    arrowField: 'Vendor Subscription ID',
    waldurField: 'backend_id',
    description: translate(
      'Used as primary key for matching billing export lines',
    ),
  },
  {
    arrowField: '(display only)',
    waldurField: 'name',
    description: translate('Used in invoice item descriptions'),
  },
];

const SETTINGS_FIELDS = [
  {
    arrowField: 'whoami.partner_info.reference',
    waldurField: 'partner_reference',
    description: translate('Arrow partner reference (auto-discovered)'),
  },
  {
    arrowField: 'whoami.partner_info.name',
    waldurField: 'partner_name',
    description: translate('Arrow partner name (auto-discovered)'),
  },
  {
    arrowField: 'User input',
    waldurField: 'api_url',
    description: translate('Arrow API base URL'),
  },
  {
    arrowField: 'User input',
    waldurField: 'api_key',
    description: translate('API key for authentication'),
  },
  {
    arrowField: 'User selection',
    waldurField: 'export_type_reference',
    description: translate('Billing export template reference'),
  },
  {
    arrowField: 'User input',
    waldurField: 'classification_filter',
    description: translate(
      'Filter for IAAS/SAAS classification. Optional — if the Arrow API rejects this filter for the chosen export type, the system automatically retries without it.',
    ),
  },
  {
    arrowField: 'User selection',
    waldurField: 'invoice_price_source',
    description: translate(
      'Which price to use for invoicing: sell (default) or buy',
    ),
  },
];

interface FieldMappingTableProps {
  fields: Array<{
    arrowField: string;
    waldurField: string;
    description: string;
  }>;
  sourceLabel: string;
  targetLabel?: string;
}

const FieldMappingTable: FC<FieldMappingTableProps> = ({
  fields,
  sourceLabel,
  targetLabel,
}) => (
  <div className="table-responsive">
    <table className="table align-middle table-row-bordered fs-7 gy-3 gx-4 mb-0">
      <thead>
        <tr className="text-start text-muted fw-bold fs-8 text-uppercase gs-0">
          <th>{sourceLabel}</th>
          <th>{targetLabel || translate('Waldur Model.Field')}</th>
          <th>{translate('Description')}</th>
        </tr>
      </thead>
      <tbody className="text-gray-600">
        {fields.map((field, idx) => (
          <tr key={idx}>
            <td>
              <code className="text-primary">{field.arrowField}</code>
            </td>
            <td>
              <code>{field.waldurField}</code>
            </td>
            <td className="text-muted">{field.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export const ArrowHowItWorksDialog: FC = () => {
  const { data: settings } = useArrowSettings();
  const priceSource = settings?.invoice_price_source || 'sell';
  const priceLabel =
    priceSource === 'buy' ? translate('Buy') : translate('Sell');

  const reconciliationDiagram = useMemo(
    () => getReconciliationDiagram(priceSource),
    [priceSource],
  );
  const invoiceItemTypes = useMemo(
    () => getInvoiceItemTypes(priceSource),
    [priceSource],
  );

  return (
    <ModalDialog
      title={translate('How Arrow Integration works')}
      closeButton
      footer={<CloseDialogButton label={translate('Close')} />}
    >
      <div className="d-flex flex-column gap-8">
        {/* Overview */}
        <section>
          <div className="alert alert-info">
            <strong>{translate('What is Arrow Integration?')}</strong>
            <p className="mb-0 mt-2">
              {translate(
                'Arrow Integration connects Waldur to ArrowSphere, a cloud distribution platform. This integration enables automatic synchronization of billing data, consumption records, and customer information between the two systems.',
              )}
            </p>
          </div>
          {settings && (
            <div className="alert alert-warning mt-4 mb-0">
              <strong>{translate('Invoice price source')}:</strong>{' '}
              <code>{priceLabel}</code>.{' '}
              {translate(
                'All invoice items, provisional amounts, and reconciliation adjustments use {price} prices.',
                { price: priceLabel.toLowerCase() },
              )}
            </div>
          )}
        </section>

        {/* Data Flow Diagram */}
        <section>
          <h4 className="mb-4">{translate('Data flow overview')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Arrow API data is mapped to Waldur models and linked to existing resources, customers, and invoices.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={DATA_FLOW_DIAGRAM} className="text-center" />
          </div>
        </section>

        {/* Setup Flow */}
        <section>
          <h4 className="mb-4">{translate('Initial setup flow')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The setup wizard guides you through connecting to Arrow and mapping customers to Waldur organizations.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={SETUP_FLOW_DIAGRAM} className="text-center" />
          </div>
        </section>

        {/* Field Mappings Section */}
        <section>
          <h4 className="mb-4">{translate('Field mappings')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'The following tables show how Arrow API fields map to Waldur database models.',
            )}
          </p>

          {/* Settings Fields */}
          <div className="mb-6">
            <h5 className="mb-3">{translate('ArrowSettings')}</h5>
            <p className="text-muted small mb-3">
              {translate(
                'Stores API configuration and partner info. Only one active settings record per deployment.',
              )}
            </p>
            <FieldMappingTable
              fields={SETTINGS_FIELDS}
              sourceLabel={translate('Arrow API Field')}
              targetLabel="ArrowSettings"
            />
          </div>

          {/* Customer Mapping Fields */}
          <div className="mb-6">
            <h5 className="mb-3">{translate('ArrowCustomerMapping')}</h5>
            <p className="text-muted small mb-3">
              {translate(
                'Maps Arrow customer references (XSP...) to Waldur organizations.',
              )}
            </p>
            <FieldMappingTable
              fields={CUSTOMER_MAPPING_FIELDS}
              sourceLabel={translate('Arrow API Field')}
              targetLabel="ArrowCustomerMapping"
            />
          </div>

          {/* Billing Sync Item Fields */}
          <div className="mb-6">
            <h5 className="mb-3">{translate('ArrowBillingSyncItem')}</h5>
            <p className="text-muted small mb-3">
              {translate(
                'Links Arrow billing export lines to Waldur InvoiceItems.',
              )}
            </p>
            <FieldMappingTable
              fields={BILLING_SYNC_ITEM_FIELDS}
              sourceLabel={translate('Arrow Export Field')}
              targetLabel="ArrowBillingSyncItem"
            />
          </div>

          {/* Consumption Record Fields */}
          <div className="mb-6">
            <h5 className="mb-3">{translate('ArrowConsumptionRecord')}</h5>
            <p className="text-muted small mb-3">
              {translate(
                'Tracks real-time consumption and final billing amounts for reconciliation.',
              )}
            </p>
            <FieldMappingTable
              fields={CONSUMPTION_RECORD_FIELDS}
              sourceLabel={translate('Arrow API Field')}
              targetLabel="ArrowConsumptionRecord"
            />
          </div>

          {/* Resource Attribute Fields */}
          <div className="mb-6">
            <h5 className="mb-3">{translate('Resource attributes')}</h5>
            <p className="text-muted small mb-3">
              {translate(
                'Waldur Resources must have these attributes set to be matched with Arrow data.',
              )}
            </p>
            <FieldMappingTable
              fields={RESOURCE_ATTRIBUTE_FIELDS}
              sourceLabel={translate('Arrow Field')}
              targetLabel="Resource"
            />
          </div>
        </section>

        {/* Billing Sync Flow */}
        <section>
          <h4 className="mb-4">{translate('Billing synchronization')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Billing sync fetches monthly billing reports from Arrow and creates corresponding records in Waldur.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart code={BILLING_SYNC_DIAGRAM} className="text-center" />
          </div>
        </section>

        {/* Reconciliation Flow */}
        <section>
          <h4 className="mb-4">{translate('Reconciliation process')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'After syncing, reconciliation compares Arrow amounts with Waldur invoices. Discrepancies create compensation items.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={reconciliationDiagram}
              className="text-center"
            />
          </div>
          <div className="alert alert-secondary mt-4">
            <strong>{translate('Two-stage billing model:')}</strong>
            <ol className="mb-0 mt-2">
              <li>
                {translate(
                  'Real-time consumption tracking via consumption API creates provisional invoice items',
                )}
              </li>
              <li>
                {translate(
                  'When official billing export arrives, amounts are compared',
                )}
              </li>
              <li>
                {translate(
                  'Compensation items are created for any discrepancies',
                )}{' '}
                (
                <code>
                  adjustment = final_{priceSource} - consumed_{priceSource}
                </code>
                )
              </li>
            </ol>
          </div>
        </section>

        {/* Invoice Item Creation */}
        <section>
          <h4 className="mb-4">{translate('Invoice item creation')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Arrow integration creates three types of invoice items depending on the sync stage.',
            )}
          </p>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-7 gy-4 gx-4">
              <thead>
                <tr className="text-start text-muted fw-bold fs-8 text-uppercase gs-0">
                  <th style={{ width: '15%' }}>{translate('Type')}</th>
                  <th style={{ width: '25%' }}>{translate('Trigger')}</th>
                  <th style={{ width: '25%' }}>{translate('Name format')}</th>
                  <th style={{ width: '15%' }}>{translate('Unit price')}</th>
                  <th style={{ width: '20%' }}>
                    {translate('Details (metadata)')}
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {invoiceItemTypes.map((item) => (
                  <tr key={item.source}>
                    <td className="fw-bold">
                      <span className="d-block">{item.type}</span>
                      <code className="text-muted small">{item.source}</code>
                    </td>
                    <td className="small">{item.trigger}</td>
                    <td>
                      <code className="small">{item.nameFormat}</code>
                    </td>
                    <td>
                      <code className="small">{item.unitPrice}</code>
                      <div className="text-muted small mt-1">
                        {translate('qty')}: {item.quantity}
                      </div>
                    </td>
                    <td>
                      <ul className="list-unstyled small mb-0">
                        {item.details.map((detail, idx) => (
                          <li key={idx}>
                            <code className="text-muted">{detail}</code>
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert alert-info mt-4">
            <strong>{translate('Flow:')}</strong>{' '}
            {translate(
              'Provisional items are created during consumption sync and used for end-of-month invoicing. When the final billing export arrives (typically next month), if amounts differ, a compensation item is added to the current month invoice to adjust the difference.',
            )}
          </div>
        </section>

        {/* Consumption Records Flow */}
        <section>
          <h4 className="mb-4">{translate('Consumption records')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Consumption records track individual usage items from Arrow and can be mapped to Waldur resources for detailed reporting.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={CONSUMPTION_FLOW_DIAGRAM}
              className="text-center"
            />
          </div>
        </section>

        {/* Resource Import Flow */}
        <section>
          <h4 className="mb-4">{translate('Importing Arrow licenses')}</h4>
          <p className="text-muted mb-4">
            {translate(
              'Arrow licenses can be imported as Waldur marketplace resources. The import wizard guides you through selecting a customer, offering, project, and licenses.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={RESOURCE_IMPORT_DIAGRAM}
              className="text-center"
            />
          </div>
          <div className="alert alert-info mt-4">
            <strong>{translate('Resources tab:')}</strong>{' '}
            {translate(
              'The Resources tab shows all Waldur resources that can be linked to Arrow. Use "Set backend ID" to manually link a resource to an Arrow license, or use the Import button to create new resources from Arrow licenses.',
            )}
          </div>
        </section>

        {/* Consumption History Sync */}
        <section>
          <h4 className="mb-4">
            {translate('Syncing historical consumption')}
          </h4>
          <p className="text-muted mb-4">
            {translate(
              'After importing a license or linking a resource to Arrow, you can backport historical consumption data. This creates usage records for billing.',
            )}
          </p>
          <div className="border rounded p-4">
            <MermaidChart
              code={CONSUMPTION_SYNC_DIAGRAM}
              className="text-center"
            />
          </div>
          <div className="alert alert-secondary mt-4">
            <strong>{translate('How to sync historical consumption:')}</strong>
            <ol className="mb-0 mt-2">
              <li>
                {translate(
                  'Go to the Resources tab and find the resource with an Arrow backend ID',
                )}
              </li>
              <li>
                {translate(
                  'Click the actions menu and select "Sync consumption history"',
                )}
              </li>
              <li>
                {translate(
                  'Choose the date range (defaults to last 12 months)',
                )}
              </li>
              <li>
                {translate(
                  'Click Sync to fetch consumption data and create usage records',
                )}
              </li>
            </ol>
          </div>
        </section>

        {/* Sync States */}
        <section>
          <h4 className="mb-4">{translate('Sync states')}</h4>
          <div className="table-responsive">
            <table className="table align-middle table-row-bordered fs-6 gy-4 gx-5">
              <thead>
                <tr className="text-start text-muted fw-bold fs-7 text-uppercase gs-0">
                  <th style={{ width: '20%' }}>{translate('State')}</th>
                  <th>{translate('Description')}</th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                {SYNC_STATES.map((item) => (
                  <tr key={item.state}>
                    <td className="fw-bold text-gray-800">
                      <code>{item.state}</code>
                    </td>
                    <td>{item.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Key Concepts */}
        <section>
          <h4 className="mb-4">{translate('Key concepts')}</h4>
          {KEY_CONCEPTS.map((concept) => (
            <div key={concept.term} className="mb-4">
              <h6 className="fw-bold">{concept.term}</h6>
              <p className="text-muted mb-0">{concept.description}</p>
            </div>
          ))}
        </section>
      </div>
    </ModalDialog>
  );
};
